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

  async getUsageStats(userId: string) {
    const executions = await this.prisma.execution.findMany({
      where: { workflow: { userId } },
      select: { logs: true },
      orderBy: { createdAt: 'desc' },
      take: 100,
    })

    const agentMap = new Map<string, { runs: number; successCount: number }>()
    const mcpMap = new Map<string, { runs: number }>()

    for (const exec of executions) {
      const logs = (exec.logs ?? []) as any[]
      for (const log of logs) {
        if (['ai.run_agent', 'ai.agent_decision', 'ai.agent_review'].includes(log.type)) {
          const key: string = log.label || log.type
          const entry = agentMap.get(key) ?? { runs: 0, successCount: 0 }
          entry.runs++
          if (log.status === 'success') entry.successCount++
          agentMap.set(key, entry)
        }
        if (['mcp.execute_tool', 'mcp.fetch_resource'].includes(log.type)) {
          const key: string = log.label || log.type
          const entry = mcpMap.get(key) ?? { runs: 0 }
          entry.runs++
          mcpMap.set(key, entry)
        }
      }
    }

    const agentUsage = [...agentMap.entries()]
      .map(([label, d]) => ({ label, runs: d.runs, successCount: d.successCount }))
      .sort((a, b) => b.runs - a.runs)
      .slice(0, 6)

    const mcpUsage = [...mcpMap.entries()]
      .map(([label, d]) => ({ label, runs: d.runs }))
      .sort((a, b) => b.runs - a.runs)
      .slice(0, 6)

    return { agentUsage, mcpUsage }
  }
}
