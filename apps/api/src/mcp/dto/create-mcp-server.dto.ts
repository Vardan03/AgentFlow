import { IsIn, IsObject, IsOptional, IsString, MinLength } from 'class-validator'

export class CreateMcpServerDto {
  @IsString()
  @MinLength(1)
  name!: string

  @IsString()
  @IsOptional()
  description?: string

  @IsString()
  @MinLength(1)
  endpoint!: string

  @IsString()
  @IsIn(['none', 'bearer', 'basic', 'api_key'])
  authType!: string

  @IsObject()
  @IsOptional()
  authConfig?: Record<string, string>
}
