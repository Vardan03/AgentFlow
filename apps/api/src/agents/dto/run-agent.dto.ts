import { IsString } from 'class-validator'

export class RunAgentDto {
  @IsString()
  message!: string
}
