import { Copy, GitFork, History, Pencil, Plus, Power, Trash2 } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { AppLayout } from '@/components/layout/app-layout'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useCreateWorkflow, useDeleteWorkflow, useDuplicateWorkflow, useToggleWorkflow, useWorkflows } from '@/hooks/use-workflows'

export default function WorkflowsPage() {
  const { data: workflows, isLoading } = useWorkflows()
  const createWorkflow = useCreateWorkflow()
  const deleteWorkflow = useDeleteWorkflow()
  const duplicateWorkflow = useDuplicateWorkflow()
  const toggleWorkflow = useToggleWorkflow()
  const navigate = useNavigate()

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
          <Button onClick={handleCreate} disabled={createWorkflow.isPending}>
            <Plus size={16} className="mr-2" />
            {createWorkflow.isPending ? 'Creating…' : 'New workflow'}
          </Button>
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
