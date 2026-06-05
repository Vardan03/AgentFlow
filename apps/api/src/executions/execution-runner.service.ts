import { Injectable } from '@nestjs/common'
import { AgentRunnerService } from '../agents/agent-runner.service'
import { McpService } from '../mcp/mcp.service'
import { PrismaService } from '../prisma/prisma.service'

export interface NodeLog {
  nodeId: string
  type: string
  label: string
  status: 'success' | 'failed'
  input: string | null
  output: string | null
  durationMs: number
}

const BRANCHING_TYPES = new Set(['control.condition', 'ai.agent_decision', 'ai.agent_review', 'control.switch'])

@Injectable()
export class ExecutionRunnerService {
  constructor(
    private prisma: PrismaService,
    private agentRunner: AgentRunnerService,
    private mcpService: McpService,
  ) {}

  async run(workflowId: string, userId: string) {
    const workflow = await this.prisma.workflow.findUnique({ where: { id: workflowId } })
    if (!workflow || workflow.userId !== userId) throw new Error('Workflow not found')

    const graph = workflow.graph as any
    const nodes: any[] = graph?.nodes ?? []
    const edges: any[] = graph?.edges ?? []

    const execution = await this.prisma.execution.create({
      data: { workflowId, status: 'running', trigger: 'manual', startedAt: new Date() },
    })

    const logs: NodeLog[] = []
    const variables: Record<string, string> = {}

    try {
      const triggerNode = nodes.find((n: any) => n.type?.startsWith('trigger.'))
      if (!triggerNode) throw new Error('No trigger node found in workflow')

      let currentNodeId: string | null = triggerNode.id
      let currentInput: string | null = null

      while (currentNodeId) {
        const node = nodes.find((n: any) => n.id === currentNodeId)
        if (!node) break

        const startMs = Date.now()
        let output: string | null = null
        let nodeStatus: 'success' | 'failed' = 'success'

        try {
          output = await this.executeNode(node, currentInput, userId, variables)
        } catch (err: any) {
          nodeStatus = 'failed'
          output = err?.message ?? 'Unknown error'
          logs.push({
            nodeId: node.id, type: node.type,
            label: node.data?.label ?? node.type,
            status: nodeStatus, input: currentInput, output,
            durationMs: Date.now() - startMs,
          })
          await this.prisma.execution.update({
            where: { id: execution.id },
            data: { status: 'failed', finishedAt: new Date(), logs: logs as any },
          })
          return { ...execution, status: 'failed', logs }
        }

        logs.push({
          nodeId: node.id, type: node.type,
          label: node.data?.label ?? node.type,
          status: nodeStatus, input: currentInput, output,
          durationMs: Date.now() - startMs,
        })

        // Branching nodes pass the original input to the next node, not 'yes'/'no'
        const isBranching = BRANCHING_TYPES.has(node.type)
        const inputBeforeNode: string | null = currentInput
        currentInput = isBranching ? inputBeforeNode : output

        // Route to next node
        const outgoing = edges.filter((e: any) => e.source === currentNodeId)
        if (node.type === 'control.switch') {
          const edge =
            outgoing.find((e: any) => e.sourceHandle === output) ??
            outgoing.find((e: any) => e.sourceHandle === 'default') ??
            outgoing[0]
          currentNodeId = edge?.target ?? null
        } else if (isBranching) {
          const handle = output === 'yes' ? 'yes' : 'no'
          const edge = outgoing.find((e: any) => e.sourceHandle === handle) ?? outgoing[0]
          currentNodeId = edge?.target ?? null
        } else {
          currentNodeId = outgoing[0]?.target ?? null
        }
      }

      await this.prisma.execution.update({
        where: { id: execution.id },
        data: { status: 'success', finishedAt: new Date(), logs: logs as any },
      })

      return { ...execution, status: 'success', logs, output: currentInput }
    } catch (err: any) {
      await this.prisma.execution.update({
        where: { id: execution.id },
        data: { status: 'failed', finishedAt: new Date(), logs: logs as any },
      })
      throw err
    }
  }

  private sub(s: string, input: string | null, variables: Record<string, string>): string {
    return s
      .replace(/\{\{input\}\}/g, input ?? '')
      .replace(/\{\{var\.(\w+)\}\}/g, (_, k) => variables[k] ?? '')
  }

  private async executeNode(
    node: any,
    input: string | null,
    userId: string,
    variables: Record<string, string>,
  ): Promise<string | null> {
    switch (node.type) {
      case 'trigger.manual':
        return null

      case 'ai.run_agent': {
        const agentId = node.data?.agentId
        if (!agentId) throw new Error(`Node "${node.data?.label}": no agent selected`)
        const message = node.data?.input
          ? this.sub(node.data.input, input, variables)
          : (input ?? '')
        if (!message) throw new Error(`Node "${node.data?.label}": no input message configured`)
        return this.agentRunner.run(agentId, userId, message)
      }

      case 'ai.agent_decision': {
        const agentId = node.data?.agentId
        if (!agentId) throw new Error(`Node "${node.data?.label}": no agent selected`)
        const question = node.data?.question
          ? this.sub(node.data.question, input, variables)
          : 'Is the input valid?'
        const message = `Answer ONLY "yes" or "no" — no other text.\n\nQuestion: ${question}\n\nInput:\n${input ?? '(empty)'}`
        const response = await this.agentRunner.run(agentId, userId, message)
        return (response ?? '').toLowerCase().includes('yes') ? 'yes' : 'no'
      }

      case 'control.condition': {
        const result = this.evalCondition(node.data?.condition ?? '', input ?? '')
        return result ? 'yes' : 'no'
      }

      case 'control.delay': {
        const secs = Math.min(Number(node.data?.delaySeconds ?? 0), 60)
        if (secs > 0) {
          await new Promise<void>((r) => setTimeout(r, secs * 1000))
        }
        return input
      }

      case 'util.http_request': {
        const rawUrl = node.data?.url ?? ''
        if (!rawUrl) throw new Error(`Node "${node.data?.label}": URL is required`)

        const url = this.sub(rawUrl, input, variables)
        const method: string = node.data?.method ?? 'GET'

        const headers: Record<string, string> = {}
        if (node.data?.headers) {
          try {
            const parsed = JSON.parse(node.data.headers)
            for (const [k, v] of Object.entries(parsed)) {
              headers[k] = this.sub(String(v), input, variables)
            }
          } catch {
            throw new Error(`Node "${node.data?.label}": Headers must be valid JSON`)
          }
        }

        const body = ['POST', 'PUT', 'PATCH'].includes(method)
          ? this.sub(node.data?.body ?? '', input, variables) || undefined
          : undefined

        const controller = new AbortController()
        const timeout = setTimeout(() => controller.abort(), 15_000)

        try {
          const response = await fetch(url, {
            method,
            headers: Object.keys(headers).length ? headers : undefined,
            body,
            signal: controller.signal,
          })
          clearTimeout(timeout)

          const text = await response.text()
          if (!response.ok) {
            throw new Error(`HTTP ${response.status} ${response.statusText}: ${text.slice(0, 200)}`)
          }

          try {
            return JSON.stringify(JSON.parse(text), null, 2)
          } catch {
            return text
          }
        } catch (err: any) {
          clearTimeout(timeout)
          if (err.name === 'AbortError') {
            throw new Error(`Node "${node.data?.label}": Request timed out after 15s`)
          }
          throw err
        }
      }

      case 'util.json_parser': {
        if (!input) throw new Error(`Node "${node.data?.label}": no input to parse`)
        let obj: any
        try {
          obj = JSON.parse(input)
        } catch {
          throw new Error(`Node "${node.data?.label}": input is not valid JSON`)
        }
        const path = (node.data?.path ?? '').trim()
        if (!path) {
          return typeof obj === 'string' ? obj : JSON.stringify(obj)
        }
        const value = path.split('.').reduce((curr: any, key: string) => {
          if (curr === null || curr === undefined) return undefined
          const idx = parseInt(key)
          if (!isNaN(idx) && Array.isArray(curr)) return curr[idx]
          return curr[key]
        }, obj)
        if (value === undefined) {
          throw new Error(`Node "${node.data?.label}": path "${path}" not found in JSON`)
        }
        return typeof value === 'string' ? value : JSON.stringify(value)
      }

      case 'util.transform_data': {
        const template = node.data?.template ?? ''
        if (!template) return input
        return this.sub(template, input, variables)
      }

      case 'util.set_variable': {
        const varName = (node.data?.variableName ?? '').trim()
        if (!varName) throw new Error(`Node "${node.data?.label}": variable name is required`)
        variables[varName] = node.data?.value
          ? this.sub(node.data.value, input, variables)
          : (input ?? '')
        return input
      }

      case 'util.log': {
        const message = node.data?.message
          ? this.sub(node.data.message, input, variables)
          : (input ?? '')
        return message
      }

      case 'mcp.execute_tool': {
        const serverId = node.data?.serverId
        const toolName = node.data?.toolName
        if (!serverId) throw new Error(`Node "${node.data?.label}": no MCP server selected`)
        if (!toolName) throw new Error(`Node "${node.data?.label}": no tool name specified`)
        const argsTemplate = node.data?.arguments ?? '{}'
        const argsJson = this.sub(argsTemplate, input, variables)
        return this.mcpService.callTool(serverId, toolName, argsJson)
      }

      case 'mcp.fetch_resource': {
        const serverId = node.data?.serverId
        if (!serverId) throw new Error(`Node "${node.data?.label}": no MCP server selected`)
        const uriTemplate = node.data?.resourceUri ?? ''
        if (!uriTemplate) throw new Error(`Node "${node.data?.label}": resource URI is required`)
        const uri = this.sub(uriTemplate, input, variables)
        return this.mcpService.readResource(serverId, uri)
      }

      case 'ai.agent_review': {
        const agentId = node.data?.agentId
        if (!agentId) throw new Error(`Node "${node.data?.label}": no agent selected`)
        const criteria = node.data?.criteria
          ? this.sub(node.data.criteria, input, variables)
          : 'Is the content appropriate and correct?'
        const message = `Review the following content and respond ONLY with "approved" or "rejected" — no other text.\n\nCriteria: ${criteria}\n\nContent:\n${input ?? '(empty)'}`
        const response = await this.agentRunner.run(agentId, userId, message)
        return (response ?? '').toLowerCase().includes('approved') ? 'yes' : 'no'
      }

      case 'control.switch': {
        const cases: { value: string; label: string }[] = node.data?.cases ?? []
        const trimmed = (input ?? '').trim()
        const match = cases.find((c) => c.value === trimmed)
        return match ? match.value : 'default'
      }

      case 'util.response':
        return input

      default:
        return input
    }
  }

  private evalCondition(condition: string, output: string): boolean {
    if (!condition.trim()) return true
    try {
      // eslint-disable-next-line no-new-func
      return !!new Function('output', `return !!(${condition})`)(output)
    } catch {
      return false
    }
  }
}
