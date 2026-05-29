import Anthropic from '@anthropic-ai/sdk'
import { BadRequestException, Injectable } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import { AgentsService } from './agents.service'

@Injectable()
export class AgentRunnerService {
  constructor(
    private prisma: PrismaService,
    private agentsService: AgentsService,
  ) {}

  async run(agentId: string, userId: string, message: string): Promise<string> {
    const [agent, user] = await Promise.all([
      this.agentsService.findOne(agentId, userId),
      this.prisma.user.findUnique({ where: { id: userId }, select: { anthropicApiKey: true } }),
    ])

    if (!user?.anthropicApiKey) {
      throw new BadRequestException(
        'No Anthropic API key found. Please add your API key in Settings.',
      )
    }

    const client = new Anthropic({ apiKey: user.anthropicApiKey })

    const response = await client.messages.create({
      model: agent.model,
      max_tokens: agent.maxTokens,
      temperature: agent.temperature,
      ...(agent.systemPrompt && { system: agent.systemPrompt }),
      messages: [{ role: 'user', content: message }],
    })

    const block = response.content[0]
    if (block.type !== 'text') throw new BadRequestException('Unexpected response type from AI')
    return block.text
  }
}
