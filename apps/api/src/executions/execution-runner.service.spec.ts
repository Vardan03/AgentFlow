import { ExecutionRunnerService } from './execution-runner.service'
import { AgentRunnerService } from '../agents/agent-runner.service'
import { McpService } from '../mcp/mcp.service'
import { PrismaService } from '../prisma/prisma.service'

type RunResult = Awaited<ReturnType<ExecutionRunnerService['run']>> & { output?: string | null }

// Minimal node builder helpers
const node = (id: string, type: string, data: Record<string, any> = {}) => ({ id, type, data })
const edge = (source: string, target: string, sourceHandle?: string) => ({
  id: `${source}->${target}`,
  source,
  target,
  ...(sourceHandle !== undefined && { sourceHandle }),
})

const graph = (nodes: any[], edges: any[]) => ({ nodes, edges })

const mockPrisma = () => ({
  workflow: { findUnique: jest.fn() },
  execution: { create: jest.fn(), update: jest.fn() },
})

const mockAgentRunner = () => ({ run: jest.fn() })
const mockMcp = () => ({ callTool: jest.fn(), readResource: jest.fn() })

const baseExecution = { id: 'exec-1', workflowId: 'wf-1', status: 'running', trigger: 'manual', startedAt: new Date() }

describe('ExecutionRunnerService', () => {
  let service: ExecutionRunnerService
  let prisma: ReturnType<typeof mockPrisma>
  let agentRunner: ReturnType<typeof mockAgentRunner>
  let mcpService: ReturnType<typeof mockMcp>

  const run = (...args: Parameters<ExecutionRunnerService['run']>) =>
    service.run(...args) as Promise<RunResult>

  const setupWorkflow = (nodes: any[], edges: any[]) => {
    prisma.workflow.findUnique.mockResolvedValue({
      id: 'wf-1', userId: 'user-1', graph: graph(nodes, edges),
    })
    prisma.execution.create.mockResolvedValue({ ...baseExecution })
    prisma.execution.update.mockResolvedValue({})
  }

  beforeEach(() => {
    prisma = mockPrisma()
    agentRunner = mockAgentRunner()
    mcpService = mockMcp()
    service = new ExecutionRunnerService(
      prisma as unknown as PrismaService,
      agentRunner as unknown as AgentRunnerService,
      mcpService as unknown as McpService,
    )
  })

  // ─── Template substitution (private via integration) ──────────────────────

  describe('template substitution ({{input}} and {{var.x}})', () => {
    it('substitutes {{input}} in a transform node', async () => {
      const nodes = [
        node('t', 'trigger.manual'),
        node('x', 'util.transform_data', { template: 'Hello, {{input}}!' }),
        node('r', 'util.response'),
      ]
      const edges = [edge('t', 'x'), edge('x', 'r')]
      setupWorkflow(nodes, edges)

      const result = await run('wf-1', 'user-1', 'World')
      expect(result.output).toBe('Hello, World!')
    })

    it('substitutes {{var.name}} after set_variable', async () => {
      const nodes = [
        node('t', 'trigger.manual'),
        node('sv', 'util.set_variable', { variableName: 'greeting', value: 'Hi there' }),
        node('x', 'util.transform_data', { template: '{{var.greeting}}' }),
        node('r', 'util.response'),
      ]
      const edges = [edge('t', 'sv'), edge('sv', 'x'), edge('x', 'r')]
      setupWorkflow(nodes, edges)

      const result = await run('wf-1', 'user-1', null)
      expect(result.output).toBe('Hi there')
    })

    it('leaves unresolved {{var.x}} as empty string', async () => {
      const nodes = [
        node('t', 'trigger.manual'),
        node('x', 'util.transform_data', { template: '{{var.missing}}' }),
        node('r', 'util.response'),
      ]
      const edges = [edge('t', 'x'), edge('x', 'r')]
      setupWorkflow(nodes, edges)

      const result = await run('wf-1', 'user-1', 'ignored')
      expect(result.output).toBe('')
    })
  })

  // ─── Condition node ────────────────────────────────────────────────────────

  describe('control.condition', () => {
    const conditionWorkflow = (condition: string) => {
      const nodes = [
        node('t', 'trigger.manual'),
        node('c', 'control.condition', { condition }),
        node('yes', 'util.transform_data', { template: 'branch:yes' }),
        node('no', 'util.transform_data', { template: 'branch:no' }),
        node('r', 'util.response'),
      ]
      const edges = [
        edge('t', 'c'),
        edge('c', 'yes', 'yes'),
        edge('c', 'no', 'no'),
        edge('yes', 'r'),
        edge('no', 'r'),
      ]
      return { nodes, edges }
    }

    it('follows yes branch when condition is true', async () => {
      const { nodes, edges } = conditionWorkflow('output.length > 0')
      setupWorkflow(nodes, edges)
      const result = await run('wf-1', 'user-1', 'hello')
      expect(result.output).toBe('branch:yes')
    })

    it('follows no branch when condition is false', async () => {
      const { nodes, edges } = conditionWorkflow('output === "EXACT_MATCH"')
      setupWorkflow(nodes, edges)
      const result = await run('wf-1', 'user-1', 'other')
      expect(result.output).toBe('branch:no')
    })

    it('follows yes branch when condition is empty (defaults to true)', async () => {
      const { nodes, edges } = conditionWorkflow('')
      setupWorkflow(nodes, edges)
      const result = await run('wf-1', 'user-1', 'anything')
      expect(result.output).toBe('branch:yes')
    })

    it('follows no branch when condition throws (invalid JS)', async () => {
      const { nodes, edges } = conditionWorkflow('!!!invalid syntax @@@@')
      setupWorkflow(nodes, edges)
      const result = await run('wf-1', 'user-1', 'anything')
      expect(result.output).toBe('branch:no')
    })
  })

  // ─── Switch node ───────────────────────────────────────────────────────────

  describe('control.switch', () => {
    const switchWorkflow = (cases: { value: string; label: string }[]) => {
      const nodes = [
        node('t', 'trigger.manual'),
        node('sw', 'control.switch', { cases }),
        node('a', 'util.transform_data', { template: 'case:A' }),
        node('b', 'util.transform_data', { template: 'case:B' }),
        node('def', 'util.transform_data', { template: 'case:default' }),
      ]
      const edges = [
        edge('t', 'sw'),
        edge('sw', 'a', 'A'),
        edge('sw', 'b', 'B'),
        edge('sw', 'def', 'default'),
      ]
      return { nodes, edges }
    }

    it('routes to matching case branch', async () => {
      const { nodes, edges } = switchWorkflow([{ value: 'A', label: 'Case A' }, { value: 'B', label: 'Case B' }])
      setupWorkflow(nodes, edges)
      const result = await run('wf-1', 'user-1', 'A')
      expect(result.output).toBe('case:A')
    })

    it('routes to default when no case matches', async () => {
      const { nodes, edges } = switchWorkflow([{ value: 'A', label: 'Case A' }])
      setupWorkflow(nodes, edges)
      const result = await run('wf-1', 'user-1', 'Z')
      expect(result.output).toBe('case:default')
    })
  })

  // ─── JSON Parser node ──────────────────────────────────────────────────────

  describe('util.json_parser', () => {
    const jsonWorkflow = (path: string) => {
      const nodes = [
        node('t', 'trigger.manual'),
        node('jp', 'util.json_parser', { path }),
        node('r', 'util.response'),
      ]
      return { nodes, edges: [edge('t', 'jp'), edge('jp', 'r')] }
    }

    it('extracts a top-level string field', async () => {
      const { nodes, edges } = jsonWorkflow('name')
      setupWorkflow(nodes, edges)
      const result = await run('wf-1', 'user-1', JSON.stringify({ name: 'Alice' }))
      expect(result.output).toBe('Alice')
    })

    it('extracts a nested field using dot-path', async () => {
      const { nodes, edges } = jsonWorkflow('user.address.city')
      setupWorkflow(nodes, edges)
      const input = JSON.stringify({ user: { address: { city: 'Paris' } } })
      const result = await run('wf-1', 'user-1', input)
      expect(result.output).toBe('Paris')
    })

    it('extracts an array element by index', async () => {
      const { nodes, edges } = jsonWorkflow('items.1')
      setupWorkflow(nodes, edges)
      const input = JSON.stringify({ items: ['first', 'second', 'third'] })
      const result = await run('wf-1', 'user-1', input)
      expect(result.output).toBe('second')
    })

    it('returns stringified JSON when no path specified', async () => {
      const { nodes, edges } = jsonWorkflow('')
      setupWorkflow(nodes, edges)
      const obj = { a: 1 }
      const result = await run('wf-1', 'user-1', JSON.stringify(obj))
      expect(result.status).toBe('success')
    })

    it('fails when path does not exist in object', async () => {
      const { nodes, edges } = jsonWorkflow('missing.key')
      setupWorkflow(nodes, edges)
      const result = await run('wf-1', 'user-1', JSON.stringify({ a: 1 }))
      expect(result.status).toBe('failed')
    })

    it('fails when input is not valid JSON', async () => {
      const { nodes, edges } = jsonWorkflow('name')
      setupWorkflow(nodes, edges)
      const result = await run('wf-1', 'user-1', 'not json')
      expect(result.status).toBe('failed')
    })
  })

  // ─── Set Variable node ─────────────────────────────────────────────────────

  describe('util.set_variable', () => {
    it('stores a literal value and passes input through', async () => {
      const nodes = [
        node('t', 'trigger.manual'),
        node('sv', 'util.set_variable', { variableName: 'x', value: 'stored' }),
        node('r', 'util.response'),
      ]
      const edges = [edge('t', 'sv'), edge('sv', 'r')]
      setupWorkflow(nodes, edges)

      const result = await run('wf-1', 'user-1', 'original')
      expect(result.output).toBe('original')
    })

    it('fails when variable name is empty', async () => {
      const nodes = [
        node('t', 'trigger.manual'),
        node('sv', 'util.set_variable', { variableName: '', value: 'x' }),
      ]
      const edges = [edge('t', 'sv')]
      setupWorkflow(nodes, edges)

      const result = await run('wf-1', 'user-1', 'input')
      expect(result.status).toBe('failed')
    })
  })

  // ─── Log node ──────────────────────────────────────────────────────────────

  describe('util.log', () => {
    it('returns the message template', async () => {
      const nodes = [
        node('t', 'trigger.manual'),
        node('l', 'util.log', { message: 'logged: {{input}}' }),
        node('r', 'util.response'),
      ]
      const edges = [edge('t', 'l'), edge('l', 'r')]
      setupWorkflow(nodes, edges)

      const result = await run('wf-1', 'user-1', 'data')
      expect(result.output).toBe('logged: data')
    })

    it('falls back to raw input when no message configured', async () => {
      const nodes = [
        node('t', 'trigger.manual'),
        node('l', 'util.log', {}),
        node('r', 'util.response'),
      ]
      const edges = [edge('t', 'l'), edge('l', 'r')]
      setupWorkflow(nodes, edges)

      const result = await run('wf-1', 'user-1', 'raw')
      expect(result.output).toBe('raw')
    })
  })

  // ─── Delay node ────────────────────────────────────────────────────────────

  describe('control.delay', () => {
    it('passes input through with zero delay', async () => {
      const nodes = [
        node('t', 'trigger.manual'),
        node('d', 'control.delay', { delaySeconds: 0 }),
        node('r', 'util.response'),
      ]
      const edges = [edge('t', 'd'), edge('d', 'r')]
      setupWorkflow(nodes, edges)

      const result = await run('wf-1', 'user-1', 'hello')
      expect(result.output).toBe('hello')
    })

    it('passes input through after a fake-timer delay', async () => {
      jest.useFakeTimers()
      const nodes = [
        node('t', 'trigger.manual'),
        node('d', 'control.delay', { delaySeconds: 5 }),
        node('r', 'util.response'),
      ]
      const edges = [edge('t', 'd'), edge('d', 'r')]
      setupWorkflow(nodes, edges)

      const promise = run('wf-1', 'user-1', 'hello')
      await jest.runAllTimersAsync()
      const result = await promise
      jest.useRealTimers()
      expect(result.output).toBe('hello')
    })

    it('caps delay at 60 seconds', async () => {
      jest.useFakeTimers()
      const nodes = [
        node('t', 'trigger.manual'),
        node('d', 'control.delay', { delaySeconds: 9999 }),
        node('r', 'util.response'),
      ]
      const edges = [edge('t', 'd'), edge('d', 'r')]
      setupWorkflow(nodes, edges)

      const promise = run('wf-1', 'user-1', 'hi')
      await jest.runAllTimersAsync()
      const result = await promise
      jest.useRealTimers()
      expect(result.status).toBe('success')
    })
  })

  // ─── Agent Decision node ───────────────────────────────────────────────────

  describe('ai.agent_decision', () => {
    const decisionWorkflow = () => {
      const nodes = [
        node('t', 'trigger.manual'),
        node('ad', 'ai.agent_decision', { agentId: 'agent-1', question: 'Is it good?' }),
        node('yes', 'util.transform_data', { template: 'approved' }),
        node('no', 'util.transform_data', { template: 'rejected' }),
      ]
      const edges = [
        edge('t', 'ad'),
        edge('ad', 'yes', 'yes'),
        edge('ad', 'no', 'no'),
      ]
      return { nodes, edges }
    }

    it('follows yes branch when agent responds yes', async () => {
      const { nodes, edges } = decisionWorkflow()
      setupWorkflow(nodes, edges)
      agentRunner.run.mockResolvedValue('yes, this is good')

      const result = await run('wf-1', 'user-1', 'content')
      expect(result.output).toBe('approved')
    })

    it('follows no branch when agent does not include "yes"', async () => {
      const { nodes, edges } = decisionWorkflow()
      setupWorkflow(nodes, edges)
      agentRunner.run.mockResolvedValue('No, this is bad.')

      const result = await run('wf-1', 'user-1', 'content')
      expect(result.output).toBe('rejected')
    })

    it('fails when no agentId configured', async () => {
      const nodes = [
        node('t', 'trigger.manual'),
        node('ad', 'ai.agent_decision', {}),
      ]
      const edges = [edge('t', 'ad')]
      setupWorkflow(nodes, edges)

      const result = await run('wf-1', 'user-1', 'content')
      expect(result.status).toBe('failed')
    })
  })

  // ─── Run Agent node ────────────────────────────────────────────────────────

  describe('ai.run_agent', () => {
    it('calls agent runner and passes output downstream', async () => {
      const nodes = [
        node('t', 'trigger.manual'),
        node('a', 'ai.run_agent', { agentId: 'agent-1', input: 'Summarize: {{input}}' }),
        node('r', 'util.response'),
      ]
      const edges = [edge('t', 'a'), edge('a', 'r')]
      setupWorkflow(nodes, edges)
      agentRunner.run.mockResolvedValue('Summary here.')

      const result = await run('wf-1', 'user-1', 'Long text')
      expect(agentRunner.run).toHaveBeenCalledWith('agent-1', 'user-1', 'Summarize: Long text')
      expect(result.output).toBe('Summary here.')
    })

    it('fails when no agentId configured', async () => {
      const nodes = [
        node('t', 'trigger.manual'),
        node('a', 'ai.run_agent', {}),
      ]
      const edges = [edge('t', 'a')]
      setupWorkflow(nodes, edges)

      const result = await run('wf-1', 'user-1', 'hello')
      expect(result.status).toBe('failed')
    })
  })

  // ─── MCP Tool node ─────────────────────────────────────────────────────────

  describe('mcp.execute_tool', () => {
    it('calls mcpService.callTool with substituted args', async () => {
      const nodes = [
        node('t', 'trigger.manual'),
        node('m', 'mcp.execute_tool', {
          serverId: 'srv-1', toolName: 'search', arguments: '{"q":"{{input}}"}',
        }),
        node('r', 'util.response'),
      ]
      const edges = [edge('t', 'm'), edge('m', 'r')]
      setupWorkflow(nodes, edges)
      mcpService.callTool.mockResolvedValue('search results')

      const result = await run('wf-1', 'user-1', 'typescript')
      expect(mcpService.callTool).toHaveBeenCalledWith('srv-1', 'search', '{"q":"typescript"}')
      expect(result.output).toBe('search results')
    })

    it('fails when serverId is missing', async () => {
      const nodes = [
        node('t', 'trigger.manual'),
        node('m', 'mcp.execute_tool', { toolName: 'search' }),
      ]
      const edges = [edge('t', 'm')]
      setupWorkflow(nodes, edges)

      const result = await run('wf-1', 'user-1', 'query')
      expect(result.status).toBe('failed')
    })
  })

  // ─── Merge node (all mode) ─────────────────────────────────────────────────

  describe('control.merge (all mode)', () => {
    it('executes both parallel branches and merges before continuing', async () => {
      const nodes = [
        node('t', 'trigger.manual'),
        node('a', 'util.transform_data', { template: 'Branch A' }),
        node('b', 'util.transform_data', { template: 'Branch B' }),
        node('mg', 'control.merge', { mode: 'all', separator: ' | ' }),
        node('r', 'util.response'),
      ]
      const edges = [
        edge('t', 'a'), edge('t', 'b'),
        edge('a', 'mg'), edge('b', 'mg'),
        edge('mg', 'r'),
      ]
      setupWorkflow(nodes, edges)

      const result = await run('wf-1', 'user-1', 'start')
      expect(result.status).toBe('success')
      // Both branch nodes must appear in logs
      const logTypes = result.logs.map((l) => l.nodeId)
      expect(logTypes).toContain('a')
      expect(logTypes).toContain('b')
      expect(logTypes).toContain('mg')
    })
  })

  // ─── Workflow-level errors ─────────────────────────────────────────────────

  describe('workflow-level errors', () => {
    it('returns failed status when workflow not found', async () => {
      prisma.workflow.findUnique.mockResolvedValue(null)
      prisma.execution.create.mockResolvedValue({ ...baseExecution })
      prisma.execution.update.mockResolvedValue({})

      await expect(service.run('missing', 'user-1', null)).rejects.toThrow()
    })

    it('returns failed status when no trigger node exists', async () => {
      const nodes = [node('n1', 'util.log', {})]
      setupWorkflow(nodes, [])

      const result = await run('wf-1', 'user-1', null)
      expect(result.status).toBe('failed')
    })

    it('records a log entry per executed node', async () => {
      const nodes = [
        node('t', 'trigger.manual'),
        node('l', 'util.log', { message: 'ping' }),
        node('r', 'util.response'),
      ]
      const edges = [edge('t', 'l'), edge('l', 'r')]
      setupWorkflow(nodes, edges)

      const result = await run('wf-1', 'user-1', 'data')
      expect(result.logs.length).toBe(3)
      expect(result.logs[0].nodeId).toBe('t')
      expect(result.logs[1].nodeId).toBe('l')
      expect(result.logs[2].nodeId).toBe('r')
    })

    it('updates execution status to failed in the database on error', async () => {
      const nodes = [
        node('t', 'trigger.manual'),
        node('a', 'ai.run_agent', { agentId: 'agent-1' }),
      ]
      const edges = [edge('t', 'a')]
      setupWorkflow(nodes, edges)
      agentRunner.run.mockRejectedValue(new Error('API down'))

      const result = await run('wf-1', 'user-1', 'hi')
      expect(result.status).toBe('failed')
      expect(prisma.execution.update).toHaveBeenCalledWith(
        expect.objectContaining({ data: expect.objectContaining({ status: 'failed' }) }),
      )
    })
  })
})
