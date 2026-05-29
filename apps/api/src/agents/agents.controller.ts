import { Body, Controller, Delete, Get, Param, Patch, Post, Request, UseGuards } from '@nestjs/common'
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'
import { AgentRunnerService } from './agent-runner.service'
import { AgentsService } from './agents.service'
import { CreateAgentDto } from './dto/create-agent.dto'
import { RunAgentDto } from './dto/run-agent.dto'
import { UpdateAgentDto } from './dto/update-agent.dto'

@Controller('agents')
@UseGuards(JwtAuthGuard)
export class AgentsController {
  constructor(
    private agentsService: AgentsService,
    private agentRunnerService: AgentRunnerService,
  ) {}

  @Get()
  findAll(@Request() req: any) {
    return this.agentsService.findAll(req.user.id)
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Request() req: any) {
    return this.agentsService.findOne(id, req.user.id)
  }

  @Post()
  create(@Request() req: any, @Body() dto: CreateAgentDto) {
    return this.agentsService.create(req.user.id, dto)
  }

  @Patch(':id')
  update(@Param('id') id: string, @Request() req: any, @Body() dto: UpdateAgentDto) {
    return this.agentsService.update(id, req.user.id, dto)
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Request() req: any) {
    return this.agentsService.remove(id, req.user.id)
  }

  @Post(':id/run')
  run(@Param('id') id: string, @Request() req: any, @Body() dto: RunAgentDto) {
    return this.agentRunnerService.run(id, req.user.id, dto.message).then((response) => ({ response }))
  }
}
