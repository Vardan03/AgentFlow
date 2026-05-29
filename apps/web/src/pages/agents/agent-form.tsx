import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import type { AgentFormData } from '@/hooks/use-agents'

const MODELS = [
  { value: 'claude-opus-4-8', label: 'Claude Opus 4' },
  { value: 'claude-sonnet-4-6', label: 'Claude Sonnet 4' },
  { value: 'claude-haiku-4-5-20251001', label: 'Claude Haiku 4' },
]

interface Props {
  defaultValues?: Partial<AgentFormData>
  onSubmit: (data: AgentFormData) => void
  isPending: boolean
  submitLabel: string
  error?: string | null
}

export function AgentForm({ defaultValues, onSubmit, isPending, submitLabel, error }: Props) {
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    onSubmit({
      name: fd.get('name') as string,
      description: (fd.get('description') as string) || undefined,
      systemPrompt: (fd.get('systemPrompt') as string) || undefined,
      model: fd.get('model') as string,
      temperature: parseFloat(fd.get('temperature') as string),
      maxTokens: parseInt(fd.get('maxTokens') as string, 10),
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && <p className="text-sm text-destructive">{error}</p>}

      <Card>
        <CardHeader><CardTitle className="text-base">Basic info</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name *</Label>
            <Input id="name" name="name" defaultValue={defaultValues?.name} required placeholder="e.g. Research Assistant" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Input id="description" name="description" defaultValue={defaultValues?.description ?? ''} placeholder="What does this agent do?" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">Model</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="model">Model</Label>
            <select
              id="model"
              name="model"
              defaultValue={defaultValues?.model ?? 'claude-sonnet-4-6'}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              {MODELS.map((m) => (
                <option key={m.value} value={m.value}>{m.label}</option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="temperature">Temperature <span className="text-muted-foreground text-xs">(0 – 2)</span></Label>
              <Input
                id="temperature"
                name="temperature"
                type="number"
                step="0.1"
                min="0"
                max="2"
                defaultValue={defaultValues?.temperature ?? 0.7}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="maxTokens">Max tokens</Label>
              <Input
                id="maxTokens"
                name="maxTokens"
                type="number"
                step="256"
                min="256"
                max="8192"
                defaultValue={defaultValues?.maxTokens ?? 1024}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">System prompt</CardTitle></CardHeader>
        <CardContent>
          <Textarea
            id="systemPrompt"
            name="systemPrompt"
            defaultValue={defaultValues?.systemPrompt ?? ''}
            placeholder="You are a helpful assistant..."
            className="min-h-[180px] font-mono text-sm"
          />
        </CardContent>
      </Card>

      <div className="flex gap-3">
        <Button type="submit" disabled={isPending}>
          {isPending ? 'Saving…' : submitLabel}
        </Button>
        <Button type="button" variant="outline" onClick={() => history.back()}>
          Cancel
        </Button>
      </div>
    </form>
  )
}
