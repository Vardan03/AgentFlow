import { Handle, Position } from '@xyflow/react'
import { Layers } from 'lucide-react'
import { cn } from '@/lib/utils'

export function SwitchNode({ data, selected }: { data: any; selected?: boolean }) {
  const cases: { value: string; label: string }[] = data.cases ?? []
  const totalHandles = cases.length + 1 // +1 for default

  return (
    <div className={cn(
      'w-56 rounded-lg border-2 bg-card shadow-md transition-colors',
      selected ? 'border-orange-400' : 'border-orange-600/60 hover:border-orange-500',
    )}>
      <Handle
        type="target"
        position={Position.Top}
        className="!w-3 !h-3 !bg-orange-500 !border-2 !border-orange-300"
      />
      <div className="flex items-center gap-2 px-3 py-2 border-b border-orange-600/30 bg-orange-500/10 rounded-t-md">
        <Layers size={12} className="text-orange-400 shrink-0" />
        <span className="text-xs font-semibold text-orange-400 uppercase tracking-wide">Switch</span>
      </div>
      <div className="px-3 py-2.5">
        <p className="text-sm font-medium">{data.label || 'Switch'}</p>
        <div className="mt-1.5 space-y-0.5">
          {cases.length === 0 ? (
            <p className="text-xs text-muted-foreground/50 italic">No cases defined</p>
          ) : (
            cases.map((c, i) => (
              <div key={i} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <span className="w-1.5 h-1.5 rounded-full bg-orange-400/70 shrink-0" />
                <span className="truncate">{c.value || `Case ${i + 1}`}</span>
              </div>
            ))
          )}
        </div>
      </div>
      {/* Handle labels */}
      <div className="relative h-4 mx-0">
        {cases.map((c, i) => {
          const pct = ((i + 1) / (totalHandles + 1)) * 100
          return (
            <span
              key={i}
              className="absolute text-[9px] text-orange-400 -translate-x-1/2"
              style={{ left: `${pct}%` }}
            >
              {(c.label || c.value || `C${i + 1}`).slice(0, 5)}
            </span>
          )
        })}
        <span
          className="absolute text-[9px] text-slate-400 -translate-x-1/2"
          style={{ left: `${((cases.length + 1) / (totalHandles + 1)) * 100}%` }}
        >
          else
        </span>
      </div>
      {/* Case handles */}
      {cases.map((c, i) => (
        <Handle
          key={`case-${i}`}
          type="source"
          position={Position.Bottom}
          id={c.value || `case-${i}`}
          style={{ left: `${((i + 1) / (totalHandles + 1)) * 100}%` }}
          className="!w-3 !h-3 !bg-orange-500 !border-2 !border-orange-300"
        />
      ))}
      {/* Default handle */}
      <Handle
        type="source"
        position={Position.Bottom}
        id="default"
        style={{ left: `${((cases.length + 1) / (totalHandles + 1)) * 100}%` }}
        className="!w-3 !h-3 !bg-slate-500 !border-2 !border-slate-300"
      />
    </div>
  )
}
