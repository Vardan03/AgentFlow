import Anthropic from '@anthropic-ai/sdk'
import OpenAI from 'openai'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { BadRequestException, Injectable, InternalServerErrorException } from '@nestjs/common'
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
      this.prisma.user.findUnique({
        where: { id: userId },
        select: { anthropicApiKey: true, openaiApiKey: true, deepseekApiKey: true, googleApiKey: true, grokApiKey: true, qwenApiKey: true },
      }),
    ])

    const provider = agent.provider ?? 'anthropic'

    switch (provider) {
      case 'anthropic':
        return this.runAnthropic(agent, user?.anthropicApiKey, message)
      case 'openai':
        return this.runOpenAI(agent, user?.openaiApiKey, message)
      case 'deepseek':
        return this.runDeepSeek(agent, user?.deepseekApiKey, message)
      case 'google':
        return this.runGoogle(agent, user?.googleApiKey, message)
      case 'grok':
        return this.runGrok(agent, user?.grokApiKey, message)
      case 'qwen':
        return this.runQwen(agent, user?.qwenApiKey, message)
      default:
        throw new BadRequestException(`Unknown provider: ${provider}`)
    }
  }

  private async runAnthropic(agent: any, apiKey: string | null | undefined, message: string): Promise<string> {
    if (!apiKey) throw new BadRequestException('No Anthropic API key found. Please add it in Settings.')
    try {
      const client = new Anthropic({ apiKey })
      const response = await client.messages.create({
        model: agent.model,
        max_tokens: agent.maxTokens,
        temperature: agent.temperature,
        ...(agent.systemPrompt && { system: agent.systemPrompt }),
        messages: [{ role: 'user', content: message }],
      })
      const block = response.content[0]
      if (block.type !== 'text') throw new BadRequestException('Unexpected response type from Anthropic')
      return block.text
    } catch (err: any) {
      if (err instanceof BadRequestException) throw err
      throw new InternalServerErrorException(err?.message ?? 'Anthropic API error')
    }
  }

  private async runOpenAI(agent: any, apiKey: string | null | undefined, message: string): Promise<string> {
    if (!apiKey) throw new BadRequestException('No OpenAI API key found. Please add it in Settings.')
    try {
      const client = new OpenAI({ apiKey })
      const response = await client.chat.completions.create({
        model: agent.model,
        max_tokens: agent.maxTokens,
        temperature: agent.temperature,
        messages: [
          ...(agent.systemPrompt ? [{ role: 'system' as const, content: agent.systemPrompt }] : []),
          { role: 'user', content: message },
        ],
      })
      return response.choices[0].message.content ?? ''
    } catch (err: any) {
      throw new InternalServerErrorException(err?.message ?? 'OpenAI API error')
    }
  }

  private async runDeepSeek(agent: any, apiKey: string | null | undefined, message: string): Promise<string> {
    if (!apiKey) throw new BadRequestException('No DeepSeek API key found. Please add it in Settings.')
    try {
      const client = new OpenAI({ apiKey, baseURL: 'https://api.deepseek.com' })
      const response = await client.chat.completions.create({
        model: agent.model,
        max_tokens: agent.maxTokens,
        temperature: agent.temperature,
        messages: [
          ...(agent.systemPrompt ? [{ role: 'system' as const, content: agent.systemPrompt }] : []),
          { role: 'user', content: message },
        ],
      })
      return response.choices[0].message.content ?? ''
    } catch (err: any) {
      throw new InternalServerErrorException(err?.message ?? 'DeepSeek API error')
    }
  }

  private async runGrok(agent: any, apiKey: string | null | undefined, message: string): Promise<string> {
    if (!apiKey) throw new BadRequestException('No Grok API key found. Please add it in Settings.')
    try {
      const client = new OpenAI({ apiKey, baseURL: 'https://api.x.ai/v1' })
      const response = await client.chat.completions.create({
        model: agent.model,
        max_tokens: agent.maxTokens,
        temperature: agent.temperature,
        messages: [
          ...(agent.systemPrompt ? [{ role: 'system' as const, content: agent.systemPrompt }] : []),
          { role: 'user', content: message },
        ],
      })
      return response.choices[0].message.content ?? ''
    } catch (err: any) {
      throw new InternalServerErrorException(err?.message ?? 'Grok API error')
    }
  }

  private async runQwen(agent: any, apiKey: string | null | undefined, message: string): Promise<string> {
    if (!apiKey) throw new BadRequestException('No Qwen API key found. Please add it in Settings.')
    try {
      const client = new OpenAI({ apiKey, baseURL: 'https://dashscope.aliyuncs.com/compatible-mode/v1' })
      const response = await client.chat.completions.create({
        model: agent.model,
        max_tokens: agent.maxTokens,
        temperature: agent.temperature,
        messages: [
          ...(agent.systemPrompt ? [{ role: 'system' as const, content: agent.systemPrompt }] : []),
          { role: 'user', content: message },
        ],
      })
      return response.choices[0].message.content ?? ''
    } catch (err: any) {
      throw new InternalServerErrorException(err?.message ?? 'Qwen API error')
    }
  }

  private async runGoogle(agent: any, apiKey: string | null | undefined, message: string): Promise<string> {
    if (!apiKey) throw new BadRequestException('No Google API key found. Please add it in Settings.')
    try {
      const genAI = new GoogleGenerativeAI(apiKey)
      const model = genAI.getGenerativeModel({
        model: agent.model,
        ...(agent.systemPrompt && { systemInstruction: agent.systemPrompt }),
        generationConfig: {
          maxOutputTokens: agent.maxTokens,
          temperature: agent.temperature,
        },
      })
      const result = await model.generateContent(message)
      return result.response.text()
    } catch (err: any) {
      throw new InternalServerErrorException(err?.message ?? 'Google API error')
    }
  }
}
