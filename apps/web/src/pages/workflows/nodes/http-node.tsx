import { Handle, Position } from '@xyflow/react'
import { Globe } from 'lucide-react'
import { cn } from '@/lib/utils'

const METHOD_COLORS: Record<string, string> = {
  GET:    'bg-emerald-500/20 text-emerald-400',
  POST:   'bg-blue-500/20 text-blue-400',
  PUT:    'bg-amber-500/20 text-amber-400',
  PATCH:  'bg-violet-500/20 text-violet-400',
  DELETE: 'bg-red-500/20 text-red-400',
}

export function HttpNode({ data, selected }: { data: any; selected?: boolean }) {
  const method = data.method ?? 'GET'
  const methodColor = METHOD_COLORS[method] ?? METHOD_COLORS.GET

  let displayUrl = data.url || 'No URL set'
  try {
    const u = new URL(data.url)
    displayUrl = u.hostname + u.pathname
  } catch {}

  return (
    <div className={cn(
      'w-52 rounded-lg border-2 bg-card shadow-md transition-colors',
      selected ? 'border-cyan-400' : 'border-cyan-600/60 hover:border-cyan-500',
    )}>
      <Handle
        type="target"
        position={Position.Top}
        className="!w-3 !h-3 !bg-cyan-500 !border-2 !border-cyan-300"
      />
      <div className="flex items-center gap-2 px-3 py-2 border-b border-cyan-600/30 bg-cyan-500/10 rounded-t-md">
        <Globe size={12} className="text-cyan-400 shrink-0" />
        <span className="text-xs font-semibold text-cyan-400 uppercase tracking-wide">HTTP Request</span>
      </div>
      <div className="px-3 py-2.5">
        <p className="text-sm font-medium">{data.label || 'HTTP Request'}</p>
        <div className="flex items-center gap-1.5 mt-1.5">
          <span className={cn('rounded px-1.5 py-0.5 text-[10px] font-bold font-mono', methodColor)}>
            {method}
          </span>
          <span className="text-xs text-muted-foreground truncate">{displayUrl}</span>
        </div>
      </div>
      <Handle
        type="source"
        position={Position.Bottom}
        className="!w-3 !h-3 !bg-cyan-500 !border-2 !border-cyan-300"
      />
    </div>
  )
}
