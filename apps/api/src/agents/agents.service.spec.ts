import { ForbiddenException, NotFoundException } from '@nestjs/common'
import { AgentsService } from './agents.service'
import { PrismaService } from '../prisma/prisma.service'

const mockPrisma = () => ({
  agent: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
})

const baseAgent = {
  id: 'agent-1',
  userId: 'user-1',
  name: 'My Agent',
  description: 'A test agent',
  systemPrompt: 'You are helpful.',
  provider: 'anthropic',
  model: 'claude-sonnet-4-6',
  temperature: 0.7,
  maxTokens: 1024,
  enabledTools: [],
  createdAt: new Date(),
  updatedAt: new Date(),
}

describe('AgentsService', () => {
  let service: AgentsService
  let prisma: ReturnType<typeof mockPrisma>

  beforeEach(() => {
    prisma = mockPrisma()
    service = new AgentsService(prisma as unknown as PrismaService)
  })

  describe('findAll', () => {
    it('returns all agents for the user ordered by createdAt desc', async () => {
      prisma.agent.findMany.mockResolvedValue([baseAgent])
      const result = await service.findAll('user-1')
      expect(result).toEqual([baseAgent])
      expect(prisma.agent.findMany).toHaveBeenCalledWith({
        where: { userId: 'user-1' },
        orderBy: { createdAt: 'desc' },
      })
    })
  })

  describe('findOne', () => {
    it('returns the agent when it belongs to the user', async () => {
      prisma.agent.findUnique.mockResolvedValue(baseAgent)
      const result = await service.findOne('agent-1', 'user-1')
      expect(result).toEqual(baseAgent)
    })

    it('throws NotFoundException when agent does not exist', async () => {
      prisma.agent.findUnique.mockResolvedValue(null)
      await expect(service.findOne('missing', 'user-1')).rejects.toThrow(NotFoundException)
    })

    it('throws ForbiddenException when agent belongs to another user', async () => {
      prisma.agent.findUnique.mockResolvedValue({ ...baseAgent, userId: 'other-user' })
      await expect(service.findOne('agent-1', 'user-1')).rejects.toThrow(ForbiddenException)
    })
  })

  describe('create', () => {
    it('creates agent with defaults for optional fields', async () => {
      prisma.agent.create.mockResolvedValue(baseAgent)
      await service.create('user-1', { name: 'My Agent' })
      expect(prisma.agent.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          userId: 'user-1',
          name: 'My Agent',
          provider: 'anthropic',
          model: 'claude-sonnet-4-6',
          temperature: 0.7,
          maxTokens: 1024,
          enabledTools: [],
        }),
      })
    })

    it('respects explicitly provided optional fields', async () => {
      prisma.agent.create.mockResolvedValue(baseAgent)
      await service.create('user-1', {
        name: 'GPT Agent',
        provider: 'openai',
        model: 'gpt-4o',
        temperature: 0.2,
        maxTokens: 2048,
      })
      expect(prisma.agent.create).toHaveBeenCalledWith({
        data: expect.objectContaining({ provider: 'openai', model: 'gpt-4o', temperature: 0.2 }),
      })
    })
  })

  describe('update', () => {
    it('updates only provided fields', async () => {
      prisma.agent.findUnique.mockResolvedValue(baseAgent)
      prisma.agent.update.mockResolvedValue({ ...baseAgent, name: 'Renamed' })

      await service.update('agent-1', 'user-1', { name: 'Renamed' })

      expect(prisma.agent.update).toHaveBeenCalledWith({
        where: { id: 'agent-1' },
        data: { name: 'Renamed' },
      })
    })

    it('throws NotFoundException when agent does not exist', async () => {
      prisma.agent.findUnique.mockResolvedValue(null)
      await expect(service.update('missing', 'user-1', { name: 'x' })).rejects.toThrow(NotFoundException)
    })

    it('throws ForbiddenException when agent belongs to another user', async () => {
      prisma.agent.findUnique.mockResolvedValue({ ...baseAgent, userId: 'other' })
      await expect(service.update('agent-1', 'user-1', {})).rejects.toThrow(ForbiddenException)
    })
  })

  describe('remove', () => {
    it('deletes agent and returns it', async () => {
      prisma.agent.findUnique.mockResolvedValue(baseAgent)
      prisma.agent.delete.mockResolvedValue(baseAgent)

      const result = await service.remove('agent-1', 'user-1')

      expect(prisma.agent.delete).toHaveBeenCalledWith({ where: { id: 'agent-1' } })
      expect(result).toEqual(baseAgent)
    })

    it('throws NotFoundException when agent does not exist', async () => {
      prisma.agent.findUnique.mockResolvedValue(null)
      await expect(service.remove('missing', 'user-1')).rejects.toThrow(NotFoundException)
    })
  })
})
