import { Handle, Position } from '@xyflow/react'
import { Terminal } from 'lucide-react'
import { cn } from '@/lib/utils'

export function LogNode({ data, selected }: { data: any; selected?: boolean }) {
  return (
    <div className={cn(
      'w-52 rounded-lg border-2 bg-card shadow-md transition-colors',
      selected ? 'border-orange-400' : 'border-orange-600/60 hover:border-orange-500',
    )}>
      <Handle
        type="target"
        position={Position.Top}
        className="!w-3 !h-3 !bg-orange-500 !border-2 !border-orange-300"
      />
      <div className="flex items-center gap-2 px-3 py-2 border-b border-orange-600/30 bg-orange-500/10 rounded-t-md">
        <Terminal size={12} className="text-orange-400 shrink-0" />
        <span className="text-xs font-semibold text-orange-400 uppercase tracking-wide">Log</span>
      </div>
      <div className="px-3 py-2.5">
        <p className="text-sm font-medium">{data.label || 'Log'}</p>
        <p className="text-xs text-muted-foreground mt-0.5 font-mono truncate">
          {data.message || 'Logs input value'}
        </p>
      </div>
      <Handle
        type="source"
        position={Position.Bottom}
        className="!w-3 !h-3 !bg-orange-500 !border-2 !border-orange-300"
      />
    </div>
  )
}
