import { useState } from 'react'
import { Sparkles, X, Loader2, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface GenerateDialogProps {
  onGenerate: (description: string) => void
  onClose: () => void
  isLoading: boolean
  error?: string | null
}

export function GenerateDialog({ onGenerate, onClose, isLoading, error }: GenerateDialogProps) {
  const [description, setDescription] = useState('')

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (description.trim().length >= 5) {
      onGenerate(description.trim())
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-lg mx-4 bg-card border border-border rounded-xl shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-500/15">
              <Sparkles size={16} className="text-violet-400" />
            </div>
            <div>
              <h2 className="text-sm font-semibold">Generate Workflow with AI</h2>
              <p className="text-xs text-muted-foreground">Describe your workflow in plain language</p>
            </div>
          </div>
          <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={onClose} disabled={isLoading}>
            <X size={14} />
          </Button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="e.g. When triggered, fetch data from an API, run it through an AI agent to summarize, then check if the summary is valid before returning it."
            className="w-full h-36 resize-none rounded-lg border border-border bg-background px-4 py-3 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-violet-500/40"
            disabled={isLoading}
            autoFocus
          />

          {error && (
            <div className="flex items-start gap-2 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2.5 text-xs text-red-400">
              <AlertCircle size={14} className="mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="flex items-center justify-between pt-1">
            <p className="text-xs text-muted-foreground">
              Uses your Anthropic API key · Claude will create nodes &amp; edges
            </p>
            <div className="flex gap-2">
              <Button type="button" variant="outline" size="sm" onClick={onClose} disabled={isLoading}>
                Cancel
              </Button>
              <Button
                type="submit"
                size="sm"
                disabled={description.trim().length < 5 || isLoading}
                className="bg-violet-600 hover:bg-violet-700 text-white min-w-[100px]"
              >
                {isLoading ? (
                  <>
                    <Loader2 size={13} className="mr-1.5 animate-spin" />
                    Generating…
                  </>
                ) : (
                  <>
                    <Sparkles size={13} className="mr-1.5" />
                    Generate
                  </>
                )}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
