import { IsObject, IsOptional, IsString } from 'class-validator'

export class CreateWorkflowDto {
  @IsString()
  name!: string

  @IsString()
  @IsOptional()
  description?: string

  @IsObject()
  @IsOptional()
  graph?: object
}
