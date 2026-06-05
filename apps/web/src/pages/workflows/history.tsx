import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, CheckCircle2, ChevronDown, ChevronRight, Clock, Loader2, Play, XCircle } from 'lucide-react'
import { AppLayout } from '@/components/layout/app-layout'
import { Button } from '@/components/ui/button'
import { useWorkflow } from '@/hooks/use-workflows'
import { useWorkflowExecutions, useExecuteWorkflow } from '@/hooks/use-executions'
import type { Execution, NodeLog } from '@/hooks/use-executions'

function formatDuration(startedAt: string | null, finishedAt: string | null): string {
  if (!startedAt || !finishedAt) return '—'
  const ms = new Date(finishedAt).getTime() - new Date(startedAt).getTime()
  if (ms < 1000) return `${ms}ms`
  return `${(ms / 1000).toFixed(1)}s`
}

function timeAgo(date: string): string {
  const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000)
  if (seconds < 60) return 'just now'
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`
  return `${Math.floor(seconds / 86400)}d ago`
}

function NodeLogRow({ log }: { log: NodeLog }) {
  const [expanded, setExpanded] = useState(false)
  return (
    <div className="border-b border-border last:border-0">
      <div
        className={`flex items-center gap-3 px-6 py-2.5 ${log.output ? 'cursor-pointer hover:bg-accent/30' : ''}`}
        onClick={() => log.output && setExpanded((v) => !v)}
      >
        {log.status === 'success'
          ? <CheckCircle2 size={12} className="text-emerald-400 shrink-0" />
          : <XCircle size={12} className="text-red-400 shrink-0" />
        }
        <span className="flex-1 text-xs font-medium truncate">{log.label}</span>
        <span className="text-xs text-muted-foreground font-mono shrink-0">{log.durationMs}ms</span>
        {log.output && (
          expanded
            ? <ChevronDown size={11} className="text-muted-foreground shrink-0" />
            : <ChevronRight size={11} className="text-muted-foreground shrink-0" />
        )}
      </div>
      {expanded && log.output && (
        <div className="px-6 pb-3">
          <pre className="text-xs text-muted-foreground bg-muted/40 rounded-md p-3 whitespace-pre-wrap break-words font-mono max-h-48 overflow-y-auto">
            {log.output}
          </pre>
        </div>
      )}
    </div>
  )
}

function ExecutionRow({ execution }: { execution: Execution }) {
  const [expanded, setExpanded] = useState(false)
  const logs = (execution.logs ?? []) as NodeLog[]

  const statusColor = {
    success: 'text-emerald-400',
    failed: 'text-red-400',
    running: 'text-blue-400',
    pending: 'text-muted-foreground',
  }[execution.status] ?? 'text-muted-foreground'

  const StatusIcon = () => {
    if (execution.status === 'success') return <CheckCircle2 size={15} className="text-emerald-400 shrink-0" />
    if (execution.status === 'failed') return <XCircle size={15} className="text-red-400 shrink-0" />
    if (execution.status === 'running') return <Loader2 size={15} className="text-blue-400 shrink-0 animate-spin" />
    return <Clock size={15} className="text-muted-foreground shrink-0" />
  }

  return (
    <div className="border border-border rounded-lg overflow-hidden">
      <button
        className="w-full flex items-center gap-3 px-4 py-3 bg-card hover:bg-accent/50 transition-colors text-left"
        onClick={() => setExpanded((v) => !v)}
      >
        <StatusIcon />
        <span className={`text-sm font-semibold capitalize ${statusColor}`}>{execution.status}</span>
        <span className="text-xs text-muted-foreground flex-1 text-left">{timeAgo(execution.createdAt)}</span>
        <span className="text-xs text-muted-foreground tabular-nums font-mono shrink-0">
          {formatDuration(execution.startedAt, execution.finishedAt)}
        </span>
        <span className="text-xs text-muted-foreground shrink-0">{logs.length} nodes</span>
        {expanded
          ? <ChevronDown size={13} className="text-muted-foreground shrink-0" />
          : <ChevronRight size={13} className="text-muted-foreground shrink-0" />
        }
      </button>
      {expanded && (
        <div className="border-t border-border bg-muted/10">
          {logs.length === 0 ? (
            <p className="text-xs text-muted-foreground px-6 py-3">No node logs recorded.</p>
          ) : (
            logs.map((log, i) => <NodeLogRow key={i} log={log} />)
          )}
        </div>
      )}
    </div>
  )
}

export default function WorkflowHistoryPage() {
  const { id } = useParams<{ id: string }>()
  const { data: workflow } = useWorkflow(id!)
  const { data: executions, isLoading, refetch } = useWorkflowExecutions(id!)
  const execute = useExecuteWorkflow(id!)

  const handleRun = () => {
    execute.mutate(undefined, { onSuccess: () => refetch() })
  }

  return (
    <AppLayout>
      <div className="p-8 max-w-3xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <Link to={`/workflows/${id}`}>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              <ArrowLeft size={15} />
            </Button>
          </Link>
          <div className="flex-1 min-w-0">
            <h1 className="text-xl font-bold truncate">{workflow?.name ?? 'Workflow'}</h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              {executions ? `${executions.length} run${executions.length !== 1 ? 's' : ''}` : 'Execution history'}
            </p>
          </div>
          <Button size="sm" variant="outline" disabled={execute.isPending} onClick={handleRun}>
            <Play size={13} className="mr-1.5" />
            {execute.isPending ? 'Running…' : 'Run now'}
          </Button>
        </div>

        {isLoading && (
          <p className="text-muted-foreground text-sm">Loading…</p>
        )}

        {!isLoading && executions?.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted mb-3">
              <Play size={20} className="text-muted-foreground" />
            </div>
            <p className="text-sm font-medium mb-1">No runs yet</p>
            <p className="text-xs text-muted-foreground mb-4">
              Run the workflow to see execution history here.
            </p>
            <Button size="sm" disabled={execute.isPending} onClick={handleRun}>
              <Play size={13} className="mr-1.5" />
              {execute.isPending ? 'Running…' : 'Run now'}
            </Button>
          </div>
        )}

        {executions && executions.length > 0 && (
          <div className="space-y-2">
            {executions.map((execution) => (
              <ExecutionRow key={execution.id} execution={execution} />
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  )
}
