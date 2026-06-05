import { Module } from '@nestjs/common'
import { ExecutionsModule } from '../executions/executions.module'
import { SchedulerService } from './scheduler.service'

@Module({
  imports: [ExecutionsModule],
  providers: [SchedulerService],
  exports: [SchedulerService],
})
export class SchedulerModule {}
