import { Handle, Position } from '@xyflow/react'
import { Clock } from 'lucide-react'
import { cn } from '@/lib/utils'

export function DelayNode({ data, selected }: { data: any; selected?: boolean }) {
  const secs = Number(data.delaySeconds ?? 0)
  return (
    <div className={cn(
      'w-52 rounded-lg border-2 bg-card shadow-md transition-colors',
      selected ? 'border-slate-400' : 'border-slate-500/60 hover:border-slate-400',
    )}>
      <Handle
        type="target"
        position={Position.Top}
        className="!w-3 !h-3 !bg-slate-500 !border-2 !border-slate-300"
      />
      <div className="flex items-center gap-2 px-3 py-2 border-b border-slate-500/30 bg-slate-500/10 rounded-t-md">
        <Clock size={12} className="text-slate-400 shrink-0" />
        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Delay</span>
      </div>
      <div className="px-3 py-2.5">
        <p className="text-sm font-medium">{data.label || 'Delay'}</p>
        <p className="text-xs text-muted-foreground mt-0.5">
          Wait {secs}s before continuing
        </p>
      </div>
      <Handle
        type="source"
        position={Position.Bottom}
        className="!w-3 !h-3 !bg-slate-500 !border-2 !border-slate-300"
      />
    </div>
  )
}
