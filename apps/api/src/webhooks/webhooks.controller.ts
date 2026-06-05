import { Body, Controller, NotFoundException, Param, Post } from '@nestjs/common'
import { ExecutionRunnerService } from '../executions/execution-runner.service'
import { WorkflowsService } from '../workflows/workflows.service'

@Controller('webhooks')
export class WebhooksController {
  constructor(
    private workflowsService: WorkflowsService,
    private executionRunner: ExecutionRunnerService,
  ) {}

  @Post(':token')
  async trigger(@Param('token') token: string, @Body() body: any) {
    const workflow = await this.workflowsService.findByWebhookToken(token)
    if (!workflow) throw new NotFoundException('Webhook not found')

    const input = body && Object.keys(body).length > 0
      ? JSON.stringify(body)
      : null

    return this.executionRunner.run(workflow.id, workflow.userId, input)
  }
}
