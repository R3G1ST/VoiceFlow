import { IsEmail, IsString, IsOptional, MinLength } from 'class-validator';

export class LoginDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(1)
  password: string;

  @IsString()
  @IsOptional()
  @MinLength(6)
  @MaxLength(8)
  twoFACode?: string;
}
