import { IsString, IsOptional, MinLength, MaxLength } from 'class-validator';

export class CreateServerDto {
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  name: string;

  @IsString()
  @IsOptional()
  icon?: string;

  @IsString()
  @IsOptional()
  banner?: string;

  @IsString()
  @IsOptional()
  @MaxLength(500)
  description?: string;
}
