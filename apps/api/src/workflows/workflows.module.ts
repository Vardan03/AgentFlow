import { Module } from '@nestjs/common'
import { WorkflowsController } from './workflows.controller'
import { WorkflowsService } from './workflows.service'
import { WorkflowGeneratorService } from './workflow-generator.service'

@Module({
  controllers: [WorkflowsController],
  providers: [WorkflowsService, WorkflowGeneratorService],
})
export class WorkflowsModule {}
