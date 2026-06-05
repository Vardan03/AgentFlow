import { Module } from '@nestjs/common'
import { AgentsModule } from '../agents/agents.module'
import { McpModule } from '../mcp/mcp.module'
import { ExecutionRunnerService } from './execution-runner.service'
import { ExecutionsController } from './executions.controller'
import { ExecutionsService } from './executions.service'

@Module({
  imports: [AgentsModule, McpModule],
  controllers: [ExecutionsController],
  providers: [ExecutionsService, ExecutionRunnerService],
})
export class ExecutionsModule {}
