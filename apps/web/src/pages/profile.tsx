import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useLogout, useProfile, useUpdateProfile } from '@/hooks/use-auth'

export default function ProfilePage() {
  const { data: profile, isLoading } = useProfile()
  const updateProfile = useUpdateProfile()
  const logout = useLogout()
  const [name, setName] = useState('')

  useEffect(() => {
    if (profile?.name) setName(profile.name)
  }, [profile])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    updateProfile.mutate({ name })
  }

  if (isLoading) return <div className="p-8 text-muted-foreground">Loading…</div>

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-lg mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Profile</h1>
          <Button variant="outline" onClick={logout}>
            Sign out
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Account details</CardTitle>
            <CardDescription>{profile?.email}</CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              {updateProfile.isSuccess && (
                <p className="text-sm text-green-600">Profile updated.</p>
              )}
              {updateProfile.error && (
                <p className="text-sm text-destructive">Update failed.</p>
              )}
              <div className="space-y-2">
                <Label htmlFor="name">Display name</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your name"
                />
              </div>
              <Button type="submit" disabled={updateProfile.isPending}>
                {updateProfile.isPending ? 'Saving…' : 'Save changes'}
              </Button>
            </CardContent>
          </form>
        </Card>
      </div>
    </div>
  )
}
