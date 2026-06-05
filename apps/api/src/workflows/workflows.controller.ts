import { Body, Controller, Delete, Get, Param, Patch, Post, Request, UseGuards } from '@nestjs/common'
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'
import { CreateWorkflowDto } from './dto/create-workflow.dto'
import { UpdateWorkflowDto } from './dto/update-workflow.dto'
import { GenerateWorkflowDto } from './dto/generate-workflow.dto'
import { WorkflowsService } from './workflows.service'
import { WorkflowGeneratorService } from './workflow-generator.service'

@Controller('workflows')
@UseGuards(JwtAuthGuard)
export class WorkflowsController {
  constructor(
    private workflowsService: WorkflowsService,
    private workflowGeneratorService: WorkflowGeneratorService,
  ) {}

  @Post('generate')
  generate(@Request() req: any, @Body() dto: GenerateWorkflowDto) {
    return this.workflowGeneratorService.generate(dto.description, req.user.id)
  }

  @Get()
  findAll(@Request() req: any) {
    return this.workflowsService.findAll(req.user.id)
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Request() req: any) {
    return this.workflowsService.findOne(id, req.user.id)
  }

  @Post()
  create(@Request() req: any, @Body() dto: CreateWorkflowDto) {
    return this.workflowsService.create(req.user.id, dto)
  }

  @Patch(':id')
  update(@Param('id') id: string, @Request() req: any, @Body() dto: UpdateWorkflowDto) {
    return this.workflowsService.update(id, req.user.id, dto)
  }

  @Post(':id/duplicate')
  duplicate(@Param('id') id: string, @Request() req: any) {
    return this.workflowsService.duplicate(id, req.user.id)
  }

  @Post(':id/webhook-token')
  generateWebhookToken(@Param('id') id: string, @Request() req: any) {
    return this.workflowsService.generateWebhookToken(id, req.user.id)
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Request() req: any) {
    return this.workflowsService.remove(id, req.user.id)
  }
}
