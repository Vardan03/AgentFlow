import { Controller, Get, Param, Post, Request, UseGuards } from '@nestjs/common'
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'
import { ExecutionRunnerService } from './execution-runner.service'
import { ExecutionsService } from './executions.service'

@Controller()
@UseGuards(JwtAuthGuard)
export class ExecutionsController {
  constructor(
    private executionsService: ExecutionsService,
    private executionRunner: ExecutionRunnerService,
  ) {}

  @Post('workflows/:workflowId/execute')
  execute(@Param('workflowId') workflowId: string, @Request() req: any) {
    return this.executionRunner.run(workflowId, req.user.id)
  }

  @Get('workflows/:workflowId/executions')
  findAll(@Param('workflowId') workflowId: string, @Request() req: any) {
    return this.executionsService.findAllForWorkflow(workflowId, req.user.id)
  }

  @Get('executions/:id')
  findOne(@Param('id') id: string, @Request() req: any) {
    return this.executionsService.findOne(id, req.user.id)
  }

  @Get('executions/count/me')
  countForUser(@Request() req: any) {
    return this.executionsService.countForUser(req.user.id)
  }

  @Get('executions/recent/me')
  findRecent(@Request() req: any) {
    return this.executionsService.findRecentForUser(req.user.id)
  }
}
