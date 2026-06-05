import { Handle, Position } from '@xyflow/react'
import { FolderOpen } from 'lucide-react'
import { cn } from '@/lib/utils'

export function McpResourceNode({ data, selected }: { data: any; selected?: boolean }) {
  return (
    <div className={cn(
      'w-52 rounded-lg border-2 bg-card shadow-md transition-colors',
      selected ? 'border-sky-400' : 'border-sky-600/60 hover:border-sky-500',
    )}>
      <Handle
        type="target"
        position={Position.Top}
        className="!w-3 !h-3 !bg-sky-500 !border-2 !border-sky-300"
      />
      <div className="flex items-center gap-2 px-3 py-2 border-b border-sky-600/30 bg-sky-500/10 rounded-t-md">
        <FolderOpen size={12} className="text-sky-400 shrink-0" />
        <span className="text-xs font-semibold text-sky-400 uppercase tracking-wide">MCP Resource</span>
      </div>
      <div className="px-3 py-2.5">
        <p className="text-sm font-medium">{data.label || 'Fetch Resource'}</p>
        <p className="text-xs text-muted-foreground mt-0.5 font-mono truncate">
          {data.resourceUri || <span className="not-italic text-muted-foreground/50">no URI set</span>}
        </p>
        {data.serverName && (
          <p className="text-[10px] text-sky-400/70 mt-0.5 truncate">{data.serverName}</p>
        )}
      </div>
      <Handle
        type="source"
        position={Position.Bottom}
        className="!w-3 !h-3 !bg-sky-500 !border-2 !border-sky-300"
      />
    </div>
  )
}
