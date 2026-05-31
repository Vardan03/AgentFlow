import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import { CreateWorkflowDto } from './dto/create-workflow.dto'
import { UpdateWorkflowDto } from './dto/update-workflow.dto'

@Injectable()
export class WorkflowsService {
  constructor(private prisma: PrismaService) {}

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
        graph: { nodes: [], edges: [] },
      },
    })
  }

  async update(id: string, userId: string, dto: UpdateWorkflowDto) {
    await this.findOne(id, userId)
    return this.prisma.workflow.update({
      where: { id },
      data: {
        ...(dto.name !== undefined && { name: dto.name }),
        ...(dto.description !== undefined && { description: dto.description }),
        ...(dto.graph !== undefined && { graph: dto.graph }),
        ...(dto.isEnabled !== undefined && { isEnabled: dto.isEnabled }),
      },
    })
  }

  async remove(id: string, userId: string) {
    await this.findOne(id, userId)
    return this.prisma.workflow.delete({ where: { id } })
  }
}
