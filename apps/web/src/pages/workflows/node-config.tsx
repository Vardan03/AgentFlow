import { useState } from 'react'
import type { Node } from '@xyflow/react'
import { X, Trash2, Globe, Brain, Terminal, Tags, Wand2, Braces, Clock, Plug2, FolderOpen, RefreshCw, ShieldCheck, Layers, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useAgents } from '@/hooks/use-agents'
import { useMcpServers, useMcpTools } from '@/hooks/use-mcp'

const HTTP_METHODS = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'] as const

interface Props {
  node: Node
  onUpdate: (id: string, data: Record<string, any>) => void
  onDelete: (id: string) => void
  onClose: () => void
}

export function NodeConfig({ node, onUpdate, onDelete, onClose }: Props) {
  const { data: agents } = useAgents()
  const { data: mcpServers } = useMcpServers()
  const [loadTools, setLoadTools] = useState(false)
  const { data: mcpTools, isFetching: toolsFetching } = useMcpTools(
    loadTools ? (node.data as any)?.serverId ?? '' : '',
  )
  const data = node.data as Record<string, any>

  return (
    <div className="w-72 shrink-0 border-l border-border bg-card overflow-y-auto flex flex-col">
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        <p className="text-sm font-semibold">Node settings</p>
        <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
          <X size={15} />
        </button>
      </div>

      <div className="flex-1 p-4 space-y-4">
        {/* Trigger node */}
        {node.type === 'trigger.manual' && (
          <div className="space-y-3">
            <div className="rounded-md bg-green-500/10 border border-green-600/30 px-3 py-2.5">
              <p className="text-xs text-green-400 font-medium">Manual Trigger</p>
              <p className="text-xs text-muted-foreground mt-1">
                This is the entry point of your workflow. It will be started manually via the Run button.
              </p>
            </div>
          </div>
        )}

        {/* Agent node */}
        {node.type === 'ai.run_agent' && (
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label className="text-xs">Label</Label>
              <Input
                className="nodrag h-8 text-sm"
                value={data.label ?? ''}
                onChange={(e) => onUpdate(node.id, { label: e.target.value })}
                placeholder="Run Agent"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Agent</Label>
              <select
                className="nodrag flex h-8 w-full rounded-md border border-input bg-background px-2 py-1 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                value={data.agentId ?? ''}
                onChange={(e) => {
                  const agent = agents?.find((a) => a.id === e.target.value)
                  onUpdate(node.id, {
                    agentId: e.target.value,
                    agentName: agent?.name ?? '',
                  })
                }}
              >
                <option value="">Select an agent…</option>
                {agents?.map((a) => (
                  <option key={a.id} value={a.id}>{a.name}</option>
                ))}
              </select>
              {data.agentId && agents && (
                <p className="text-[10px] text-muted-foreground">
                  Provider: {agents.find(a => a.id === data.agentId)?.provider ?? '—'}
                </p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Input message</Label>
              <Textarea
                className="nodrag text-sm min-h-[100px] resize-none"
                value={data.input ?? ''}
                onChange={(e) => onUpdate(node.id, { input: e.target.value })}
                placeholder="Type the message to send to the agent…"
              />
              <p className="text-[10px] text-muted-foreground">
                This is the message sent to the agent when the workflow runs.
              </p>
            </div>
          </div>
        )}

        {/* Condition node */}
        {node.type === 'control.condition' && (
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label className="text-xs">Label</Label>
              <Input
                className="nodrag h-8 text-sm"
                value={data.label ?? ''}
                onChange={(e) => onUpdate(node.id, { label: e.target.value })}
                placeholder="Condition"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Condition expression</Label>
              <Textarea
                className="nodrag text-sm font-mono min-h-[80px] resize-none"
                value={data.condition ?? ''}
                onChange={(e) => onUpdate(node.id, { condition: e.target.value })}
                placeholder="e.g. output.length > 100"
              />
              <p className="text-[10px] text-muted-foreground">
                Use the green handle for "yes", red for "no".
              </p>
            </div>
          </div>
        )}

        {/* HTTP Request node */}
        {node.type === 'util.http_request' && (
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label className="text-xs">Label</Label>
              <Input
                className="nodrag h-8 text-sm"
                value={data.label ?? ''}
                onChange={(e) => onUpdate(node.id, { label: e.target.value })}
                placeholder="HTTP Request"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Method</Label>
              <select
                className="nodrag flex h-8 w-full rounded-md border border-input bg-background px-2 py-1 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                value={data.method ?? 'GET'}
                onChange={(e) => onUpdate(node.id, { method: e.target.value })}
              >
                {HTTP_METHODS.map((m) => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">URL</Label>
              <Input
                className="nodrag h-8 text-sm font-mono"
                value={data.url ?? ''}
                onChange={(e) => onUpdate(node.id, { url: e.target.value })}
                placeholder="https://api.example.com/data"
              />
              <p className="text-[10px] text-muted-foreground">
                Use <code className="bg-muted px-0.5 rounded">{'{{input}}'}</code> to pass the previous node's output.
              </p>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Headers <span className="text-muted-foreground">(JSON, optional)</span></Label>
              <Textarea
                className="nodrag text-sm font-mono min-h-[72px] resize-none"
                value={data.headers ?? ''}
                onChange={(e) => onUpdate(node.id, { headers: e.target.value })}
                placeholder={'{\n  "Authorization": "Bearer ..."\n}'}
              />
            </div>
            {['POST', 'PUT', 'PATCH'].includes(data.method ?? 'GET') && (
              <div className="space-y-1.5">
                <Label className="text-xs">Body <span className="text-muted-foreground">(optional)</span></Label>
                <Textarea
                  className="nodrag text-sm font-mono min-h-[80px] resize-none"
                  value={data.body ?? ''}
                  onChange={(e) => onUpdate(node.id, { body: e.target.value })}
                  placeholder={'{\n  "key": "{{input}}"\n}'}
                />
              </div>
            )}
            <div className="rounded-md bg-cyan-500/10 border border-cyan-600/30 px-3 py-2">
              <div className="flex items-center gap-1.5 mb-1">
                <Globe size={11} className="text-cyan-400" />
                <p className="text-xs text-cyan-400 font-medium">Response</p>
              </div>
              <p className="text-[10px] text-muted-foreground">
                The response body is passed to the next node. Non-2xx responses will fail the workflow.
              </p>
            </div>
          </div>
        )}

        {/* Agent Decision node */}
        {node.type === 'ai.agent_decision' && (
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label className="text-xs">Label</Label>
              <Input
                className="nodrag h-8 text-sm"
                value={data.label ?? ''}
                onChange={(e) => onUpdate(node.id, { label: e.target.value })}
                placeholder="Agent Decision"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Agent</Label>
              <select
                className="nodrag flex h-8 w-full rounded-md border border-input bg-background px-2 py-1 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                value={data.agentId ?? ''}
                onChange={(e) => {
                  const agent = agents?.find((a) => a.id === e.target.value)
                  onUpdate(node.id, { agentId: e.target.value, agentName: agent?.name ?? '' })
                }}
              >
                <option value="">Select an agent…</option>
                {agents?.map((a) => (
                  <option key={a.id} value={a.id}>{a.name}</option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Decision question</Label>
              <Textarea
                className="nodrag text-sm min-h-[80px] resize-none"
                value={data.question ?? ''}
                onChange={(e) => onUpdate(node.id, { question: e.target.value })}
                placeholder="Is the content appropriate for publishing?"
              />
              <p className="text-[10px] text-muted-foreground">
                The agent answers yes or no. Use the green handle for "yes", red for "no".
              </p>
            </div>
            <div className="rounded-md bg-purple-500/10 border border-purple-600/30 px-3 py-2">
              <div className="flex items-center gap-1.5 mb-1">
                <Brain size={11} className="text-purple-400" />
                <p className="text-xs text-purple-400 font-medium">AI Decision</p>
              </div>
              <p className="text-[10px] text-muted-foreground">
                The agent receives the previous node's output and answers the question above.
              </p>
            </div>
          </div>
        )}

        {/* Delay node */}
        {node.type === 'control.delay' && (
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label className="text-xs">Label</Label>
              <Input
                className="nodrag h-8 text-sm"
                value={data.label ?? ''}
                onChange={(e) => onUpdate(node.id, { label: e.target.value })}
                placeholder="Delay"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Delay (seconds)</Label>
              <Input
                className="nodrag h-8 text-sm"
                type="number"
                min={0}
                max={60}
                value={data.delaySeconds ?? 2}
                onChange={(e) => onUpdate(node.id, { delaySeconds: Number(e.target.value) })}
              />
              <p className="text-[10px] text-muted-foreground">Maximum 60 seconds.</p>
            </div>
            <div className="rounded-md bg-slate-500/10 border border-slate-500/30 px-3 py-2">
              <div className="flex items-center gap-1.5 mb-1">
                <Clock size={11} className="text-slate-400" />
                <p className="text-xs text-slate-400 font-medium">Pass-through</p>
              </div>
              <p className="text-[10px] text-muted-foreground">
                The input is passed to the next node unchanged after the delay.
              </p>
            </div>
          </div>
        )}

        {/* Set Variable node */}
        {node.type === 'util.set_variable' && (
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label className="text-xs">Label</Label>
              <Input
                className="nodrag h-8 text-sm"
                value={data.label ?? ''}
                onChange={(e) => onUpdate(node.id, { label: e.target.value })}
                placeholder="Set Variable"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Variable name</Label>
              <Input
                className="nodrag h-8 text-sm font-mono"
                value={data.variableName ?? ''}
                onChange={(e) => onUpdate(node.id, { variableName: e.target.value })}
                placeholder="myVariable"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Value <span className="text-muted-foreground">(optional)</span></Label>
              <Input
                className="nodrag h-8 text-sm font-mono"
                value={data.value ?? ''}
                onChange={(e) => onUpdate(node.id, { value: e.target.value })}
                placeholder="Leave blank to use previous node's output"
              />
              <p className="text-[10px] text-muted-foreground">
                Use <code className="bg-muted px-0.5 rounded">{'{{input}}'}</code> to reference the current value.
              </p>
            </div>
            <div className="rounded-md bg-teal-500/10 border border-teal-600/30 px-3 py-2">
              <div className="flex items-center gap-1.5 mb-1">
                <Tags size={11} className="text-teal-400" />
                <p className="text-xs text-teal-400 font-medium">Usage</p>
              </div>
              <p className="text-[10px] text-muted-foreground">
                Reference this variable later with{' '}
                <code className="bg-muted px-0.5 rounded">
                  {'{{var.'}
                  {data.variableName || 'name'}
                  {'}}'}
                </code>
              </p>
            </div>
          </div>
        )}

        {/* Transform node */}
        {node.type === 'util.transform_data' && (
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label className="text-xs">Label</Label>
              <Input
                className="nodrag h-8 text-sm"
                value={data.label ?? ''}
                onChange={(e) => onUpdate(node.id, { label: e.target.value })}
                placeholder="Transform"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Template</Label>
              <Textarea
                className="nodrag text-sm font-mono min-h-[100px] resize-none"
                value={data.template ?? ''}
                onChange={(e) => onUpdate(node.id, { template: e.target.value })}
                placeholder={'The result is: {{input}}'}
              />
              <p className="text-[10px] text-muted-foreground">
                Use <code className="bg-muted px-0.5 rounded">{'{{input}}'}</code> for the previous node's output
                and <code className="bg-muted px-0.5 rounded">{'{{var.name}}'}</code> for stored variables.
              </p>
            </div>
            <div className="rounded-md bg-rose-500/10 border border-rose-600/30 px-3 py-2">
              <div className="flex items-center gap-1.5 mb-1">
                <Wand2 size={11} className="text-rose-400" />
                <p className="text-xs text-rose-400 font-medium">Output</p>
              </div>
              <p className="text-[10px] text-muted-foreground">
                The rendered template string is passed to the next node.
              </p>
            </div>
          </div>
        )}

        {/* JSON Parser node */}
        {node.type === 'util.json_parser' && (
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label className="text-xs">Label</Label>
              <Input
                className="nodrag h-8 text-sm"
                value={data.label ?? ''}
                onChange={(e) => onUpdate(node.id, { label: e.target.value })}
                placeholder="JSON Parser"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Field path</Label>
              <Input
                className="nodrag h-8 text-sm font-mono"
                value={data.path ?? ''}
                onChange={(e) => onUpdate(node.id, { path: e.target.value })}
                placeholder="data.price"
              />
              <p className="text-[10px] text-muted-foreground">
                Dot-notation path into the JSON. e.g. <code className="bg-muted px-0.5 rounded">items.0.name</code>
              </p>
            </div>
            <div className="rounded-md bg-indigo-500/10 border border-indigo-600/30 px-3 py-2">
              <div className="flex items-center gap-1.5 mb-1">
                <Braces size={11} className="text-indigo-400" />
                <p className="text-xs text-indigo-400 font-medium">Output</p>
              </div>
              <p className="text-[10px] text-muted-foreground">
                The extracted value is passed to the next node as a string. Fails if the path is not found.
              </p>
            </div>
          </div>
        )}

        {/* Log node */}
        {node.type === 'util.log' && (
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label className="text-xs">Label</Label>
              <Input
                className="nodrag h-8 text-sm"
                value={data.label ?? ''}
                onChange={(e) => onUpdate(node.id, { label: e.target.value })}
                placeholder="Log"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Message <span className="text-muted-foreground">(optional)</span></Label>
              <Textarea
                className="nodrag text-sm font-mono min-h-[80px] resize-none"
                value={data.message ?? ''}
                onChange={(e) => onUpdate(node.id, { message: e.target.value })}
                placeholder={'Debug: {{input}}'}
              />
              <p className="text-[10px] text-muted-foreground">
                Leave blank to log the raw input. Use <code className="bg-muted px-0.5 rounded">{'{{input}}'}</code> to embed it in a message.
              </p>
            </div>
            <div className="rounded-md bg-orange-500/10 border border-orange-600/30 px-3 py-2">
              <div className="flex items-center gap-1.5 mb-1">
                <Terminal size={11} className="text-orange-400" />
                <p className="text-xs text-orange-400 font-medium">Pass-through</p>
              </div>
              <p className="text-[10px] text-muted-foreground">
                The original input is always passed to the next node unchanged.
              </p>
            </div>
          </div>
        )}

        {/* MCP Execute Tool node */}
        {node.type === 'mcp.execute_tool' && (
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label className="text-xs">Label</Label>
              <Input
                className="nodrag h-8 text-sm"
                value={data.label ?? ''}
                onChange={(e) => onUpdate(node.id, { label: e.target.value })}
                placeholder="MCP Tool"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">MCP Server</Label>
              <select
                className="nodrag flex h-8 w-full rounded-md border border-input bg-background px-2 py-1 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                value={data.serverId ?? ''}
                onChange={(e) => {
                  const server = mcpServers?.find((s) => s.id === e.target.value)
                  onUpdate(node.id, { serverId: e.target.value, serverName: server?.name ?? '' })
                  setLoadTools(false)
                }}
              >
                <option value="">Select a server…</option>
                {mcpServers?.map((s) => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label className="text-xs">Tool name</Label>
                {data.serverId && (
                  <button
                    className="text-[10px] text-emerald-400 hover:text-emerald-300 flex items-center gap-1"
                    onClick={() => setLoadTools(true)}
                  >
                    <RefreshCw size={9} className={toolsFetching ? 'animate-spin' : ''} />
                    Load tools
                  </button>
                )}
              </div>
              {mcpTools && mcpTools.length > 0 ? (
                <select
                  className="nodrag flex h-8 w-full rounded-md border border-input bg-background px-2 py-1 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  value={data.toolName ?? ''}
                  onChange={(e) => onUpdate(node.id, { toolName: e.target.value })}
                >
                  <option value="">Select a tool…</option>
                  {mcpTools.map((t) => (
                    <option key={t.name} value={t.name} title={t.description}>{t.name}</option>
                  ))}
                </select>
              ) : (
                <Input
                  className="nodrag h-8 text-sm font-mono"
                  value={data.toolName ?? ''}
                  onChange={(e) => onUpdate(node.id, { toolName: e.target.value })}
                  placeholder="get_weather"
                />
              )}
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Arguments <span className="text-muted-foreground">(JSON)</span></Label>
              <Textarea
                className="nodrag text-sm font-mono min-h-[80px] resize-none"
                value={data.arguments ?? '{}'}
                onChange={(e) => onUpdate(node.id, { arguments: e.target.value })}
                placeholder={'{\n  "city": "{{input}}"\n}'}
              />
              <p className="text-[10px] text-muted-foreground">
                Use <code className="bg-muted px-0.5 rounded">{'{{input}}'}</code> or <code className="bg-muted px-0.5 rounded">{'{{var.name}}'}</code> in values.
              </p>
            </div>
            <div className="rounded-md bg-emerald-500/10 border border-emerald-600/30 px-3 py-2">
              <div className="flex items-center gap-1.5 mb-1">
                <Plug2 size={11} className="text-emerald-400" />
                <p className="text-xs text-emerald-400 font-medium">MCP JSON-RPC</p>
              </div>
              <p className="text-[10px] text-muted-foreground">
                Calls <code className="bg-muted px-0.5 rounded">tools/call</code> on the MCP server and returns the text content.
              </p>
            </div>
          </div>
        )}

        {/* MCP Fetch Resource node */}
        {node.type === 'mcp.fetch_resource' && (
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label className="text-xs">Label</Label>
              <Input
                className="nodrag h-8 text-sm"
                value={data.label ?? ''}
                onChange={(e) => onUpdate(node.id, { label: e.target.value })}
                placeholder="MCP Resource"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">MCP Server</Label>
              <select
                className="nodrag flex h-8 w-full rounded-md border border-input bg-background px-2 py-1 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                value={data.serverId ?? ''}
                onChange={(e) => {
                  const server = mcpServers?.find((s) => s.id === e.target.value)
                  onUpdate(node.id, { serverId: e.target.value, serverName: server?.name ?? '' })
                }}
              >
                <option value="">Select a server…</option>
                {mcpServers?.map((s) => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Resource URI</Label>
              <Input
                className="nodrag h-8 text-sm font-mono"
                value={data.resourceUri ?? ''}
                onChange={(e) => onUpdate(node.id, { resourceUri: e.target.value })}
                placeholder="resource://docs/readme"
              />
              <p className="text-[10px] text-muted-foreground">
                Use <code className="bg-muted px-0.5 rounded">{'{{input}}'}</code> to make the URI dynamic.
              </p>
            </div>
            <div className="rounded-md bg-sky-500/10 border border-sky-600/30 px-3 py-2">
              <div className="flex items-center gap-1.5 mb-1">
                <FolderOpen size={11} className="text-sky-400" />
                <p className="text-xs text-sky-400 font-medium">MCP JSON-RPC</p>
              </div>
              <p className="text-[10px] text-muted-foreground">
                Calls <code className="bg-muted px-0.5 rounded">resources/read</code> and returns the resource text content.
              </p>
            </div>
          </div>
        )}

        {/* Agent Review node */}
        {node.type === 'ai.agent_review' && (
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label className="text-xs">Label</Label>
              <Input
                className="nodrag h-8 text-sm"
                value={data.label ?? ''}
                onChange={(e) => onUpdate(node.id, { label: e.target.value })}
                placeholder="Agent Review"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Agent</Label>
              <select
                className="nodrag flex h-8 w-full rounded-md border border-input bg-background px-2 py-1 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                value={data.agentId ?? ''}
                onChange={(e) => {
                  const agent = agents?.find((a) => a.id === e.target.value)
                  onUpdate(node.id, { agentId: e.target.value, agentName: agent?.name ?? '' })
                }}
              >
                <option value="">Select an agent…</option>
                {agents?.map((a) => (
                  <option key={a.id} value={a.id}>{a.name}</option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Review criteria</Label>
              <Textarea
                className="nodrag text-sm min-h-[80px] resize-none"
                value={data.criteria ?? ''}
                onChange={(e) => onUpdate(node.id, { criteria: e.target.value })}
                placeholder="The content must be factually accurate and professional in tone."
              />
              <p className="text-[10px] text-muted-foreground">
                The agent evaluates the previous node's output against these criteria.
              </p>
            </div>
            <div className="rounded-md bg-violet-500/10 border border-violet-600/30 px-3 py-2">
              <div className="flex items-center gap-1.5 mb-1">
                <ShieldCheck size={11} className="text-violet-400" />
                <p className="text-xs text-violet-400 font-medium">Routing</p>
              </div>
              <p className="text-[10px] text-muted-foreground">
                Green handle → Approved. Red handle → Rejected. The original input is forwarded either way.
              </p>
            </div>
          </div>
        )}

        {/* Switch node */}
        {node.type === 'control.switch' && (() => {
          const switchCases: { value: string; label: string }[] = data.cases ?? []
          return (
            <div className="space-y-3">
              <div className="space-y-1.5">
                <Label className="text-xs">Label</Label>
                <Input
                  className="nodrag h-8 text-sm"
                  value={data.label ?? ''}
                  onChange={(e) => onUpdate(node.id, { label: e.target.value })}
                  placeholder="Switch"
                />
              </div>
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label className="text-xs">Cases</Label>
                  <button
                    className="text-[10px] text-orange-400 hover:text-orange-300 flex items-center gap-0.5"
                    onClick={() => onUpdate(node.id, { cases: [...switchCases, { value: '', label: '' }] })}
                  >
                    <Plus size={10} />
                    Add case
                  </button>
                </div>
                {switchCases.length === 0 && (
                  <p className="text-[10px] text-muted-foreground italic">No cases yet. Add one to route on a value.</p>
                )}
                <div className="space-y-1.5">
                  {switchCases.map((c, i) => (
                    <div key={i} className="flex gap-1.5 items-center">
                      <Input
                        className="nodrag h-7 text-sm font-mono flex-1"
                        value={c.value}
                        onChange={(e) => {
                          const updated = switchCases.map((x, idx) => idx === i ? { ...x, value: e.target.value } : x)
                          onUpdate(node.id, { cases: updated })
                        }}
                        placeholder="match value"
                      />
                      <button
                        className="text-muted-foreground hover:text-destructive shrink-0"
                        onClick={() => onUpdate(node.id, { cases: switchCases.filter((_, idx) => idx !== i) })}
                      >
                        <X size={13} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
              <div className="rounded-md bg-orange-500/10 border border-orange-600/30 px-3 py-2">
                <div className="flex items-center gap-1.5 mb-1">
                  <Layers size={11} className="text-orange-400" />
                  <p className="text-xs text-orange-400 font-medium">Routing</p>
                </div>
                <p className="text-[10px] text-muted-foreground">
                  Routes to the handle whose value exactly matches the input. Falls back to the "else" handle.
                </p>
              </div>
            </div>
          )
        })()}

        {/* Output node */}
        {node.type === 'util.response' && (
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label className="text-xs">Label</Label>
              <Input
                className="nodrag h-8 text-sm"
                value={data.label ?? ''}
                onChange={(e) => onUpdate(node.id, { label: e.target.value })}
                placeholder="Response"
              />
            </div>
            <div className="rounded-md bg-purple-500/10 border border-purple-600/30 px-3 py-2.5">
              <p className="text-xs text-muted-foreground">
                This node marks the end of a workflow branch and returns its input as the result.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Delete */}
      {node.type !== 'trigger.manual' && (
        <div className="p-4 border-t border-border">
          <Button
            variant="outline"
            size="sm"
            className="w-full text-destructive hover:text-destructive border-destructive/30 hover:border-destructive/60"
            onClick={() => onDelete(node.id)}
          >
            <Trash2 size={13} className="mr-1.5" />
            Delete node
          </Button>
        </div>
      )}
    </div>
  )
}
