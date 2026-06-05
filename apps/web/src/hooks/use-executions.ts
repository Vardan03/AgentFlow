import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'

export interface NodeLog {
  nodeId: string
  type: string
  label: string
  status: 'success' | 'failed'
  input: string | null
  output: string | null
  durationMs: number
}

export interface Execution {
  id: string
  status: 'pending' | 'running' | 'success' | 'failed'
  trigger: string
  logs: NodeLog[] | null
  output?: string | null
  startedAt: string | null
  finishedAt: string | null
  createdAt: string
  workflowId: string
}

export function useExecuteWorkflow(workflowId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: () =>
      api.post(`/workflows/${workflowId}/execute`).then((r) => r.data as Execution),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ['executions', workflowId] }),
  })
}

export function useWorkflowExecutions(workflowId: string) {
  return useQuery<Execution[]>({
    queryKey: ['executions', workflowId],
    queryFn: () => api.get(`/workflows/${workflowId}/executions`).then((r) => r.data),
    enabled: !!workflowId,
  })
}

export function useExecutionCount() {
  return useQuery<number>({
    queryKey: ['executions', 'count'],
    queryFn: () => api.get('/executions/count/me').then((r) => r.data),
  })
}

export interface RecentExecution extends Execution {
  workflow: { id: string; name: string }
}

export function useRecentExecutions() {
  return useQuery<RecentExecution[]>({
    queryKey: ['executions', 'recent'],
    queryFn: () => api.get('/executions/recent/me').then((r) => r.data),
    refetchInterval: 30_000,
  })
}

export interface UsageStats {
  agentUsage: { label: string; runs: number; successCount: number }[]
  mcpUsage:   { label: string; runs: number }[]
}

export function useUsageStats() {
  return useQuery<UsageStats>({
    queryKey: ['executions', 'usage'],
    queryFn: () => api.get('/executions/usage/me').then((r) => r.data),
    staleTime: 60_000,
  })
}
