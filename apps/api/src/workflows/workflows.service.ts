import { ForbiddenException, Injectable, NotFoundException, Optional } from '@nestjs/common'
import { randomUUID } from 'crypto'
import { PrismaService } from '../prisma/prisma.service'
import { SchedulerService } from '../scheduler/scheduler.service'
import { CreateWorkflowDto } from './dto/create-workflow.dto'
import { UpdateWorkflowDto } from './dto/update-workflow.dto'

@Injectable()
export class WorkflowsService {
  constructor(
    private prisma: PrismaService,
    @Optional() private schedulerService: SchedulerService,
  ) {}

  findAll(userId: string) {
    return this.prisma.workflow.findMany({
      where: { userId },
      orderBy: { updatedAt: 'desc' },
    })
  }

  async findOne(id: string, userId: string) {
    const workflow = await this.prisma.workflow.findUnique({ where: { id } })
    if (!workflow) throw new NotFoundException('Workflow not found')
    if (workflow.userId !== userId) throw new ForbiddenException()
    return workflow
  }

  create(userId: string, dto: CreateWorkflowDto) {
    return this.prisma.workflow.create({
      data: {
        userId,
        name: dto.name,
        description: dto.description,
        graph: dto.graph ?? { nodes: [], edges: [] },
      },
    })
  }

  async generateWebhookToken(id: string, userId: string) {
    await this.findOne(id, userId)
    const token = randomUUID()
    return this.prisma.workflow.update({
      where: { id },
      data: { webhookToken: token },
    })
  }

  findByWebhookToken(token: string) {
    return this.prisma.workflow.findUnique({ where: { webhookToken: token } })
  }

  async update(id: string, userId: string, dto: UpdateWorkflowDto) {
    await this.findOne(id, userId)
    const updated = await this.prisma.workflow.update({
      where: { id },
      data: {
        ...(dto.name !== undefined && { name: dto.name }),
        ...(dto.description !== undefined && { description: dto.description }),
        ...(dto.graph !== undefined && { graph: dto.graph }),
        ...(dto.isEnabled !== undefined && { isEnabled: dto.isEnabled }),
        ...(dto.cronExpression !== undefined && { cronExpression: dto.cronExpression }),
      },
    })
    this.syncSchedule(updated)
    return updated
  }

  private syncSchedule(workflow: { id: string; userId: string; isEnabled: boolean; cronExpression: string | null }) {
    if (!this.schedulerService) return
    if (workflow.isEnabled && workflow.cronExpression) {
      this.schedulerService.scheduleWorkflow(workflow.id, workflow.userId, workflow.cronExpression)
    } else {
      this.schedulerService.unscheduleWorkflow(workflow.id)
    }
  }

  async duplicate(id: string, userId: string) {
    const source = await this.findOne(id, userId)
    return this.prisma.workflow.create({
      data: {
        userId,
        name: `Copy of ${source.name}`,
        description: source.description,
        graph: source.graph as any,
      },
    })
  }

  async remove(id: string, userId: string) {
    await this.findOne(id, userId)
    return this.prisma.workflow.delete({ where: { id } })
  }
}
