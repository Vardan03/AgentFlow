import { Bell, Bot, Brain, Braces, CalendarClock, Clock, FolderOpen, GitBranch, Globe, Layers, Merge, MessageSquare, Plug2, ShieldCheck, Tags, Terminal, Wand2, Webhook, Zap } from 'lucide-react'

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
    type: 'trigger.webhook',
    label: 'Webhook Trigger',
    description: 'Trigger via HTTP POST',
    icon: Webhook,
    color: 'text-green-400',
    border: 'border-green-600/50 hover:border-green-500',
    bg: 'bg-green-500/10',
  },
  {
    type: 'trigger.schedule',
    label: 'Schedule Trigger',
    description: 'Run on a cron schedule',
    icon: CalendarClock,
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
    type: 'ai.agent_decision',
    label: 'Agent Decision',
    description: 'AI picks a branch',
    icon: Brain,
    color: 'text-purple-400',
    border: 'border-purple-600/50 hover:border-purple-500',
    bg: 'bg-purple-500/10',
  },
  {
    type: 'ai.agent_review',
    label: 'Agent Review',
    description: 'AI approves or rejects',
    icon: ShieldCheck,
    color: 'text-violet-400',
    border: 'border-violet-600/50 hover:border-violet-500',
    bg: 'bg-violet-500/10',
  },
  {
    type: 'control.switch',
    label: 'Switch',
    description: 'Route on exact match',
    icon: Layers,
    color: 'text-orange-400',
    border: 'border-orange-600/50 hover:border-orange-500',
    bg: 'bg-orange-500/10',
  },
  {
    type: 'control.merge',
    label: 'Merge',
    description: 'Join parallel branches',
    icon: Merge,
    color: 'text-pink-400',
    border: 'border-pink-600/50 hover:border-pink-500',
    bg: 'bg-pink-500/10',
  },
  {
    type: 'util.http_request',
    label: 'HTTP Request',
    description: 'Fetch data from a URL',
    icon: Globe,
    color: 'text-cyan-400',
    border: 'border-cyan-600/50 hover:border-cyan-500',
    bg: 'bg-cyan-500/10',
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
    type: 'control.delay',
    label: 'Delay',
    description: 'Wait N seconds',
    icon: Clock,
    color: 'text-slate-400',
    border: 'border-slate-500/50 hover:border-slate-400',
    bg: 'bg-slate-500/10',
  },
  {
    type: 'util.json_parser',
    label: 'JSON Parser',
    description: 'Extract a JSON field',
    icon: Braces,
    color: 'text-indigo-400',
    border: 'border-indigo-600/50 hover:border-indigo-500',
    bg: 'bg-indigo-500/10',
  },
  {
    type: 'util.transform_data',
    label: 'Transform',
    description: 'Apply a template',
    icon: Wand2,
    color: 'text-rose-400',
    border: 'border-rose-600/50 hover:border-rose-500',
    bg: 'bg-rose-500/10',
  },
  {
    type: 'util.set_variable',
    label: 'Set Variable',
    description: 'Store a value',
    icon: Tags,
    color: 'text-teal-400',
    border: 'border-teal-600/50 hover:border-teal-500',
    bg: 'bg-teal-500/10',
  },
  {
    type: 'util.log',
    label: 'Log',
    description: 'Log to execution',
    icon: Terminal,
    color: 'text-orange-400',
    border: 'border-orange-600/50 hover:border-orange-500',
    bg: 'bg-orange-500/10',
  },
  {
    type: 'mcp.execute_tool',
    label: 'MCP Tool',
    description: 'Execute an MCP tool',
    icon: Plug2,
    color: 'text-emerald-400',
    border: 'border-emerald-600/50 hover:border-emerald-500',
    bg: 'bg-emerald-500/10',
  },
  {
    type: 'mcp.fetch_resource',
    label: 'MCP Resource',
    description: 'Fetch an MCP resource',
    icon: FolderOpen,
    color: 'text-sky-400',
    border: 'border-sky-600/50 hover:border-sky-500',
    bg: 'bg-sky-500/10',
  },
  {
    type: 'util.notification',
    label: 'Notification',
    description: 'Send to webhook URL',
    icon: Bell,
    color: 'text-yellow-400',
    border: 'border-yellow-600/50 hover:border-yellow-500',
    bg: 'bg-yellow-500/10',
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
