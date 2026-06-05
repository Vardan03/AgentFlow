import { Handle, Position } from '@xyflow/react'
import { Merge } from 'lucide-react'

export function MergeNode({ data, selected }: { data: any; selected?: boolean }) {
  return (
    <div
      className={`min-w-[180px] rounded-lg border bg-card px-4 py-3 shadow-sm transition-all ${
        selected ? 'border-pink-500 shadow-pink-500/20 shadow-md' : 'border-pink-600/40 hover:border-pink-500/70'
      }`}
    >
      <Handle type="target" position={Position.Top} id="a" style={{ left: '30%' }} className="!w-2.5 !h-2.5 !bg-pink-500 !border-pink-400" />
      <Handle type="target" position={Position.Top} id="b" style={{ left: '70%' }} className="!w-2.5 !h-2.5 !bg-pink-500 !border-pink-400" />

      <div className="flex items-center gap-2">
        <div className="flex h-7 w-7 items-center justify-center rounded-md bg-pink-500/15 shrink-0">
          <Merge size={14} className="text-pink-400" />
        </div>
        <div className="min-w-0">
          <p className="text-xs font-semibold text-pink-300 truncate">{data.label || 'Merge'}</p>
          <p className="text-[10px] text-muted-foreground mt-0.5">
            {data.mode === 'all' ? 'Wait for all branches' : 'First branch wins'}
          </p>
        </div>
      </div>

      <Handle type="source" position={Position.Bottom} id="out" className="!w-2.5 !h-2.5 !bg-pink-500 !border-pink-400" />
    </div>
  )
}
