import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'

export interface Workflow {
  id: string
  name: string
  description?: string | null
  graph: { nodes: any[]; edges: any[] }
  isEnabled: boolean
  version: number
  createdAt: string
  updatedAt: string
}

export function useWorkflows() {
  return useQuery<Workflow[]>({
    queryKey: ['workflows'],
    queryFn: () => api.get('/workflows').then((r) => r.data),
  })
}

export function useWorkflow(id: string) {
  return useQuery<Workflow>({
    queryKey: ['workflows', id],
    queryFn: () => api.get(`/workflows/${id}`).then((r) => r.data),
    enabled: !!id,
  })
}

export function useCreateWorkflow() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: { name: string; description?: string }) =>
      api.post('/workflows', data).then((r) => r.data as Workflow),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['workflows'] }),
  })
}

export function useUpdateWorkflow(id: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: { name?: string; description?: string; graph?: object; isEnabled?: boolean }) =>
      api.patch(`/workflows/${id}`, data).then((r) => r.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workflows'] })
      queryClient.invalidateQueries({ queryKey: ['workflows', id] })
    },
  })
}

export function useDeleteWorkflow() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => api.delete(`/workflows/${id}`).then((r) => r.data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['workflows'] }),
  })
}
