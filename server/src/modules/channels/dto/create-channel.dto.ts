import { IsString, IsEnum, IsOptional, IsInt, Min } from 'class-validator';
import { ChannelType } from '@prisma/client';

export class CreateChannelDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsEnum(ChannelType)
  type: ChannelType;

  @IsString()
  @IsOptional()
  topic?: string;

  @IsInt()
  @Min(0)
  @IsOptional()
  position?: number;

  @IsString()
  @IsOptional()
  parentId?: string;
}
