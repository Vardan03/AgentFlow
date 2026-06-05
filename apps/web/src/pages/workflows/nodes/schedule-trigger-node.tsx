import { Handle, Position } from '@xyflow/react'
import { CalendarClock } from 'lucide-react'
import { cn } from '@/lib/utils'

export function ScheduleTriggerNode({ data, selected }: { data: any; selected?: boolean }) {
  return (
    <div className={cn(
      'w-52 rounded-lg border-2 bg-card shadow-md transition-colors',
      selected ? 'border-green-400' : 'border-green-600/60 hover:border-green-500',
    )}>
      <div className="flex items-center gap-2 px-3 py-2 border-b border-green-600/30 bg-green-500/10 rounded-t-md">
        <CalendarClock size={12} className="text-green-400 shrink-0" />
        <span className="text-xs font-semibold text-green-400 uppercase tracking-wide">Schedule Trigger</span>
      </div>
      <div className="px-3 py-2.5">
        <p className="text-sm font-medium">{data.label || 'Schedule Trigger'}</p>
        <p className="text-xs text-muted-foreground mt-0.5 font-mono truncate">
          {data.cronExpression || 'No schedule set'}
        </p>
      </div>
      <Handle
        type="source"
        position={Position.Bottom}
        className="!w-3 !h-3 !bg-green-500 !border-2 !border-green-300"
      />
    </div>
  )
}
