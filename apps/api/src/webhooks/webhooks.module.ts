import { Module } from '@nestjs/common'
import { ExecutionsModule } from '../executions/executions.module'
import { WorkflowsModule } from '../workflows/workflows.module'
import { WebhooksController } from './webhooks.controller'

@Module({
  imports: [WorkflowsModule, ExecutionsModule],
  controllers: [WebhooksController],
})
export class WebhooksModule {}
