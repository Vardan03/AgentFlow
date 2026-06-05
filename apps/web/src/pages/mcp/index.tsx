import { useState } from 'react'
import { Server, Plus, Pencil, Trash2, X, Loader2, Plug } from 'lucide-react'
import { Sidebar } from '@/components/layout/sidebar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  useMcpServers,
  useCreateMcpServer,
  useUpdateMcpServer,
  useDeleteMcpServer,
  type McpServer,
} from '@/hooks/use-mcp'

const AUTH_TYPES = [
  { value: 'none', label: 'No auth' },
  { value: 'bearer', label: 'Bearer token' },
  { value: 'basic', label: 'Basic auth' },
  { value: 'api_key', label: 'API key' },
]

const AUTH_BADGE: Record<string, string> = {
  none: 'bg-slate-500/20 text-slate-400',
  bearer: 'bg-blue-500/20 text-blue-400',
  basic: 'bg-amber-500/20 text-amber-400',
  api_key: 'bg-emerald-500/20 text-emerald-400',
}

const AUTH_LABEL: Record<string, string> = {
  none: 'No auth',
  bearer: 'Bearer token',
  basic: 'Basic auth',
  api_key: 'API key',
}

type FormData = {
  name: string
  description: string
  endpoint: string
  authType: string
  token: string
  username: string
  password: string
  apiKeyHeader: string
  apiKeyValue: string
}

const EMPTY_FORM: FormData = {
  name: '', description: '', endpoint: '', authType: 'none',
  token: '', username: '', password: '', apiKeyHeader: 'X-API-Key', apiKeyValue: '',
}

function serverToForm(s: McpServer): FormData {
  const cfg = s.authConfig ?? {}
  return {
    name: s.name, description: s.description ?? '', endpoint: s.endpoint,
    authType: s.authType, token: cfg.token ?? '', username: cfg.username ?? '',
    password: cfg.password ?? '', apiKeyHeader: cfg.header ?? 'X-API-Key', apiKeyValue: cfg.value ?? '',
  }
}

function formToPayload(f: FormData) {
  let authConfig: Record<string, string> | undefined
  if (f.authType === 'bearer') authConfig = { token: f.token }
  else if (f.authType === 'basic') authConfig = { username: f.username, password: f.password }
  else if (f.authType === 'api_key') authConfig = { header: f.apiKeyHeader, value: f.apiKeyValue }
  return { name: f.name, description: f.description || undefined, endpoint: f.endpoint, authType: f.authType, authConfig }
}

function ServerForm({
  initial,
  onSave,
  onCancel,
  isPending,
}: {
  initial: FormData
  onSave: (f: FormData) => void
  onCancel: () => void
  isPending: boolean
}) {
  const [form, setForm] = useState<FormData>(initial)
  const set = (k: keyof FormData, v: string) => setForm((p) => ({ ...p, [k]: v }))

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label className="text-xs">Name *</Label>
          <Input className="h-8 text-sm" value={form.name} onChange={(e) => set('name', e.target.value)} placeholder="My MCP Server" />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs">Auth type</Label>
          <select
            className="flex h-8 w-full rounded-md border border-input bg-background px-2 py-1 text-sm"
            value={form.authType}
            onChange={(e) => set('authType', e.target.value)}
          >
            {AUTH_TYPES.map((a) => <option key={a.value} value={a.value}>{a.label}</option>)}
          </select>
        </div>
      </div>

      <div className="space-y-1.5">
        <Label className="text-xs">Endpoint URL *</Label>
        <Input className="h-8 text-sm font-mono" value={form.endpoint} onChange={(e) => set('endpoint', e.target.value)} placeholder="https://your-mcp-server.com/mcp" />
      </div>

      <div className="space-y-1.5">
        <Label className="text-xs">Description</Label>
        <Textarea className="text-sm min-h-[60px] resize-none" value={form.description} onChange={(e) => set('description', e.target.value)} placeholder="What does this server do?" />
      </div>

      {form.authType === 'bearer' && (
        <div className="space-y-1.5">
          <Label className="text-xs">Token</Label>
          <Input type="password" className="h-8 text-sm font-mono" value={form.token} onChange={(e) => set('token', e.target.value)} placeholder="Bearer token" />
        </div>
      )}
      {form.authType === 'basic' && (
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label className="text-xs">Username</Label>
            <Input className="h-8 text-sm" value={form.username} onChange={(e) => set('username', e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Password</Label>
            <Input type="password" className="h-8 text-sm" value={form.password} onChange={(e) => set('password', e.target.value)} />
          </div>
        </div>
      )}
      {form.authType === 'api_key' && (
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label className="text-xs">Header name</Label>
            <Input className="h-8 text-sm font-mono" value={form.apiKeyHeader} onChange={(e) => set('apiKeyHeader', e.target.value)} placeholder="X-API-Key" />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Value</Label>
            <Input type="password" className="h-8 text-sm font-mono" value={form.apiKeyValue} onChange={(e) => set('apiKeyValue', e.target.value)} />
          </div>
        </div>
      )}

      <div className="flex gap-2 justify-end pt-1">
        <Button variant="outline" size="sm" onClick={onCancel}>Cancel</Button>
        <Button size="sm" onClick={() => onSave(form)} disabled={!form.name.trim() || !form.endpoint.trim() || isPending}>
          {isPending && <Loader2 size={13} className="mr-1.5 animate-spin" />}
          Save server
        </Button>
      </div>
    </div>
  )
}

export default function McpPage() {
  const { data: servers, isLoading } = useMcpServers()
  const createServer = useCreateMcpServer()
  const deleteServer = useDeleteMcpServer()

  const [showCreate, setShowCreate] = useState(false)
  const [editing, setEditing] = useState<McpServer | null>(null)

  const handleCreate = (form: FormData) => {
    createServer.mutate(formToPayload(form) as any, {
      onSuccess: () => setShowCreate(false),
    })
  }

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="h-14 shrink-0 border-b border-border bg-card flex items-center px-6 gap-3">
          <Server size={16} className="text-muted-foreground" />
          <h1 className="font-semibold text-sm">MCP Servers</h1>
          <div className="ml-auto">
            <Button size="sm" onClick={() => { setShowCreate(true); setEditing(null) }}>
              <Plus size={13} className="mr-1.5" />
              New server
            </Button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {/* Create form */}
          {showCreate && (
            <div className="mb-6 rounded-lg border border-border bg-card p-5">
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm font-semibold">New MCP server</p>
                <button onClick={() => setShowCreate(false)} className="text-muted-foreground hover:text-foreground">
                  <X size={15} />
                </button>
              </div>
              <ServerForm
                initial={EMPTY_FORM}
                onSave={handleCreate}
                onCancel={() => setShowCreate(false)}
                isPending={createServer.isPending}
              />
            </div>
          )}

          {isLoading ? (
            <div className="flex items-center justify-center py-20 text-muted-foreground">
              <Loader2 size={20} className="animate-spin mr-2" />
              Loading…
            </div>
          ) : !servers?.length && !showCreate ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-4">
                <Plug size={20} className="text-muted-foreground" />
              </div>
              <p className="text-sm font-medium mb-1">No MCP servers</p>
              <p className="text-xs text-muted-foreground mb-4">Add an MCP server to use it in your workflows.</p>
              <Button size="sm" onClick={() => setShowCreate(true)}>
                <Plus size={13} className="mr-1.5" />
                New server
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {servers?.map((server) => (
                <div key={server.id}>
                  {editing?.id === server.id ? (
                    <div className="rounded-lg border border-border bg-card p-4">
                      <div className="flex items-center justify-between mb-3">
                        <p className="text-sm font-semibold">Edit server</p>
                        <button onClick={() => setEditing(null)} className="text-muted-foreground hover:text-foreground">
                          <X size={15} />
                        </button>
                      </div>
                      <EditServerForm server={server} onDone={() => setEditing(null)} />
                    </div>
                  ) : (
                    <div className="rounded-lg border border-border bg-card p-4 hover:border-border/80 transition-colors">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-md bg-emerald-500/20 flex items-center justify-center shrink-0">
                            <Server size={14} className="text-emerald-400" />
                          </div>
                          <div>
                            <p className="text-sm font-semibold">{server.name}</p>
                            {server.description && (
                              <p className="text-xs text-muted-foreground truncate max-w-[180px]">{server.description}</p>
                            )}
                          </div>
                        </div>
                        <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${AUTH_BADGE[server.authType] ?? AUTH_BADGE.none}`}>
                          {AUTH_LABEL[server.authType] ?? server.authType}
                        </span>
                      </div>

                      <p className="text-[10px] text-muted-foreground font-mono truncate mb-3">{server.endpoint}</p>

                      {server.isPredefined && (
                        <span className="text-[10px] bg-violet-500/20 text-violet-400 px-1.5 py-0.5 rounded mr-2">predefined</span>
                      )}

                      <div className="flex gap-2 mt-3 pt-3 border-t border-border">
                        <Button variant="outline" size="sm" className="flex-1 h-7 text-xs" onClick={() => setEditing(server)}>
                          <Pencil size={11} className="mr-1" />
                          Edit
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-7 px-2 text-destructive hover:text-destructive border-destructive/30 hover:border-destructive/60"
                          onClick={() => deleteServer.mutate(server.id)}
                        >
                          <Trash2 size={11} />
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function EditServerForm({ server, onDone }: { server: McpServer; onDone: () => void }) {
  const updateServer = useUpdateMcpServer(server.id)

  const handleSave = (form: FormData) => {
    updateServer.mutate(formToPayload(form) as any, { onSuccess: onDone })
  }

  return (
    <ServerForm
      initial={serverToForm(server)}
      onSave={handleSave}
      onCancel={onDone}
      isPending={updateServer.isPending}
    />
  )
}
