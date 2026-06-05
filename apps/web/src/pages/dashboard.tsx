import { Link, useNavigate } from 'react-router-dom'
import { Bot, GitFork, Zap, TrendingUp, CheckCircle2, XCircle, Clock, Loader2, Plus, ArrowRight, Workflow } from 'lucide-react'
import { AppLayout } from '@/components/layout/app-layout'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useAgents } from '@/hooks/use-agents'
import { useWorkflows } from '@/hooks/use-workflows'
import { useExecutionCount, useRecentExecutions, useUsageStats } from '@/hooks/use-executions'
import { useAuthStore } from '@/store/auth.store'
import type { RecentExecution } from '@/hooks/use-executions'
import type { Workflow as WorkflowType } from '@/hooks/use-workflows'

function timeAgo(date: string): string {
  const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000)
  if (seconds < 60) return 'just now'
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`
  return `${Math.floor(seconds / 86400)}d ago`
}

function getDuration(startedAt: string | null, finishedAt: string | null): string {
  if (!startedAt || !finishedAt) return '—'
  const ms = new Date(finishedAt).getTime() - new Date(startedAt).getTime()
  if (ms < 1000) return `${ms}ms`
  return `${(ms / 1000).toFixed(1)}s`
}

function StatusBadge({ status }: { status: RecentExecution['status'] }) {
  const config = {
    success: { icon: <CheckCircle2 size={13} />, label: 'Success', className: 'text-emerald-400 bg-emerald-500/10' },
    failed:  { icon: <XCircle size={13} />,       label: 'Failed',  className: 'text-red-400 bg-red-500/10' },
    running: { icon: <Loader2 size={13} className="animate-spin" />, label: 'Running', className: 'text-blue-400 bg-blue-500/10' },
    pending: { icon: <Clock size={13} />,          label: 'Pending', className: 'text-muted-foreground bg-muted' },
  }
  const c = config[status] ?? config.pending
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${c.className}`}>
      {c.icon}
      {c.label}
    </span>
  )
}

function StatCard({
  icon, label, value, sub, iconClass, to,
}: {
  icon: React.ReactNode
  label: string
  value: string | number
  sub?: string
  iconClass: string
  to?: string
}) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${iconClass}`}>
            {icon}
          </div>
          {to && (
            <Link to={to} className="text-xs text-muted-foreground hover:text-foreground transition-colors">
              View all →
            </Link>
          )}
        </div>
        <p className="text-3xl font-bold tracking-tight">{value}</p>
        <p className="text-sm text-muted-foreground mt-1">{label}</p>
        {sub && <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>}
      </CardContent>
    </Card>
  )
}

function ExecutionRow({ execution }: { execution: RecentExecution }) {
  const navigate = useNavigate()
  return (
    <button
      onClick={() => navigate(`/workflows/${execution.workflowId}`)}
      className="w-full flex items-center gap-3 py-3 px-1 border-b border-border last:border-0 hover:bg-muted/40 rounded transition-colors text-left group"
    >
      <StatusBadge status={execution.status} />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate group-hover:text-foreground">{execution.workflow.name}</p>
        <p className="text-xs text-muted-foreground">{timeAgo(execution.createdAt)}</p>
      </div>
      <span className="text-xs text-muted-foreground shrink-0 tabular-nums">
        {getDuration(execution.startedAt, execution.finishedAt)}
      </span>
    </button>
  )
}

function WorkflowRow({ workflow }: { workflow: WorkflowType }) {
  const nodeCount = (workflow.graph as any)?.nodes?.length ?? 0
  return (
    <Link
      to={`/workflows/${workflow.id}`}
      className="flex items-center gap-3 py-3 px-1 border-b border-border last:border-0 hover:bg-muted/40 rounded transition-colors group"
    >
      <div className="flex h-8 w-8 items-center justify-center rounded-md bg-violet-500/10 shrink-0">
        <Workflow size={14} className="text-violet-400" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{workflow.name}</p>
        <p className="text-xs text-muted-foreground">
          {nodeCount} {nodeCount === 1 ? 'node' : 'nodes'} · updated {timeAgo(workflow.updatedAt)}
        </p>
      </div>
      <ArrowRight size={14} className="text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
    </Link>
  )
}

export default function DashboardPage() {
  const user = useAuthStore((s) => s.user)
  const { data: agents } = useAgents()
  const { data: workflows } = useWorkflows()
  const { data: executionCount } = useExecutionCount()
  const { data: recentExecutions } = useRecentExecutions()
  const { data: usageStats } = useUsageStats()

  const successCount = recentExecutions?.filter((e) => e.status === 'success').length ?? 0
  const recentTotal = recentExecutions?.length ?? 0
  const successRate = recentTotal > 0 ? Math.round((successCount / recentTotal) * 100) : null

  const recentWorkflows = workflows?.slice(0, 6) ?? []

  return (
    <AppLayout>
      <div className="p-8 max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold">
            Welcome back{user?.name ? `, ${user.name}` : ''}
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Here's an overview of your workspace.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard
            icon={<Bot size={18} className="text-blue-400" />}
            iconClass="bg-blue-500/10"
            label="Total agents"
            value={agents?.length ?? 0}
            to="/agents"
          />
          <StatCard
            icon={<GitFork size={18} className="text-violet-400" />}
            iconClass="bg-violet-500/10"
            label="Workflows"
            value={workflows?.length ?? 0}
            to="/workflows"
          />
          <StatCard
            icon={<Zap size={18} className="text-emerald-400" />}
            iconClass="bg-emerald-500/10"
            label="Total executions"
            value={executionCount ?? 0}
          />
          <StatCard
            icon={<TrendingUp size={18} className="text-amber-400" />}
            iconClass="bg-amber-500/10"
            label="Success rate"
            value={successRate !== null ? `${successRate}%` : '—'}
            sub={recentTotal > 0 ? `last ${recentTotal} runs` : 'no runs yet'}
          />
        </div>

        {/* Usage stats */}
        {usageStats && (usageStats.agentUsage.length > 0 || usageStats.mcpUsage.length > 0) && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-8">
            {usageStats.agentUsage.length > 0 && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-semibold">Agent Usage</CardTitle>
                </CardHeader>
                <CardContent className="px-6 pb-4 space-y-3">
                  {usageStats.agentUsage.map((item) => {
                    const rate = item.runs > 0 ? Math.round((item.successCount / item.runs) * 100) : 0
                    return (
                      <div key={item.label}>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-medium truncate max-w-[60%]">{item.label}</span>
                          <span className="text-xs text-muted-foreground tabular-nums">
                            {item.runs} run{item.runs !== 1 ? 's' : ''} · {rate}% success
                          </span>
                        </div>
                        <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                          <div
                            className="h-full rounded-full bg-blue-500"
                            style={{ width: `${rate}%` }}
                          />
                        </div>
                      </div>
                    )
                  })}
                </CardContent>
              </Card>
            )}
            {usageStats.mcpUsage.length > 0 && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-semibold">MCP Usage</CardTitle>
                </CardHeader>
                <CardContent className="px-6 pb-4 space-y-3">
                  {(() => {
                    const max = Math.max(...usageStats.mcpUsage.map((i) => i.runs), 1)
                    return usageStats.mcpUsage.map((item) => (
                      <div key={item.label}>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-medium truncate max-w-[60%]">{item.label}</span>
                          <span className="text-xs text-muted-foreground tabular-nums">
                            {item.runs} call{item.runs !== 1 ? 's' : ''}
                          </span>
                        </div>
                        <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                          <div
                            className="h-full rounded-full bg-emerald-500"
                            style={{ width: `${(item.runs / max) * 100}%` }}
                          />
                        </div>
                      </div>
                    ))
                  })()}
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Executions */}
          <Card className="lg:col-span-2">
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <CardTitle className="text-sm font-semibold">Recent Executions</CardTitle>
              <span className="text-xs text-muted-foreground">Auto-refreshes every 30s</span>
            </CardHeader>
            <CardContent className="px-6 pb-4">
              {recentExecutions && recentExecutions.length > 0 ? (
                <div>
                  {recentExecutions.map((execution) => (
                    <ExecutionRow key={execution.id} execution={execution} />
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted mb-3">
                    <Zap size={20} className="text-muted-foreground" />
                  </div>
                  <p className="text-sm font-medium mb-1">No executions yet</p>
                  <p className="text-xs text-muted-foreground mb-4">
                    Run a workflow to see results here.
                  </p>
                  {workflows && workflows.length > 0 && (
                    <Link to={`/workflows/${workflows[0].id}`}>
                      <Button size="sm" variant="outline">Open a workflow</Button>
                    </Link>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Workflows */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <CardTitle className="text-sm font-semibold">Workflows</CardTitle>
              <Link to="/workflows">
                <Button variant="ghost" size="sm" className="h-7 text-xs px-2 text-muted-foreground">
                  View all
                </Button>
              </Link>
            </CardHeader>
            <CardContent className="px-6 pb-4">
              {recentWorkflows.length > 0 ? (
                <>
                  <div>
                    {recentWorkflows.map((workflow) => (
                      <WorkflowRow key={workflow.id} workflow={workflow} />
                    ))}
                  </div>
                  <div className="mt-4">
                    <Link to="/workflows">
                      <Button variant="outline" size="sm" className="w-full text-xs">
                        <Plus size={13} className="mr-1.5" />
                        New workflow
                      </Button>
                    </Link>
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center py-10 text-center">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted mb-3">
                    <GitFork size={20} className="text-muted-foreground" />
                  </div>
                  <p className="text-sm font-medium mb-1">No workflows yet</p>
                  <p className="text-xs text-muted-foreground mb-4">
                    Build your first automated workflow.
                  </p>
                  <Link to="/workflows">
                    <Button size="sm">
                      <Plus size={13} className="mr-1.5" />
                      New workflow
                    </Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  )
}
