import {
  Injectable,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import * as multer from 'multer';
import * as multerS3 from 'multer-s3';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class UploadService {
  private s3Client: S3Client;
  private bucket: string;
  private maxFileSize: number;

  constructor(private configService: ConfigService) {
    this.bucket = this.configService.get('MINIO_BUCKET', 'discord-files');
    this.maxFileSize = this.configService.get('MAX_FILE_SIZE', 104857600); // 100MB

    const endpoint = this.configService.get('MINIO_ENDPOINT', 'localhost');
    const port = this.configService.get('MINIO_PORT', '9000');
    const accessKey = this.configService.get('MINIO_ACCESS_KEY', 'minioadmin');
    const secretKey = this.configService.get('MINIO_SECRET_KEY', 'minioadmin');
    const useSSL = this.configService.get('MINIO_USE_SSL', 'false') === 'true';

    this.s3Client = new S3Client({
      region: 'us-east-1',
      endpoint: `http://${endpoint}:${port}`,
      credentials: {
        accessKeyId: accessKey,
        secretAccessKey: secretKey,
      },
      forcePathStyle: true,
    });
  }

  async uploadFile(file: Express.Multer.File, userId: string) {
    if (!file) {
      throw new BadRequestException('No file provided');
    }

    // Validate file size
    if (file.size > this.maxFileSize) {
      throw new BadRequestException(
        `File size exceeds the maximum limit of ${this.maxFileSize / 1024 / 1024}MB`,
      );
    }

    // Validate file type
    const allowedTypes = [
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp',
      'image/svg+xml',
      'video/mp4',
      'video/webm',
      'audio/mpeg',
      'audio/ogg',
      'application/pdf',
      'text/plain',
      'application/zip',
      'application/x-zip-compressed',
    ];

    if (!allowedTypes.includes(file.mimetype)) {
      throw new BadRequestException('File type not allowed');
    }

    const fileKey = `${userId}/${uuidv4()}-${file.originalname}`;

    try {
      const command = new PutObjectCommand({
        Bucket: this.bucket,
        Key: fileKey,
        Body: file.buffer,
        ContentType: file.mimetype,
        Metadata: {
          originalName: file.originalname,
          uploadedBy: userId,
        },
      });

      await this.s3Client.send(command);

      const url = await this.getSignedUrl(fileKey);

      return {
        id: uuidv4(),
        url,
        filename: file.originalname,
        size: file.size,
        mimetype: file.mimetype,
        key: fileKey,
      };
    } catch (error) {
      console.error('Upload error:', error);
      throw new InternalServerErrorException('Failed to upload file');
    }
  }

  async getSignedUrl(key: string, expiresIn = 3600) {
    try {
      const command = new GetObjectCommand({
        Bucket: this.bucket,
        Key: key,
      });

      return await getSignedUrl(this.s3Client, command, { expiresIn });
    } catch (error) {
      console.error('Get URL error:', error);
      throw new InternalServerErrorException('Failed to get file URL');
    }
  }

  async deleteFile(key: string, userId: string) {
    try {
      const command = new DeleteObjectCommand({
        Bucket: this.bucket,
        Key: key,
      });

      await this.s3Client.send(command);

      return { success: true };
    } catch (error) {
      console.error('Delete error:', error);
      throw new InternalServerErrorException('Failed to delete file');
    }
  }

  getMulterOptions() {
    return {
      storage: multerS3({
        s3: this.s3Client,
        bucket: this.bucket,
        key: (req: any, file: Express.Multer.File, cb: (error: Error | null, key: string) => void) => {
          const userId = req.user?.id || 'anonymous';
          cb(null, `${userId}/${uuidv4()}-${file.originalname}`);
        },
      }),
      limits: {
        fileSize: this.maxFileSize,
      },
      fileFilter: (
        req: any,
        file: Express.Multer.File,
        cb: multer.FileFilterCallback,
      ) => {
        const allowedTypes = [
          'image/jpeg',
          'image/png',
          'image/gif',
          'image/webp',
          'image/svg+xml',
          'video/mp4',
          'video/webm',
          'audio/mpeg',
          'audio/ogg',
          'application/pdf',
          'text/plain',
          'application/zip',
          'application/x-zip-compressed',
        ];

        if (allowedTypes.includes(file.mimetype)) {
          cb(null, true);
        } else {
          cb(new BadRequestException('File type not allowed'));
        }
      },
    };
  }
}
