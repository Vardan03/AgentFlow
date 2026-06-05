import { Handle, Position } from '@xyflow/react'
import { Braces } from 'lucide-react'
import { cn } from '@/lib/utils'

export function JsonParserNode({ data, selected }: { data: any; selected?: boolean }) {
  return (
    <div className={cn(
      'w-52 rounded-lg border-2 bg-card shadow-md transition-colors',
      selected ? 'border-indigo-400' : 'border-indigo-600/60 hover:border-indigo-500',
    )}>
      <Handle
        type="target"
        position={Position.Top}
        className="!w-3 !h-3 !bg-indigo-500 !border-2 !border-indigo-300"
      />
      <div className="flex items-center gap-2 px-3 py-2 border-b border-indigo-600/30 bg-indigo-500/10 rounded-t-md">
        <Braces size={12} className="text-indigo-400 shrink-0" />
        <span className="text-xs font-semibold text-indigo-400 uppercase tracking-wide">JSON Parser</span>
      </div>
      <div className="px-3 py-2.5">
        <p className="text-sm font-medium">{data.label || 'JSON Parser'}</p>
        <p className="text-xs text-muted-foreground mt-0.5 font-mono truncate">
          {data.path ? `.${data.path}` : 'No path set'}
        </p>
      </div>
      <Handle
        type="source"
        position={Position.Bottom}
        className="!w-3 !h-3 !bg-indigo-500 !border-2 !border-indigo-300"
      />
    </div>
  )
}
