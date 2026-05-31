import { Bot, Plus, Trash2, Pencil, Play } from 'lucide-react'
import { Link } from 'react-router-dom'
import { AppLayout } from '@/components/layout/app-layout'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useAgents, useDeleteAgent } from '@/hooks/use-agents'

export default function AgentsPage() {
  const { data: agents, isLoading } = useAgents()
  const deleteAgent = useDeleteAgent()

  return (
    <AppLayout>
      <div className="p-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold">Agents</h1>
            <p className="text-muted-foreground text-sm mt-1">Create and manage your AI agents</p>
          </div>
          <Link to="/agents/new">
            <Button>
              <Plus size={16} className="mr-2" />
              New agent
            </Button>
          </Link>
        </div>

        {isLoading && <p className="text-muted-foreground">Loading…</p>}

        {!isLoading && agents?.length === 0 && (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <Bot size={48} className="text-muted-foreground mb-4" />
            <h2 className="text-lg font-semibold mb-1">No agents yet</h2>
            <p className="text-muted-foreground text-sm mb-4">Create your first agent to get started</p>
            <Link to="/agents/new">
              <Button>
                <Plus size={16} className="mr-2" />
                New agent
              </Button>
            </Link>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {agents?.map((agent) => (
            <Card key={agent.id} className="group hover:border-primary/50 transition-colors">
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between gap-2">
                  <CardTitle className="text-base">{agent.name}</CardTitle>
                  <div className="flex gap-1 shrink-0">
                    <Badge variant="outline" className="text-xs capitalize">{agent.provider}</Badge>
                    <Badge variant="secondary" className="text-xs font-mono">
                      {agent.model.split('-').slice(1, 3).join('-')}
                    </Badge>
                  </div>
                </div>
                {agent.description && (
                  <CardDescription className="text-xs line-clamp-2">{agent.description}</CardDescription>
                )}
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-1 text-xs text-muted-foreground mb-4">
                  <span>temp {agent.temperature}</span>
                  <span>·</span>
                  <span>{agent.maxTokens} tokens</span>
                </div>
                <div className="flex items-center gap-2">
                  <Link to={`/agents/${agent.id}/test`} className="flex-1">
                    <Button size="sm" className="w-full">
                      <Play size={13} className="mr-1.5" />
                      Test
                    </Button>
                  </Link>
                  <Link to={`/agents/${agent.id}/edit`}>
                    <Button size="sm" variant="outline">
                      <Pencil size={13} />
                    </Button>
                  </Link>
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-destructive hover:text-destructive"
                    disabled={deleteAgent.isPending}
                    onClick={() => {
                      if (confirm(`Delete "${agent.name}"?`)) deleteAgent.mutate(agent.id)
                    }}
                  >
                    <Trash2 size={13} />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </AppLayout>
  )
}
