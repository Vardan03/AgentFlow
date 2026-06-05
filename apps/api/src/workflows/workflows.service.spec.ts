import { ForbiddenException, NotFoundException } from '@nestjs/common'
import { WorkflowsService } from './workflows.service'
import { PrismaService } from '../prisma/prisma.service'

const mockPrisma = () => ({
  workflow: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
})

const baseWorkflow = {
  id: 'wf-1',
  userId: 'user-1',
  name: 'My Workflow',
  description: 'Test workflow',
  graph: { nodes: [], edges: [] },
  isEnabled: false,
  cronExpression: null,
  webhookToken: null,
  createdAt: new Date(),
  updatedAt: new Date(),
}

describe('WorkflowsService', () => {
  let service: WorkflowsService
  let prisma: ReturnType<typeof mockPrisma>

  beforeEach(() => {
    prisma = mockPrisma()
    service = new WorkflowsService(prisma as unknown as PrismaService, null as any)
  })

  describe('findAll', () => {
    it('returns workflows for the user ordered by updatedAt desc', async () => {
      prisma.workflow.findMany.mockResolvedValue([baseWorkflow])
      const result = await service.findAll('user-1')
      expect(result).toEqual([baseWorkflow])
      expect(prisma.workflow.findMany).toHaveBeenCalledWith({
        where: { userId: 'user-1' },
        orderBy: { updatedAt: 'desc' },
      })
    })
  })

  describe('findOne', () => {
    it('returns workflow when it belongs to the user', async () => {
      prisma.workflow.findUnique.mockResolvedValue(baseWorkflow)
      const result = await service.findOne('wf-1', 'user-1')
      expect(result).toEqual(baseWorkflow)
    })

    it('throws NotFoundException when workflow does not exist', async () => {
      prisma.workflow.findUnique.mockResolvedValue(null)
      await expect(service.findOne('missing', 'user-1')).rejects.toThrow(NotFoundException)
    })

    it('throws ForbiddenException when workflow belongs to another user', async () => {
      prisma.workflow.findUnique.mockResolvedValue({ ...baseWorkflow, userId: 'other' })
      await expect(service.findOne('wf-1', 'user-1')).rejects.toThrow(ForbiddenException)
    })
  })

  describe('create', () => {
    it('creates workflow with empty graph when none provided', async () => {
      prisma.workflow.create.mockResolvedValue(baseWorkflow)
      await service.create('user-1', { name: 'My Workflow', description: 'Test workflow' })
      expect(prisma.workflow.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          userId: 'user-1',
          name: 'My Workflow',
          graph: { nodes: [], edges: [] },
        }),
      })
    })

    it('uses provided graph when supplied', async () => {
      const graph = { nodes: [{ id: 'n1', type: 'trigger.manual' }], edges: [] }
      prisma.workflow.create.mockResolvedValue({ ...baseWorkflow, graph })
      await service.create('user-1', { name: 'Workflow', graph })
      expect(prisma.workflow.create).toHaveBeenCalledWith({
        data: expect.objectContaining({ graph }),
      })
    })
  })

  describe('update', () => {
    it('updates only provided fields', async () => {
      prisma.workflow.findUnique.mockResolvedValue(baseWorkflow)
      prisma.workflow.update.mockResolvedValue({ ...baseWorkflow, name: 'Renamed' })

      await service.update('wf-1', 'user-1', { name: 'Renamed' })

      expect(prisma.workflow.update).toHaveBeenCalledWith({
        where: { id: 'wf-1' },
        data: { name: 'Renamed' },
      })
    })

    it('throws ForbiddenException when updating another user\'s workflow', async () => {
      prisma.workflow.findUnique.mockResolvedValue({ ...baseWorkflow, userId: 'other' })
      await expect(service.update('wf-1', 'user-1', { name: 'x' })).rejects.toThrow(ForbiddenException)
    })
  })

  describe('duplicate', () => {
    it('creates a copy with "Copy of" prefix', async () => {
      prisma.workflow.findUnique.mockResolvedValue(baseWorkflow)
      prisma.workflow.create.mockResolvedValue({ ...baseWorkflow, id: 'wf-2', name: 'Copy of My Workflow' })

      const result = await service.duplicate('wf-1', 'user-1')

      expect(prisma.workflow.create).toHaveBeenCalledWith({
        data: expect.objectContaining({ name: 'Copy of My Workflow' }),
      })
      expect(result.name).toBe('Copy of My Workflow')
    })
  })

  describe('remove', () => {
    it('deletes the workflow', async () => {
      prisma.workflow.findUnique.mockResolvedValue(baseWorkflow)
      prisma.workflow.delete.mockResolvedValue(baseWorkflow)

      await service.remove('wf-1', 'user-1')

      expect(prisma.workflow.delete).toHaveBeenCalledWith({ where: { id: 'wf-1' } })
    })
  })

  describe('generateWebhookToken', () => {
    it('generates and stores a UUID token', async () => {
      prisma.workflow.findUnique.mockResolvedValue(baseWorkflow)
      prisma.workflow.update.mockResolvedValue({ ...baseWorkflow, webhookToken: 'some-uuid' })

      const result = await service.generateWebhookToken('wf-1', 'user-1')

      expect(prisma.workflow.update).toHaveBeenCalledWith({
        where: { id: 'wf-1' },
        data: { webhookToken: expect.any(String) },
      })
      const token = prisma.workflow.update.mock.calls[0][0].data.webhookToken
      expect(token).toMatch(/^[0-9a-f-]{36}$/)
    })
  })
})
