import Anthropic from '@anthropic-ai/sdk'
import { BadRequestException, Injectable, InternalServerErrorException } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'

@Injectable()
export class WorkflowGeneratorService {
  constructor(private prisma: PrismaService) {}

  async generate(description: string, userId: string) {
    const [user, agents] = await Promise.all([
      this.prisma.user.findUnique({
        where: { id: userId },
        select: { anthropicApiKey: true },
      }),
      this.prisma.agent.findMany({
        where: { userId },
        select: { id: true, name: true },
      }),
    ])

    if (!user?.anthropicApiKey) {
      throw new BadRequestException(
        'No Anthropic API key found. Please add it in Settings to use AI workflow generation.',
      )
    }

    const agentList = agents.length
      ? agents.map((a) => `- "${a.name}" (id: ${a.id})`).join('\n')
      : 'No agents defined yet — use agentId: "" and a descriptive agentName.'

    const systemPrompt = `You are a workflow graph generator for AgentFlow, a visual AI workflow automation platform.

Given a description, return a JSON object { nodes, edges } representing the workflow graph.

## Node Types

### trigger.manual — entry point (exactly one, always first)
{ id, type: "trigger.manual", data: { label: string } }

### util.http_request — fetches data from a URL
{ id, type: "util.http_request", data: { label: string, method: "GET"|"POST"|"PUT"|"PATCH"|"DELETE", url: string, headers: string, body: string } }
- headers: JSON string of key-value pairs, e.g. "{}" or "{\\"Content-Type\\":\\"application/json\\"}"
- body: request body string for POST/PUT/PATCH, empty string otherwise
- Use {{input}} anywhere in url, headers, or body to reference the previous node's output

### ai.run_agent — runs an AI agent with an input message
{ id, type: "ai.run_agent", data: { label: string, agentId: string, agentName: string, input: string } }
Use real agent ids/names when available, otherwise agentId: "" with a descriptive agentName.
Use {{input}} in the input field to pass the previous node's output to the agent.

### ai.agent_decision — AI agent answers yes/no to a question, routes accordingly
{ id, type: "ai.agent_decision", data: { label: string, agentId: string, agentName: string, question: string } }
MUST have exactly two outgoing edges: sourceHandle "yes" and sourceHandle "no".
The agent receives the previous node's output as context.

### control.condition — branches on a JavaScript boolean expression evaluated against the input string
{ id, type: "control.condition", data: { label: string, condition: string } }
MUST have exactly two outgoing edges: sourceHandle "yes" and sourceHandle "no".
Example conditions: output.length > 100, output.includes("error"), Number(output) > 50

### control.delay — waits N seconds before continuing
{ id, type: "control.delay", data: { label: string, delaySeconds: number } }
Maximum 60 seconds.

### util.json_parser — extracts a field from the input JSON by dot-notation path
{ id, type: "util.json_parser", data: { label: string, path: string } }
Example paths: "price", "data.items.0.name", "result.count"
Use after util.http_request to pull a specific field out of the API response.

### util.transform_data — applies a template string to produce new output
{ id, type: "util.transform_data", data: { label: string, template: string } }
Use {{input}} for the previous node's output, {{var.name}} for stored variables.
Example: "The current price is {{input}} USD"

### util.set_variable — stores a named variable for use in later nodes
{ id, type: "util.set_variable", data: { label: string, variableName: string, value: string } }
Leave value blank to store the previous node's output.
Reference stored values with {{var.name}} in any template or input field.

### util.log — logs a message to the execution output (pass-through)
{ id, type: "util.log", data: { label: string, message: string } }
Leave message blank to log the raw input. Use {{input}} to embed it in a message.
The original input is always passed through unchanged.

### util.response — ends a path and returns output
{ id, type: "util.response", data: { label: string } }

## Edge Format
{ id, source, target, sourceHandle? (only "yes"|"no" for condition/decision nodes), label? }

## Rules
1. Start with exactly one trigger.manual node
2. Every path ends at a util.response node
3. Condition and agent_decision nodes always have both yes and no edges
4. Use 3–8 nodes for simple workflows, up to 12 for complex ones
5. Node ids: short descriptive kebab-case (e.g. "http-fetch", "agent-summarize", "parse-price")
6. Chain nodes logically: http_request → json_parser → transform_data → ai.run_agent → response

Return ONLY valid JSON { nodes: [...], edges: [...] } — no markdown, no explanation.`

    const userMessage = `Create a workflow that: ${description}

Available agents:
${agentList}`

    try {
      const client = new Anthropic({ apiKey: user.anthropicApiKey })
      const response = await client.messages.create({
        model: 'claude-sonnet-4-6',
        max_tokens: 2048,
        system: systemPrompt,
        messages: [{ role: 'user', content: userMessage }],
      })

      const block = response.content[0]
      if (block.type !== 'text') {
        throw new InternalServerErrorException('Unexpected response from Claude')
      }

      let graph: { nodes: any[]; edges: any[] }
      try {
        graph = JSON.parse(block.text)
      } catch {
        const match = block.text.match(/\{[\s\S]*\}/)
        if (!match) throw new Error('No JSON found in response')
        graph = JSON.parse(match[0])
      }

      if (!Array.isArray(graph.nodes) || !Array.isArray(graph.edges)) {
        throw new InternalServerErrorException('Invalid workflow graph structure returned by Claude')
      }

      return graph
    } catch (err: any) {
      if (err instanceof BadRequestException || err instanceof InternalServerErrorException) throw err
      throw new InternalServerErrorException(err?.message ?? 'Failed to generate workflow')
    }
  }
}
