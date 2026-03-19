import { IsString, IsOptional, IsArray, IsObject } from 'class-validator';

export class CreateMessageDto {
  @IsString()
  content: string;

  @IsArray()
  @IsOptional()
  attachments?: any[];

  @IsArray()
  @IsOptional()
  embeds?: any[];

  @IsString()
  @IsOptional()
  replyToId?: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  mentions?: string[];
}
