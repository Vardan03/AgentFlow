import { Copy, GitFork, History, LayoutTemplate, Pencil, Plus, Power, Trash2, Upload } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { useRef } from 'react'
import { AppLayout } from '@/components/layout/app-layout'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useCreateWorkflow, useDeleteWorkflow, useDuplicateWorkflow, useImportWorkflow, useToggleWorkflow, useWorkflows } from '@/hooks/use-workflows'

export default function WorkflowsPage() {
  const { data: workflows, isLoading } = useWorkflows()
  const createWorkflow = useCreateWorkflow()
  const deleteWorkflow = useDeleteWorkflow()
  const duplicateWorkflow = useDuplicateWorkflow()
  const toggleWorkflow = useToggleWorkflow()
  const importWorkflow = useImportWorkflow()
  const navigate = useNavigate()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      try {
        const parsed = JSON.parse(ev.target?.result as string)
        const name = parsed.name ? `${parsed.name} (imported)` : 'Imported workflow'
        const graph = parsed.graph ?? { nodes: [], edges: [] }
        importWorkflow.mutate({ name, graph }, {
          onSuccess: (wf) => navigate(`/workflows/${wf.id}`),
        })
      } catch {
        alert('Invalid workflow file.')
      }
    }
    reader.readAsText(file)
    e.target.value = ''
  }

  const handleCreate = () => {
    createWorkflow.mutate({ name: 'Untitled workflow' }, {
      onSuccess: (workflow) => navigate(`/workflows/${workflow.id}`),
    })
  }

  return (
    <AppLayout>
      <div className="p-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold">Workflows</h1>
            <p className="text-muted-foreground text-sm mt-1">Build and automate AI-powered workflows</p>
          </div>
          <div className="flex items-center gap-2">
            <input ref={fileInputRef} type="file" accept=".json" className="hidden" onChange={handleImport} />
            <Link to="/workflows/templates">
              <Button variant="outline">
                <LayoutTemplate size={15} className="mr-2" />
                Templates
              </Button>
            </Link>
            <Button variant="outline" onClick={() => fileInputRef.current?.click()} disabled={importWorkflow.isPending}>
              <Upload size={15} className="mr-2" />
              {importWorkflow.isPending ? 'Importing…' : 'Import'}
            </Button>
            <Button onClick={handleCreate} disabled={createWorkflow.isPending}>
              <Plus size={16} className="mr-2" />
              {createWorkflow.isPending ? 'Creating…' : 'New workflow'}
            </Button>
          </div>
        </div>

        {isLoading && <p className="text-muted-foreground">Loading…</p>}

        {!isLoading && workflows?.length === 0 && (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <GitFork size={48} className="text-muted-foreground mb-4" />
            <h2 className="text-lg font-semibold mb-1">No workflows yet</h2>
            <p className="text-muted-foreground text-sm mb-4">
              Create your first workflow to start automating with AI
            </p>
            <Button onClick={handleCreate} disabled={createWorkflow.isPending}>
              <Plus size={16} className="mr-2" />
              New workflow
            </Button>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {workflows?.map((workflow) => {
            const graph = workflow.graph as any
            const nodeCount = graph?.nodes?.length ?? 0

            return (
              <Card key={workflow.id} className="group hover:border-primary/50 transition-colors">
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between gap-2">
                    <CardTitle className="text-base">{workflow.name}</CardTitle>
                    <Badge variant={workflow.isEnabled ? 'default' : 'secondary'} className="text-xs shrink-0">
                      {workflow.isEnabled ? 'Active' : 'Draft'}
                    </Badge>
                  </div>
                  {workflow.description && (
                    <CardDescription className="text-xs line-clamp-2">{workflow.description}</CardDescription>
                  )}
                </CardHeader>
                <CardContent>
                  <p className="text-xs text-muted-foreground mb-4">
                    {nodeCount} {nodeCount === 1 ? 'node' : 'nodes'} ·{' '}
                    Updated {new Date(workflow.updatedAt).toLocaleDateString()}
                  </p>
                  <div className="flex items-center gap-1.5">
                    <Button
                      size="sm"
                      className="flex-1"
                      onClick={() => navigate(`/workflows/${workflow.id}`)}
                    >
                      <Pencil size={13} className="mr-1.5" />
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      title="Execution history"
                      onClick={() => navigate(`/workflows/${workflow.id}/history`)}
                    >
                      <History size={13} />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      title="Duplicate"
                      disabled={duplicateWorkflow.isPending}
                      onClick={() => duplicateWorkflow.mutate(workflow.id)}
                    >
                      <Copy size={13} />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      title={workflow.isEnabled ? 'Disable' : 'Enable'}
                      className={workflow.isEnabled ? 'text-emerald-400 border-emerald-600/50 hover:border-emerald-500' : 'text-muted-foreground'}
                      disabled={toggleWorkflow.isPending}
                      onClick={() => toggleWorkflow.mutate({ id: workflow.id, isEnabled: !workflow.isEnabled })}
                    >
                      <Power size={13} />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      title="Delete"
                      className="text-destructive hover:text-destructive"
                      disabled={deleteWorkflow.isPending}
                      onClick={() => {
                        if (confirm(`Delete "${workflow.name}"?`)) deleteWorkflow.mutate(workflow.id)
                      }}
                    >
                      <Trash2 size={13} />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>
    </AppLayout>
  )
}
