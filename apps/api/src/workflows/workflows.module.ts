import { Module } from '@nestjs/common'
import { SchedulerModule } from '../scheduler/scheduler.module'
import { WorkflowsController } from './workflows.controller'
import { WorkflowsService } from './workflows.service'
import { WorkflowGeneratorService } from './workflow-generator.service'

@Module({
  imports: [SchedulerModule],
  controllers: [WorkflowsController],
  providers: [WorkflowsService, WorkflowGeneratorService],
  exports: [WorkflowsService],
})
export class WorkflowsModule {}
