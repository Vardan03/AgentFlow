import { useState } from 'react'
import { CheckCircle2, ChevronDown, ChevronRight, Clock, XCircle, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Execution, NodeLog } from '@/hooks/use-executions'

interface Props {
  execution: Execution
  onClose: () => void
}

function formatDuration(ms: number) {
  if (ms < 1000) return `${ms}ms`
  return `${(ms / 1000).toFixed(1)}s`
}

function totalDuration(execution: Execution) {
  if (!execution.startedAt || !execution.finishedAt) return null
  return formatDuration(
    new Date(execution.finishedAt).getTime() - new Date(execution.startedAt).getTime(),
  )
}

function NodeLogRow({ log }: { log: NodeLog }) {
  const [expanded, setExpanded] = useState(false)
  const hasOutput = !!log.output

  return (
    <div className="border-b border-border last:border-0">
      <div
        className={cn(
          'flex items-center gap-3 px-4 py-2.5 text-sm',
          hasOutput && 'cursor-pointer hover:bg-accent/50',
        )}
        onClick={() => hasOutput && setExpanded((v) => !v)}
      >
        {log.status === 'success' ? (
          <CheckCircle2 size={14} className="text-green-400 shrink-0" />
        ) : (
          <XCircle size={14} className="text-red-400 shrink-0" />
        )}
        <span className="flex-1 font-medium truncate">{log.label}</span>
        <span className="text-xs text-muted-foreground font-mono shrink-0">
          {formatDuration(log.durationMs)}
        </span>
        {hasOutput && (
          expanded
            ? <ChevronDown size={13} className="text-muted-foreground shrink-0" />
            : <ChevronRight size={13} className="text-muted-foreground shrink-0" />
        )}
      </div>
      {expanded && log.output && (
        <div className="px-4 pb-3 pt-0">
          <pre className="text-xs text-muted-foreground bg-muted/30 rounded-md p-3 whitespace-pre-wrap break-words font-mono max-h-48 overflow-y-auto">
            {log.output}
          </pre>
        </div>
      )}
    </div>
  )
}

export function ExecutionPanel({ execution, onClose }: Props) {
  const success = execution.status === 'success'
  const duration = totalDuration(execution)

  return (
    <div className="border-t border-border bg-card shrink-0" style={{ maxHeight: '40vh' }}>
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-2.5 border-b border-border">
        {success ? (
          <CheckCircle2 size={15} className="text-green-400 shrink-0" />
        ) : (
          <XCircle size={15} className="text-red-400 shrink-0" />
        )}
        <span className="text-sm font-semibold">
          {success ? 'Execution succeeded' : 'Execution failed'}
        </span>
        {duration && (
          <span className="flex items-center gap-1 text-xs text-muted-foreground">
            <Clock size={11} />
            {duration}
          </span>
        )}
        <button
          onClick={onClose}
          className="ml-auto text-muted-foreground hover:text-foreground transition-colors"
        >
          <X size={14} />
        </button>
      </div>

      {/* Node logs */}
      <div className="overflow-y-auto" style={{ maxHeight: 'calc(40vh - 44px)' }}>
        {execution.logs?.map((log, i) => (
          <NodeLogRow key={i} log={log} />
        ))}
        {!execution.logs?.length && (
          <p className="text-sm text-muted-foreground px-4 py-3">No logs available.</p>
        )}
      </div>
    </div>
  )
}
