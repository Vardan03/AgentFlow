import type { Node } from '@xyflow/react'
import { X, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useAgents } from '@/hooks/use-agents'

interface Props {
  node: Node
  onUpdate: (id: string, data: Record<string, any>) => void
  onDelete: (id: string) => void
  onClose: () => void
}

export function NodeConfig({ node, onUpdate, onDelete, onClose }: Props) {
  const { data: agents } = useAgents()
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
