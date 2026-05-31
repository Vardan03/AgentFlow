import { Bot, GitBranch, MessageSquare, Zap } from 'lucide-react'

const PALETTE_ITEMS = [
  {
    type: 'trigger.manual',
    label: 'Manual Trigger',
    description: 'Start the workflow',
    icon: Zap,
    color: 'text-green-400',
    border: 'border-green-600/50 hover:border-green-500',
    bg: 'bg-green-500/10',
  },
  {
    type: 'ai.run_agent',
    label: 'Run Agent',
    description: 'Call an AI agent',
    icon: Bot,
    color: 'text-blue-400',
    border: 'border-blue-600/50 hover:border-blue-500',
    bg: 'bg-blue-500/10',
  },
  {
    type: 'control.condition',
    label: 'Condition',
    description: 'Branch on a condition',
    icon: GitBranch,
    color: 'text-amber-400',
    border: 'border-amber-600/50 hover:border-amber-500',
    bg: 'bg-amber-500/10',
  },
  {
    type: 'util.response',
    label: 'Response',
    description: 'Return a result',
    icon: MessageSquare,
    color: 'text-purple-400',
    border: 'border-purple-600/50 hover:border-purple-500',
    bg: 'bg-purple-500/10',
  },
]

export function NodePalette() {
  const onDragStart = (e: React.DragEvent, type: string) => {
    e.dataTransfer.setData('application/reactflow/type', type)
    e.dataTransfer.effectAllowed = 'move'
  }

  return (
    <div className="w-48 shrink-0 border-r border-border bg-card overflow-y-auto">
      <div className="px-3 py-3 border-b border-border">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Nodes</p>
      </div>
      <div className="p-2 space-y-1.5">
        {PALETTE_ITEMS.map((item) => {
          const Icon = item.icon
          return (
            <div
              key={item.type}
              draggable
              onDragStart={(e) => onDragStart(e, item.type)}
              className={`flex items-center gap-2.5 px-2.5 py-2 rounded-md border cursor-grab active:cursor-grabbing transition-colors ${item.border} ${item.bg}`}
            >
              <Icon size={14} className={item.color} />
              <div>
                <p className={`text-xs font-medium ${item.color}`}>{item.label}</p>
                <p className="text-[10px] text-muted-foreground">{item.description}</p>
              </div>
            </div>
          )
        })}
      </div>
      <div className="px-3 py-3 mt-2 border-t border-border">
        <p className="text-[10px] text-muted-foreground">Drag nodes onto the canvas to build your workflow</p>
      </div>
    </div>
  )
}
