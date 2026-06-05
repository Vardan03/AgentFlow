import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'

export interface McpServer {
  id: string
  name: string
  description: string | null
  endpoint: string
  authType: string
  authConfig: Record<string, string> | null
  isPredefined: boolean
  createdAt: string
  updatedAt: string
}

export interface McpTool {
  name: string
  description: string
  inputSchema: any
}

export function useMcpServers() {
  return useQuery({
    queryKey: ['mcp-servers'],
    queryFn: () => api.get('/mcp').then((r) => r.data as McpServer[]),
  })
}

export function useMcpTools(serverId: string) {
  return useQuery({
    queryKey: ['mcp-tools', serverId],
    queryFn: () => api.get(`/mcp/${serverId}/tools`).then((r) => r.data as McpTool[]),
    enabled: !!serverId,
    staleTime: 60_000,
  })
}

export function useCreateMcpServer() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: Omit<McpServer, 'id' | 'createdAt' | 'updatedAt'>) =>
      api.post('/mcp', data).then((r) => r.data as McpServer),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['mcp-servers'] }),
  })
}

export function useUpdateMcpServer(id: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: Partial<McpServer>) =>
      api.patch(`/mcp/${id}`, data).then((r) => r.data as McpServer),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['mcp-servers'] }),
  })
}

export function useDeleteMcpServer() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => api.delete(`/mcp/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['mcp-servers'] }),
  })
}
