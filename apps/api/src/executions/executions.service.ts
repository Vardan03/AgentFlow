import { Injectable } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'

@Injectable()
export class ExecutionsService {
  constructor(private prisma: PrismaService) {}

  findAllForWorkflow(workflowId: string, userId: string) {
    return this.prisma.execution.findMany({
      where: { workflowId, workflow: { userId } },
      orderBy: { createdAt: 'desc' },
      take: 20,
    })
  }

  findOne(id: string, userId: string) {
    return this.prisma.execution.findFirst({
      where: { id, workflow: { userId } },
    })
  }

  countForUser(userId: string) {
    return this.prisma.execution.count({
      where: { workflow: { userId } },
    })
  }

  findRecentForUser(userId: string, limit = 8) {
    return this.prisma.execution.findMany({
      where: { workflow: { userId } },
      orderBy: { createdAt: 'desc' },
      take: limit,
      include: {
        workflow: { select: { id: true, name: true } },
      },
    })
  }
}
