import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import type { AgentFormData } from '@/hooks/use-agents'

const PROVIDERS = [
  { value: 'anthropic', label: 'Anthropic' },
  { value: 'openai',    label: 'OpenAI' },
  { value: 'deepseek',  label: 'DeepSeek' },
  { value: 'google',    label: 'Google Gemini' },
  { value: 'grok',      label: 'Grok (xAI)' },
  { value: 'qwen',      label: 'Qwen (Alibaba)' },
]

const MODELS_BY_PROVIDER: Record<string, { value: string; label: string }[]> = {
  anthropic: [
    { value: 'claude-opus-4-8',           label: 'Claude Opus 4' },
    { value: 'claude-sonnet-4-6',         label: 'Claude Sonnet 4' },
    { value: 'claude-haiku-4-5-20251001', label: 'Claude Haiku 4' },
  ],
  openai: [
    { value: 'gpt-4o',        label: 'GPT-4o' },
    { value: 'gpt-4o-mini',   label: 'GPT-4o mini' },
    { value: 'gpt-4-turbo',   label: 'GPT-4 Turbo' },
    { value: 'gpt-3.5-turbo', label: 'GPT-3.5 Turbo' },
  ],
  deepseek: [
    { value: 'deepseek-chat',     label: 'DeepSeek Chat' },
    { value: 'deepseek-reasoner', label: 'DeepSeek Reasoner' },
  ],
  google: [
    { value: 'gemini-2.0-flash', label: 'Gemini 2.0 Flash' },
    { value: 'gemini-1.5-pro',   label: 'Gemini 1.5 Pro' },
    { value: 'gemini-1.5-flash', label: 'Gemini 1.5 Flash' },
  ],
  grok: [
    { value: 'grok-3',          label: 'Grok 3' },
    { value: 'grok-3-fast',     label: 'Grok 3 Fast' },
    { value: 'grok-3-mini',     label: 'Grok 3 Mini' },
    { value: 'grok-3-mini-fast', label: 'Grok 3 Mini Fast' },
  ],
  qwen: [
    { value: 'qwen-max',   label: 'Qwen Max' },
    { value: 'qwen-plus',  label: 'Qwen Plus' },
    { value: 'qwen-turbo', label: 'Qwen Turbo' },
    { value: 'qwen-long',  label: 'Qwen Long' },
  ],
}

const DEFAULT_MODEL: Record<string, string> = {
  anthropic: 'claude-sonnet-4-6',
  openai:    'gpt-4o',
  deepseek:  'deepseek-chat',
  google:    'gemini-2.0-flash',
  grok:      'grok-3',
  qwen:      'qwen-max',
}

interface Props {
  defaultValues?: Partial<AgentFormData>
  onSubmit: (data: AgentFormData) => void
  isPending: boolean
  submitLabel: string
  error?: string | null
}

export function AgentForm({ defaultValues, onSubmit, isPending, submitLabel, error }: Props) {
  const [provider, setProvider] = useState(defaultValues?.provider ?? 'anthropic')
  const [model, setModel] = useState(defaultValues?.model ?? DEFAULT_MODEL[defaultValues?.provider ?? 'anthropic'])

  const handleProviderChange = (next: string) => {
    setProvider(next)
    setModel(DEFAULT_MODEL[next])
  }

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    onSubmit({
      name: fd.get('name') as string,
      description: (fd.get('description') as string) || undefined,
      systemPrompt: (fd.get('systemPrompt') as string) || undefined,
      provider,
      model,
      temperature: parseFloat(fd.get('temperature') as string),
      maxTokens: parseInt(fd.get('maxTokens') as string, 10),
    })
  }

  const models = MODELS_BY_PROVIDER[provider] ?? []

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
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="provider">Provider</Label>
              <select
                id="provider"
                value={provider}
                onChange={(e) => handleProviderChange(e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                {PROVIDERS.map((p) => (
                  <option key={p.value} value={p.value}>{p.label}</option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="model">Model</Label>
              <select
                id="model"
                value={model}
                onChange={(e) => setModel(e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                {models.map((m) => (
                  <option key={m.value} value={m.value}>{m.label}</option>
                ))}
              </select>
            </div>
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
