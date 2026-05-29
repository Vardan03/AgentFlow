import { IsArray, IsInt, IsNumber, IsOptional, IsString, Max, Min } from 'class-validator'

export class CreateAgentDto {
  @IsString()
  name!: string

  @IsString()
  @IsOptional()
  description?: string

  @IsString()
  @IsOptional()
  systemPrompt?: string

  @IsString()
  @IsOptional()
  model?: string

  @IsNumber()
  @Min(0)
  @Max(2)
  @IsOptional()
  temperature?: number

  @IsInt()
  @Min(256)
  @Max(8192)
  @IsOptional()
  maxTokens?: number

  @IsArray()
  @IsOptional()
  enabledTools?: string[]
}
