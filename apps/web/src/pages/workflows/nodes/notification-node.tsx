import { Handle, Position } from '@xyflow/react'
import { Bell } from 'lucide-react'
import { cn } from '@/lib/utils'

export function NotificationNode({ data, selected }: { data: any; selected?: boolean }) {
  return (
    <div className={cn(
      'w-52 rounded-lg border-2 bg-card shadow-md transition-colors',
      selected ? 'border-yellow-400' : 'border-yellow-600/60 hover:border-yellow-500',
    )}>
      <Handle
        type="target"
        position={Position.Top}
        className="!w-3 !h-3 !bg-yellow-500 !border-2 !border-yellow-300"
      />
      <div className="flex items-center gap-2 px-3 py-2 border-b border-yellow-600/30 bg-yellow-500/10 rounded-t-md">
        <Bell size={12} className="text-yellow-400 shrink-0" />
        <span className="text-xs font-semibold text-yellow-400 uppercase tracking-wide">Notification</span>
      </div>
      <div className="px-3 py-2.5">
        <p className="text-sm font-medium">{data.label || 'Notification'}</p>
        <p className="text-xs text-muted-foreground mt-0.5 truncate">
          {data.webhookUrl ? 'Webhook configured' : 'No webhook set'}
        </p>
      </div>
      <Handle
        type="source"
        position={Position.Bottom}
        className="!w-3 !h-3 !bg-yellow-500 !border-2 !border-yellow-300"
      />
    </div>
  )
}
