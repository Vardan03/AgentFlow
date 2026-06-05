import { Handle, Position } from '@xyflow/react'
import { Bot } from 'lucide-react'
import { cn } from '@/lib/utils'

export function AgentNode({ data, selected }: { data: any; selected?: boolean }) {
  return (
    <div className={cn(
      'w-52 rounded-lg border-2 bg-card shadow-md transition-colors',
      selected ? 'border-blue-400' : 'border-blue-600/60 hover:border-blue-500',
    )}>
      <Handle
        type="target"
        position={Position.Top}
        className="!w-3 !h-3 !bg-blue-500 !border-2 !border-blue-300"
      />
      <div className="flex items-center gap-2 px-3 py-2 border-b border-blue-600/30 bg-blue-500/10 rounded-t-md">
        <Bot size={12} className="text-blue-400 shrink-0" />
        <span className="text-xs font-semibold text-blue-400 uppercase tracking-wide">AI Agent</span>
      </div>
      <div className="px-3 py-2.5">
        <p className="text-sm font-medium">{data.label || 'Run Agent'}</p>
        <p className="text-xs text-muted-foreground mt-0.5">
          {data.agentName || 'No agent selected'}
        </p>
        {data.input && (
          <p className="text-xs text-muted-foreground mt-1.5 font-mono truncate border-t border-border pt-1.5">
            "{data.input}"
          </p>
        )}
      </div>
      <Handle
        type="source"
        position={Position.Bottom}
        className="!w-3 !h-3 !bg-blue-500 !border-2 !border-blue-300"
      />
    </div>
  )
}
