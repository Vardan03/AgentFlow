import { IsOptional, IsString } from 'class-validator'

export class UpdateSettingsDto {
  @IsString()
  @IsOptional()
  name?: string

  @IsString()
  @IsOptional()
  anthropicApiKey?: string

  @IsString()
  @IsOptional()
  openaiApiKey?: string

  @IsString()
  @IsOptional()
  deepseekApiKey?: string

  @IsString()
  @IsOptional()
  googleApiKey?: string

  @IsString()
  @IsOptional()
  grokApiKey?: string

  @IsString()
  @IsOptional()
  qwenApiKey?: string
}
