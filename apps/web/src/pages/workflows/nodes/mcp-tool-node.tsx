import { Handle, Position } from '@xyflow/react'
import { Plug2 } from 'lucide-react'
import { cn } from '@/lib/utils'

export function McpToolNode({ data, selected }: { data: any; selected?: boolean }) {
  return (
    <div className={cn(
      'w-52 rounded-lg border-2 bg-card shadow-md transition-colors',
      selected ? 'border-emerald-400' : 'border-emerald-600/60 hover:border-emerald-500',
    )}>
      <Handle
        type="target"
        position={Position.Top}
        className="!w-3 !h-3 !bg-emerald-500 !border-2 !border-emerald-300"
      />
      <div className="flex items-center gap-2 px-3 py-2 border-b border-emerald-600/30 bg-emerald-500/10 rounded-t-md">
        <Plug2 size={12} className="text-emerald-400 shrink-0" />
        <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wide">MCP Tool</span>
      </div>
      <div className="px-3 py-2.5">
        <p className="text-sm font-medium">{data.label || 'Execute Tool'}</p>
        <p className="text-xs text-muted-foreground mt-0.5 truncate">
          {data.toolName
            ? <span className="font-mono">{data.toolName}</span>
            : <span className="italic">no tool selected</span>}
        </p>
        {data.serverName && (
          <p className="text-[10px] text-emerald-400/70 mt-0.5 truncate">{data.serverName}</p>
        )}
      </div>
      <Handle
        type="source"
        position={Position.Bottom}
        className="!w-3 !h-3 !bg-emerald-500 !border-2 !border-emerald-300"
      />
    </div>
  )
}
