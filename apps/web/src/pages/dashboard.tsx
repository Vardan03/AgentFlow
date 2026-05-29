import { Bot } from 'lucide-react'
import { Link } from 'react-router-dom'
import { AppLayout } from '@/components/layout/app-layout'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useAgents } from '@/hooks/use-agents'
import { useAuthStore } from '@/store/auth.store'

export default function DashboardPage() {
  const user = useAuthStore((s) => s.user)
  const { data: agents } = useAgents()

  return (
    <AppLayout>
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-1">
          Welcome back{user?.name ? `, ${user.name}` : ''}
        </h1>
        <p className="text-muted-foreground text-sm mb-8">Here's what's happening in your workspace.</p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total agents</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{agents?.length ?? 0}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Workflows</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">0</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Executions</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">0</p>
            </CardContent>
          </Card>
        </div>

        {agents?.length === 0 && (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
              <Bot size={40} className="text-muted-foreground mb-3" />
              <h2 className="font-semibold mb-1">Create your first agent</h2>
              <p className="text-sm text-muted-foreground mb-4">
                Agents are AI assistants you can configure and use in workflows.
              </p>
              <Link to="/agents/new">
                <Button>Create agent</Button>
              </Link>
            </CardContent>
          </Card>
        )}
      </div>
    </AppLayout>
  )
}
