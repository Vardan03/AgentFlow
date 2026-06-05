import { useNavigate, useParams } from 'react-router-dom'
import { AppLayout } from '@/components/layout/app-layout'
import { useAgent, useUpdateAgent } from '@/hooks/use-agents'
import { AgentForm } from './agent-form'

export default function EditAgentPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { data: agent, isLoading } = useAgent(id!)
  const updateAgent = useUpdateAgent(id!)

  if (isLoading) return <AppLayout><div className="p-8 text-muted-foreground">Loading…</div></AppLayout>
  if (!agent) return <AppLayout><div className="p-8 text-destructive">Agent not found.</div></AppLayout>

  return (
    <AppLayout>
      <div className="p-8 max-w-2xl">
        <h1 className="text-2xl font-bold mb-6">Edit agent</h1>
        <AgentForm
          defaultValues={{ ...agent, description: agent.description ?? undefined, systemPrompt: agent.systemPrompt ?? undefined }}
          submitLabel="Save changes"
          isPending={updateAgent.isPending}
          error={(updateAgent.error as any)?.response?.data?.message ?? null}
          onSubmit={(data) =>
            updateAgent.mutate(data, { onSuccess: () => navigate('/agents') })
          }
        />
      </div>
    </AppLayout>
  )
}
