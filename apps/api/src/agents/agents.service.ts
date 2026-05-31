import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import { CreateAgentDto } from './dto/create-agent.dto'
import { UpdateAgentDto } from './dto/update-agent.dto'

@Injectable()
export class AgentsService {
  constructor(private prisma: PrismaService) {}

  findAll(userId: string) {
    return this.prisma.agent.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    })
  }

  async findOne(id: string, userId: string) {
    const agent = await this.prisma.agent.findUnique({ where: { id } })
    if (!agent) throw new NotFoundException('Agent not found')
    if (agent.userId !== userId) throw new ForbiddenException()
    return agent
  }

  create(userId: string, dto: CreateAgentDto) {
    return this.prisma.agent.create({
      data: {
        userId,
        name: dto.name,
        description: dto.description,
        systemPrompt: dto.systemPrompt,
        provider: dto.provider ?? 'anthropic',
        model: dto.model ?? 'claude-sonnet-4-6',
        temperature: dto.temperature ?? 0.7,
        maxTokens: dto.maxTokens ?? 1024,
        enabledTools: dto.enabledTools ?? [],
      },
    })
  }

  async update(id: string, userId: string, dto: UpdateAgentDto) {
    await this.findOne(id, userId)
    return this.prisma.agent.update({
      where: { id },
      data: {
        ...(dto.name !== undefined && { name: dto.name }),
        ...(dto.description !== undefined && { description: dto.description }),
        ...(dto.systemPrompt !== undefined && { systemPrompt: dto.systemPrompt }),
        ...(dto.provider !== undefined && { provider: dto.provider }),
        ...(dto.model !== undefined && { model: dto.model }),
        ...(dto.temperature !== undefined && { temperature: dto.temperature }),
        ...(dto.maxTokens !== undefined && { maxTokens: dto.maxTokens }),
        ...(dto.enabledTools !== undefined && { enabledTools: dto.enabledTools }),
      },
    })
  }

  async remove(id: string, userId: string) {
    await this.findOne(id, userId)
    return this.prisma.agent.delete({ where: { id } })
  }
}
