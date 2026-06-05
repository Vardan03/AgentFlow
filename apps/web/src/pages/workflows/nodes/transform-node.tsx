import { Handle, Position } from '@xyflow/react'
import { Wand2 } from 'lucide-react'
import { cn } from '@/lib/utils'

export function TransformNode({ data, selected }: { data: any; selected?: boolean }) {
  return (
    <div className={cn(
      'w-52 rounded-lg border-2 bg-card shadow-md transition-colors',
      selected ? 'border-rose-400' : 'border-rose-600/60 hover:border-rose-500',
    )}>
      <Handle
        type="target"
        position={Position.Top}
        className="!w-3 !h-3 !bg-rose-500 !border-2 !border-rose-300"
      />
      <div className="flex items-center gap-2 px-3 py-2 border-b border-rose-600/30 bg-rose-500/10 rounded-t-md">
        <Wand2 size={12} className="text-rose-400 shrink-0" />
        <span className="text-xs font-semibold text-rose-400 uppercase tracking-wide">Transform</span>
      </div>
      <div className="px-3 py-2.5">
        <p className="text-sm font-medium">{data.label || 'Transform'}</p>
        <p className="text-xs text-muted-foreground mt-0.5 font-mono truncate">
          {data.template || 'No template set'}
        </p>
      </div>
      <Handle
        type="source"
        position={Position.Bottom}
        className="!w-3 !h-3 !bg-rose-500 !border-2 !border-rose-300"
      />
    </div>
  )
}
