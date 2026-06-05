import { Handle, Position } from '@xyflow/react'
import { Brain } from 'lucide-react'
import { cn } from '@/lib/utils'

export function AgentDecisionNode({ data, selected }: { data: any; selected?: boolean }) {
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
        <Brain size={12} className="text-purple-400 shrink-0" />
        <span className="text-xs font-semibold text-purple-400 uppercase tracking-wide">Agent Decision</span>
      </div>
      <div className="px-3 py-2.5">
        <p className="text-sm font-medium">{data.label || 'Agent Decision'}</p>
        <p className="text-xs text-muted-foreground mt-0.5 truncate">
          {data.question || 'No question set'}
        </p>
      </div>
      <div className="flex justify-between px-4 pb-1">
        <span className="text-[10px] text-green-400">Yes</span>
        <span className="text-[10px] text-red-400">No</span>
      </div>
      <Handle
        type="source"
        position={Position.Bottom}
        id="yes"
        style={{ left: '30%' }}
        className="!w-3 !h-3 !bg-green-500 !border-2 !border-green-300"
      />
      <Handle
        type="source"
        position={Position.Bottom}
        id="no"
        style={{ left: '70%' }}
        className="!w-3 !h-3 !bg-red-500 !border-2 !border-red-300"
      />
    </div>
  )
}
