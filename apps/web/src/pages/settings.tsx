import { useEffect, useState } from 'react'
import { AppLayout } from '@/components/layout/app-layout'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useSettings, useUpdateSettings } from '@/hooks/use-agents'

export default function SettingsPage() {
  const { data: settings, isLoading } = useSettings()
  const updateSettings = useUpdateSettings()
  const [apiKey, setApiKey] = useState('')
  const [name, setName] = useState('')

  useEffect(() => {
    if (settings) {
      setApiKey(settings.anthropicApiKey ?? '')
      setName(settings.name ?? '')
    }
  }, [settings])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    updateSettings.mutate({ anthropicApiKey: apiKey, name })
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
              <CardTitle>AI Provider</CardTitle>
              <CardDescription>
                Your Anthropic API key is used to run agents. It's stored securely and never shared.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="apiKey">Anthropic API key</Label>
                <Input
                  id="apiKey"
                  type="password"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="sk-ant-..."
                />
              </div>
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
