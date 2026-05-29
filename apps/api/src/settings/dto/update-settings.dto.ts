import { IsOptional, IsString } from 'class-validator'

export class UpdateSettingsDto {
  @IsString()
  @IsOptional()
  anthropicApiKey?: string

  @IsString()
  @IsOptional()
  name?: string
}
