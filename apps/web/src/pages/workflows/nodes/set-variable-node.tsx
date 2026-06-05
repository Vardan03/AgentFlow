import { Handle, Position } from '@xyflow/react'
import { Tags } from 'lucide-react'
import { cn } from '@/lib/utils'

export function SetVariableNode({ data, selected }: { data: any; selected?: boolean }) {
  return (
    <div className={cn(
      'w-52 rounded-lg border-2 bg-card shadow-md transition-colors',
      selected ? 'border-teal-400' : 'border-teal-600/60 hover:border-teal-500',
    )}>
      <Handle
        type="target"
        position={Position.Top}
        className="!w-3 !h-3 !bg-teal-500 !border-2 !border-teal-300"
      />
      <div className="flex items-center gap-2 px-3 py-2 border-b border-teal-600/30 bg-teal-500/10 rounded-t-md">
        <Tags size={12} className="text-teal-400 shrink-0" />
        <span className="text-xs font-semibold text-teal-400 uppercase tracking-wide">Set Variable</span>
      </div>
      <div className="px-3 py-2.5">
        <p className="text-sm font-medium">{data.label || 'Set Variable'}</p>
        {data.variableName ? (
          <p className="text-xs text-muted-foreground mt-0.5 font-mono truncate">
            {data.variableName} ← {data.value || '(input)'}
          </p>
        ) : (
          <p className="text-xs text-muted-foreground mt-0.5">No variable set</p>
        )}
      </div>
      <Handle
        type="source"
        position={Position.Bottom}
        className="!w-3 !h-3 !bg-teal-500 !border-2 !border-teal-300"
      />
    </div>
  )
}
