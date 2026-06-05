import { IsIn, IsObject, IsOptional, IsString, MinLength } from 'class-validator'

export class UpdateMcpServerDto {
  @IsString()
  @MinLength(1)
  @IsOptional()
  name?: string

  @IsString()
  @IsOptional()
  description?: string

  @IsString()
  @MinLength(1)
  @IsOptional()
  endpoint?: string

  @IsString()
  @IsIn(['none', 'bearer', 'basic', 'api_key'])
  @IsOptional()
  authType?: string

  @IsObject()
  @IsOptional()
  authConfig?: Record<string, string>
}
