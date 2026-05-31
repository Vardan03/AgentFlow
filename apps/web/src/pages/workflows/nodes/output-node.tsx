import { Handle, Position } from '@xyflow/react'
import { MessageSquare } from 'lucide-react'
import { cn } from '@/lib/utils'

export function OutputNode({ data, selected }: { data: any; selected?: boolean }) {
  return (
    <div className={cn(
      'w-52 rounded-lg border-2 bg-card shadow-md transition-colors',
      selected ? 'border-purple-400' : 'border-purple-600/60 hover:border-purple-500',
    )}>
      <Handle
        type="target"
        position={Position.Top}
        className="!w-3 !h-3 !bg-purple-500 !border-2 !border-purple-300"
      />
      <div className="flex items-center gap-2 px-3 py-2 border-b border-purple-600/30 bg-purple-500/10 rounded-t-md">
        <MessageSquare size={12} className="text-purple-400 shrink-0" />
        <span className="text-xs font-semibold text-purple-400 uppercase tracking-wide">Output</span>
      </div>
      <div className="px-3 py-2.5">
        <p className="text-sm font-medium">{data.label || 'Response'}</p>
        <p className="text-xs text-muted-foreground mt-0.5">Returns the workflow result</p>
      </div>
    </div>
  )
}
