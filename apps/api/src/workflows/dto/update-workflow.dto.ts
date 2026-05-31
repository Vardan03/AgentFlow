import { IsBoolean, IsObject, IsOptional, IsString } from 'class-validator'

export class UpdateWorkflowDto {
  @IsString()
  @IsOptional()
  name?: string

  @IsString()
  @IsOptional()
  description?: string

  @IsObject()
  @IsOptional()
  graph?: object

  @IsBoolean()
  @IsOptional()
  isEnabled?: boolean
}
