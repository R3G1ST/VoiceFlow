import { IsString, IsOptional, MinLength, MaxLength } from 'class-validator';

export class UpdateServerDto {
  @IsString()
  @IsOptional()
  @MinLength(1)
  @MaxLength(100)
  name?: string;

  @IsString()
  @IsOptional()
  icon?: string;
}
