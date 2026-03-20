import { IsString, IsOptional, MinLength, MaxLength } from 'class-validator';

export class TwoFADto {
  @IsString()
  @MinLength(6)
  @MaxLength(8)
  code: string;

  @IsString()
  @IsOptional()
  secret?: string;
}
