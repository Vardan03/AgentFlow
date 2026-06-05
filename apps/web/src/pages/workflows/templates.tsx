import { useNavigate } from 'react-router-dom'
import { AppLayout } from '@/components/layout/app-layout'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useImportWorkflow } from '@/hooks/use-workflows'

interface Template {
  name: string
  description: string
  category: string
  graph: { nodes: any[]; edges: any[] }
}

const node = (id: string, type: string, x: number, y: number, data: Record<string, any>) => ({
  id, type, position: { x, y }, data,
})
const edge = (id: string, source: string, target: string, sourceHandle?: string) => ({
  id, source, target,
  ...(sourceHandle && { sourceHandle }),
  style: { stroke: '#475569', strokeWidth: 2 },
  markerEnd: { type: 'arrowclosed', color: '#475569' },
})

const TEMPLATES: Template[] = [
  {
    name: 'Summarize Article',
    description: 'Fetch a URL, extract text, and produce a concise AI summary.',
    category: 'Content',
    graph: {
      nodes: [
        node('t1', 'trigger.manual',  280, 40,  { label: 'Manual Trigger' }),
        node('t2', 'util.http_request', 280, 180, { label: 'Fetch URL', method: 'GET', url: '{{input}}', headers: '', body: '' }),
        node('t3', 'ai.run_agent',    280, 320, { label: 'Summarize', agentId: '', agentName: '', input: 'Summarize the following article in 3 bullet points:\n\n{{input}}' }),
        node('t4', 'util.response',   280, 460, { label: 'Response' }),
      ],
      edges: [
        edge('e1', 't1', 't2'),
        edge('e2', 't2', 't3'),
        edge('e3', 't3', 't4'),
      ],
    },
  },
  {
    name: 'Content Moderator',
    description: 'Review incoming content with an AI agent and route approved/rejected posts.',
    category: 'Moderation',
    graph: {
      nodes: [
        node('t1', 'trigger.webhook',    280, 40,  { label: 'Webhook Trigger' }),
        node('t2', 'ai.agent_review',    280, 180, { label: 'Review Content', agentId: '', agentName: '', criteria: 'The content must be safe for all audiences, non-spammy, and respectful.' }),
        node('t3', 'util.log',           160, 340, { label: 'Log Approved', message: 'Approved: {{input}}' }),
        node('t4', 'util.log',           400, 340, { label: 'Log Rejected', message: 'Rejected: {{input}}' }),
        node('t5', 'util.response',      160, 480, { label: 'Response' }),
        node('t6', 'util.response',      400, 480, { label: 'Response' }),
      ],
      edges: [
        edge('e1', 't1', 't2'),
        edge('e2', 't2', 't3', 'yes'),
        edge('e3', 't2', 't4', 'no'),
        edge('e4', 't3', 't5'),
        edge('e5', 't4', 't6'),
      ],
    },
  },
  {
    name: 'Data Extractor',
    description: 'Call an API, parse a JSON field, and transform it into a readable string.',
    category: 'Data',
    graph: {
      nodes: [
        node('t1', 'trigger.manual',    280, 40,  { label: 'Manual Trigger' }),
        node('t2', 'util.http_request', 280, 180, { label: 'Fetch API', method: 'GET', url: '{{input}}', headers: '', body: '' }),
        node('t3', 'util.json_parser',  280, 320, { label: 'Extract Field', path: 'data' }),
        node('t4', 'util.transform_data', 280, 460, { label: 'Format', template: 'Result: {{input}}' }),
        node('t5', 'util.response',     280, 600, { label: 'Response' }),
      ],
      edges: [
        edge('e1', 't1', 't2'),
        edge('e2', 't2', 't3'),
        edge('e3', 't3', 't4'),
        edge('e4', 't4', 't5'),
      ],
    },
  },
  {
    name: 'Slack Notifier',
    description: 'Run an AI agent on your input and send the result to a Slack channel.',
    category: 'Notifications',
    graph: {
      nodes: [
        node('t1', 'trigger.manual',    280, 40,  { label: 'Manual Trigger' }),
        node('t2', 'ai.run_agent',      280, 180, { label: 'Generate Message', agentId: '', agentName: '', input: '' }),
        node('t3', 'util.notification', 280, 320, { label: 'Send to Slack', webhookUrl: '', body: '{"text":"{{input}}"}' }),
        node('t4', 'util.response',     280, 460, { label: 'Response' }),
      ],
      edges: [
        edge('e1', 't1', 't2'),
        edge('e2', 't2', 't3'),
        edge('e3', 't3', 't4'),
      ],
    },
  },
  {
    name: 'Scheduled Report',
    description: 'Fetch data on a schedule, summarize it, and send it to a webhook.',
    category: 'Automation',
    graph: {
      nodes: [
        node('t1', 'trigger.schedule',  280, 40,  { label: 'Schedule Trigger', cronExpression: '0 9 * * 1' }),
        node('t2', 'util.http_request', 280, 180, { label: 'Fetch Data', method: 'GET', url: '', headers: '', body: '' }),
        node('t3', 'ai.run_agent',      280, 320, { label: 'Summarize', agentId: '', agentName: '', input: 'Create a weekly summary report from this data:\n\n{{input}}' }),
        node('t4', 'util.notification', 280, 460, { label: 'Send Report', webhookUrl: '', body: '{"text":"{{input}}"}' }),
        node('t5', 'util.response',     280, 600, { label: 'Response' }),
      ],
      edges: [
        edge('e1', 't1', 't2'),
        edge('e2', 't2', 't3'),
        edge('e3', 't3', 't4'),
        edge('e4', 't4', 't5'),
      ],
    },
  },
  {
    name: 'API to Variable',
    description: 'Fetch data, parse a value, store it in a variable, then use it later.',
    category: 'Data',
    graph: {
      nodes: [
        node('t1', 'trigger.manual',    280, 40,  { label: 'Manual Trigger' }),
        node('t2', 'util.http_request', 280, 180, { label: 'Fetch', method: 'GET', url: '{{input}}', headers: '', body: '' }),
        node('t3', 'util.json_parser',  280, 320, { label: 'Parse', path: 'result' }),
        node('t4', 'util.set_variable', 280, 460, { label: 'Store Result', variableName: 'result', value: '' }),
        node('t5', 'util.transform_data', 280, 600, { label: 'Format', template: 'The result was: {{var.result}}' }),
        node('t6', 'util.response',     280, 740, { label: 'Response' }),
      ],
      edges: [
        edge('e1', 't1', 't2'),
        edge('e2', 't2', 't3'),
        edge('e3', 't3', 't4'),
        edge('e4', 't4', 't5'),
        edge('e5', 't5', 't6'),
      ],
    },
  },
]

const CATEGORY_COLORS: Record<string, string> = {
  Content: 'bg-blue-500/10 text-blue-400 border-blue-600/30',
  Moderation: 'bg-red-500/10 text-red-400 border-red-600/30',
  Data: 'bg-emerald-500/10 text-emerald-400 border-emerald-600/30',
  Notifications: 'bg-yellow-500/10 text-yellow-400 border-yellow-600/30',
  Automation: 'bg-violet-500/10 text-violet-400 border-violet-600/30',
}

export default function WorkflowTemplatesPage() {
  const navigate = useNavigate()
  const importWorkflow = useImportWorkflow()

  const useTemplate = (template: Template) => {
    importWorkflow.mutate(
      { name: template.name, graph: template.graph },
      { onSuccess: (wf) => navigate(`/workflows/${wf.id}`) },
    )
  }

  return (
    <AppLayout>
      <div className="p-8 max-w-5xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold">Workflow Templates</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Start from a pre-built workflow. Click "Use template" to open it in the editor.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {TEMPLATES.map((template) => (
            <Card key={template.name} className="flex flex-col hover:border-primary/50 transition-colors">
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between gap-2">
                  <CardTitle className="text-base">{template.name}</CardTitle>
                  <Badge
                    variant="outline"
                    className={`text-[10px] shrink-0 ${CATEGORY_COLORS[template.category] ?? ''}`}
                  >
                    {template.category}
                  </Badge>
                </div>
                <CardDescription className="text-xs">{template.description}</CardDescription>
              </CardHeader>
              <CardContent className="mt-auto pt-2">
                <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3">
                  <span>{template.graph.nodes.length} nodes</span>
                  <span>·</span>
                  <span>{template.graph.edges.length} connections</span>
                </div>
                <Button
                  size="sm"
                  className="w-full"
                  disabled={importWorkflow.isPending}
                  onClick={() => useTemplate(template)}
                >
                  Use template
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </AppLayout>
  )
}
