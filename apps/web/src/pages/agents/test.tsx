import { useState, useRef, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, Send } from 'lucide-react'
import { AppLayout } from '@/components/layout/app-layout'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { useAgent, useRunAgent } from '@/hooks/use-agents'
import { cn } from '@/lib/utils'

interface Message {
  role: 'user' | 'assistant'
  content: string
}

export default function TestAgentPage() {
  const { id } = useParams<{ id: string }>()
  const { data: agent, isLoading } = useAgent(id!)
  const runAgent = useRunAgent(id!)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, runAgent.isPending])

  const send = () => {
    const text = input.trim()
    if (!text || runAgent.isPending) return
    setInput('')
    setMessages((prev) => [...prev, { role: 'user', content: text }])
    runAgent.mutate(text, {
      onSuccess: (response) => setMessages((prev) => [...prev, { role: 'assistant', content: response }]),
      onError: (err: any) => setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: `Error: ${err.response?.data?.message ?? 'Something went wrong'}` },
      ]),
    })
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      send()
    }
  }

  if (isLoading) return <AppLayout><div className="p-8 text-muted-foreground">Loading…</div></AppLayout>
  if (!agent) return <AppLayout><div className="p-8 text-destructive">Agent not found.</div></AppLayout>

  return (
    <AppLayout>
      <div className="flex flex-col h-screen">
        {/* Header */}
        <div className="flex items-center gap-3 px-6 py-4 border-b border-border bg-card shrink-0">
          <Link to="/agents">
            <Button variant="ghost" size="sm">
              <ArrowLeft size={16} />
            </Button>
          </Link>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className="font-semibold">{agent.name}</span>
              <Badge variant="outline" className="text-xs capitalize">{agent.provider}</Badge>
              <Badge variant="secondary" className="text-xs font-mono">
                {agent.model.split('-').slice(1, 3).join('-')}
              </Badge>
            </div>
            {agent.description && (
              <p className="text-xs text-muted-foreground">{agent.description}</p>
            )}
          </div>
          <Link to={`/agents/${id}/edit`}>
            <Button variant="outline" size="sm">Edit</Button>
          </Link>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
          {messages.length === 0 && (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <p className="text-muted-foreground text-sm">Send a message to test the agent</p>
                {agent.systemPrompt && (
                  <div className="mt-4 max-w-md text-left bg-muted/30 rounded-lg p-4">
                    <p className="text-xs text-muted-foreground font-medium mb-1">System prompt</p>
                    <p className="text-xs font-mono whitespace-pre-wrap">{agent.systemPrompt}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {messages.map((msg, i) => (
            <div key={i} className={cn('flex', msg.role === 'user' ? 'justify-end' : 'justify-start')}>
              <div
                className={cn(
                  'max-w-[80%] rounded-2xl px-4 py-2.5 text-sm whitespace-pre-wrap',
                  msg.role === 'user'
                    ? 'bg-primary text-primary-foreground rounded-br-sm'
                    : 'bg-card border border-border rounded-bl-sm',
                )}
              >
                {msg.content}
              </div>
            </div>
          ))}

          {runAgent.isPending && (
            <div className="flex justify-start">
              <div className="bg-card border border-border rounded-2xl rounded-bl-sm px-4 py-2.5">
                <div className="flex gap-1">
                  <span className="w-2 h-2 rounded-full bg-muted-foreground animate-bounce [animation-delay:0ms]" />
                  <span className="w-2 h-2 rounded-full bg-muted-foreground animate-bounce [animation-delay:150ms]" />
                  <span className="w-2 h-2 rounded-full bg-muted-foreground animate-bounce [animation-delay:300ms]" />
                </div>
              </div>
            </div>
          )}

          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div className="px-6 py-4 border-t border-border bg-card shrink-0">
          <div className="flex gap-3 items-end">
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type a message… (Enter to send, Shift+Enter for newline)"
              className="min-h-[44px] max-h-[200px] resize-none"
              rows={1}
            />
            <Button onClick={send} disabled={runAgent.isPending || !input.trim()} size="icon">
              <Send size={16} />
            </Button>
          </div>
        </div>
      </div>
    </AppLayout>
  )
}
