import { IsString, IsBoolean, IsOptional, MinLength, MaxLength } from 'class-validator';

export class CreateRoleDto {
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  name: string;

  @IsString()
  @IsOptional()
  color?: string;

  @IsBoolean()
  @IsOptional()
  hoist?: boolean;

  @IsBoolean()
  @IsOptional()
  mentionable?: boolean;

  @IsString()
  @IsOptional()
  permissions?: string;
}
