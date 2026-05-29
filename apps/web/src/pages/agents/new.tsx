import { useNavigate } from 'react-router-dom'
import { AppLayout } from '@/components/layout/app-layout'
import { useCreateAgent } from '@/hooks/use-agents'
import { AgentForm } from './agent-form'

export default function NewAgentPage() {
  const navigate = useNavigate()
  const createAgent = useCreateAgent()

  return (
    <AppLayout>
      <div className="p-8 max-w-2xl">
        <h1 className="text-2xl font-bold mb-6">New agent</h1>
        <AgentForm
          submitLabel="Create agent"
          isPending={createAgent.isPending}
          error={(createAgent.error as any)?.response?.data?.message ?? null}
          onSubmit={(data) => createAgent.mutate(data, { onSuccess: (agent) => navigate(`/agents/${agent.id}/edit`) })}
        />
      </div>
    </AppLayout>
  )
}
