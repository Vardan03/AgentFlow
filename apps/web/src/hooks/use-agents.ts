import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'

export interface Agent {
  id: string
  name: string
  description?: string | null
  systemPrompt?: string | null
  model: string
  temperature: number
  maxTokens: number
  enabledTools: string[]
  createdAt: string
  updatedAt: string
}

export interface AgentFormData {
  name: string
  description?: string
  systemPrompt?: string
  model?: string
  temperature?: number
  maxTokens?: number
  enabledTools?: string[]
}

export function useAgents() {
  return useQuery<Agent[]>({
    queryKey: ['agents'],
    queryFn: () => api.get('/agents').then((r) => r.data),
  })
}

export function useAgent(id: string) {
  return useQuery<Agent>({
    queryKey: ['agents', id],
    queryFn: () => api.get(`/agents/${id}`).then((r) => r.data),
    enabled: !!id,
  })
}

export function useCreateAgent() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: AgentFormData) => api.post('/agents', data).then((r) => r.data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['agents'] }),
  })
}

export function useUpdateAgent(id: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: Partial<AgentFormData>) =>
      api.patch(`/agents/${id}`, data).then((r) => r.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agents'] })
      queryClient.invalidateQueries({ queryKey: ['agents', id] })
    },
  })
}

export function useDeleteAgent() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => api.delete(`/agents/${id}`).then((r) => r.data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['agents'] }),
  })
}

export function useRunAgent(id: string) {
  return useMutation({
    mutationFn: (message: string) =>
      api.post(`/agents/${id}/run`, { message }).then((r) => r.data.response as string),
  })
}

export function useSettings() {
  return useQuery({
    queryKey: ['settings'],
    queryFn: () => api.get('/settings').then((r) => r.data),
  })
}

export function useUpdateSettings() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: { anthropicApiKey?: string; name?: string }) =>
      api.patch('/settings', data).then((r) => r.data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['settings'] }),
  })
}
