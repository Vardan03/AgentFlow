import { useEffect, useState } from 'react'
import { AppLayout } from '@/components/layout/app-layout'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useSettings, useUpdateSettings } from '@/hooks/use-agents'

const API_KEY_FIELDS = [
  {
    key: 'anthropicApiKey' as const,
    label: 'Anthropic API key',
    placeholder: 'sk-ant-...',
    description: 'Used for Claude models (Opus, Sonnet, Haiku)',
    docsHint: 'console.anthropic.com',
  },
  {
    key: 'openaiApiKey' as const,
    label: 'OpenAI API key',
    placeholder: 'sk-...',
    description: 'Used for GPT-4o, GPT-4 Turbo, GPT-3.5 Turbo',
    docsHint: 'platform.openai.com',
  },
  {
    key: 'deepseekApiKey' as const,
    label: 'DeepSeek API key',
    placeholder: 'sk-...',
    description: 'Used for DeepSeek Chat and Reasoner models',
    docsHint: 'platform.deepseek.com',
  },
  {
    key: 'googleApiKey' as const,
    label: 'Google API key',
    placeholder: 'AIza...',
    description: 'Used for Gemini 2.0 Flash, 1.5 Pro, and 1.5 Flash',
    docsHint: 'aistudio.google.com',
  },
  {
    key: 'grokApiKey' as const,
    label: 'Grok API key (xAI)',
    placeholder: 'xai-...',
    description: 'Used for Grok 3, Grok 3 Fast, Grok 3 Mini',
    docsHint: 'console.x.ai',
  },
  {
    key: 'qwenApiKey' as const,
    label: 'Qwen API key (Alibaba)',
    placeholder: 'sk-...',
    description: 'Used for Qwen Max, Plus, Turbo, Long',
    docsHint: 'dashscope.aliyuncs.com',
  },
]

type ApiKeys = {
  anthropicApiKey: string
  openaiApiKey: string
  deepseekApiKey: string
  googleApiKey: string
  grokApiKey: string
  qwenApiKey: string
}

export default function SettingsPage() {
  const { data: settings, isLoading } = useSettings()
  const updateSettings = useUpdateSettings()
  const [name, setName] = useState('')
  const [keys, setKeys] = useState<ApiKeys>({
    anthropicApiKey: '',
    openaiApiKey: '',
    deepseekApiKey: '',
    googleApiKey: '',
    grokApiKey: '',
    qwenApiKey: '',
  })

  useEffect(() => {
    if (settings) {
      setName(settings.name ?? '')
      setKeys({
        anthropicApiKey: settings.anthropicApiKey ?? '',
        openaiApiKey: settings.openaiApiKey ?? '',
        deepseekApiKey: settings.deepseekApiKey ?? '',
        googleApiKey: settings.googleApiKey ?? '',
        grokApiKey: settings.grokApiKey ?? '',
        qwenApiKey: settings.qwenApiKey ?? '',
      })
    }
  }, [settings])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    updateSettings.mutate({ name, ...keys })
  }

  if (isLoading) return <AppLayout><div className="p-8 text-muted-foreground">Loading…</div></AppLayout>

  return (
    <AppLayout>
      <div className="p-8 max-w-2xl">
        <h1 className="text-2xl font-bold mb-6">Settings</h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Profile</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Email</Label>
                <Input value={settings?.email ?? ''} disabled />
              </div>
              <div className="space-y-2">
                <Label htmlFor="name">Display name</Label>
                <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>AI Provider API Keys</CardTitle>
              <CardDescription>
                Keys are stored securely and never shared. Only add keys for providers you plan to use.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {API_KEY_FIELDS.map((field) => (
                <div key={field.key} className="space-y-2">
                  <Label htmlFor={field.key}>{field.label}</Label>
                  <Input
                    id={field.key}
                    type="password"
                    value={keys[field.key]}
                    onChange={(e) => setKeys((prev) => ({ ...prev, [field.key]: e.target.value }))}
                    placeholder={field.placeholder}
                  />
                  <p className="text-xs text-muted-foreground">
                    {field.description} — get your key at{' '}
                    <span className="font-mono">{field.docsHint}</span>
                  </p>
                </div>
              ))}
            </CardContent>
          </Card>

          {updateSettings.isSuccess && (
            <p className="text-sm text-green-500">Settings saved.</p>
          )}
          {updateSettings.error && (
            <p className="text-sm text-destructive">Failed to save settings.</p>
          )}

          <Button type="submit" disabled={updateSettings.isPending}>
            {updateSettings.isPending ? 'Saving…' : 'Save settings'}
          </Button>
        </form>
      </div>
    </AppLayout>
  )
}
