import { IsString, IsOptional } from 'class-validator';

export class CreateMessageDto {
  @IsString()
  content: string;

  @IsString()
  @IsOptional()
  replyToId?: string;
}
