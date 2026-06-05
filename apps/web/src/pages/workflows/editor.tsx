import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import {
  ReactFlow,
  ReactFlowProvider,
  useNodesState,
  useEdgesState,
  useReactFlow,
  addEdge,
  Background,
  Controls,
  BackgroundVariant,
  MarkerType,
  type Connection,
  type Node,
  type Edge,
} from '@xyflow/react'
import { ArrowLeft, Circle, Download, History, Play, Power, Save, Sparkles } from 'lucide-react'
import { Sidebar } from '@/components/layout/sidebar'
import { Button } from '@/components/ui/button'
import { useWorkflow, useUpdateWorkflow, useGenerateWorkflow, useGenerateWebhookToken, useToggleWorkflow } from '@/hooks/use-workflows'
import { useExecuteWorkflow, type Execution } from '@/hooks/use-executions'
import { ExecutionPanel } from './execution-panel'
import { TriggerNode } from './nodes/trigger-node'
import { AgentNode } from './nodes/agent-node'
import { ConditionNode } from './nodes/condition-node'
import { OutputNode } from './nodes/output-node'
import { HttpNode } from './nodes/http-node'
import { LogNode } from './nodes/log-node'
import { SetVariableNode } from './nodes/set-variable-node'
import { JsonParserNode } from './nodes/json-parser-node'
import { TransformNode } from './nodes/transform-node'
import { DelayNode } from './nodes/delay-node'
import { AgentDecisionNode } from './nodes/agent-decision-node'
import { McpToolNode } from './nodes/mcp-tool-node'
import { McpResourceNode } from './nodes/mcp-resource-node'
import { AgentReviewNode } from './nodes/agent-review-node'
import { SwitchNode } from './nodes/switch-node'
import { WebhookTriggerNode } from './nodes/webhook-trigger-node'
import { ScheduleTriggerNode } from './nodes/schedule-trigger-node'
import { NotificationNode } from './nodes/notification-node'
import { MergeNode } from './nodes/merge-node'
import { NodePalette } from './node-palette'
import { NodeConfig } from './node-config'
import { GenerateDialog } from './generate-dialog'

const nodeTypes = {
  'trigger.manual': TriggerNode,
  'trigger.webhook': WebhookTriggerNode,
  'trigger.schedule': ScheduleTriggerNode,
  'util.notification': NotificationNode,
  'ai.run_agent': AgentNode,
  'util.http_request': HttpNode,
  'control.condition': ConditionNode,
  'control.delay': DelayNode,
  'ai.agent_decision': AgentDecisionNode,
  'util.set_variable': SetVariableNode,
  'util.transform_data': TransformNode,
  'util.json_parser': JsonParserNode,
  'util.log': LogNode,
  'mcp.execute_tool': McpToolNode,
  'mcp.fetch_resource': McpResourceNode,
  'ai.agent_review': AgentReviewNode,
  'control.switch': SwitchNode,
  'control.merge': MergeNode,
  'util.response': OutputNode,
}

const defaultEdgeOptions = {
  style: { stroke: '#475569', strokeWidth: 2 },
  markerEnd: { type: MarkerType.ArrowClosed, color: '#475569' },
}

function getDefaultNodeData(type: string): Record<string, any> {
  switch (type) {
    case 'trigger.manual':  return { label: 'Manual Trigger' }
    case 'trigger.webhook':   return { label: 'Webhook Trigger' }
    case 'trigger.schedule':  return { label: 'Schedule Trigger', cronExpression: '' }
    case 'util.notification': return { label: 'Notification', webhookUrl: '', body: '{"text":"{{input}}"}' }
    case 'ai.run_agent':   return { label: 'Run Agent', agentId: '', agentName: '', input: '' }
    case 'util.http_request':   return { label: 'HTTP Request', method: 'GET', url: '', headers: '', body: '' }
    case 'control.condition':   return { label: 'Condition', condition: '' }
    case 'control.delay':       return { label: 'Delay', delaySeconds: 2 }
    case 'ai.agent_decision':   return { label: 'Agent Decision', agentId: '', agentName: '', question: '' }
    case 'util.set_variable':   return { label: 'Set Variable', variableName: '', value: '' }
    case 'util.transform_data': return { label: 'Transform', template: '' }
    case 'util.json_parser':    return { label: 'JSON Parser', path: '' }
    case 'util.log':            return { label: 'Log', message: '' }
    case 'mcp.execute_tool':    return { label: 'MCP Tool', serverId: '', serverName: '', toolName: '', arguments: '{}' }
    case 'mcp.fetch_resource':  return { label: 'MCP Resource', serverId: '', serverName: '', resourceUri: '' }
    case 'ai.agent_review':     return { label: 'Agent Review', agentId: '', agentName: '', criteria: '' }
    case 'control.switch':      return { label: 'Switch', cases: [] }
    case 'control.merge':       return { label: 'Merge', mode: 'any', separator: '\n---\n' }
    case 'util.response':       return { label: 'Response' }
    default:                    return { label: type }
  }
}

const DEFAULT_NODES: Node[] = [
  {
    id: 'trigger-1',
    type: 'trigger.manual',
    position: { x: 280, y: 60 },
    data: { label: 'Manual Trigger' },
  },
]

function layoutNodes(nodes: any[], edges: any[]): Node[] {
  const NODE_W = 280
  const NODE_H = 150

  // Build adjacency map
  const children = new Map<string, string[]>()
  nodes.forEach((n) => children.set(n.id, []))
  edges.forEach((e) => {
    children.get(e.source)?.push(e.target)
  })

  // BFS to assign layers
  const layers = new Map<string, number>()
  const roots = nodes
    .filter((n) => !edges.some((e) => e.target === n.id))
    .map((n) => n.id)

  const queue: string[] = [...roots]
  roots.forEach((id) => layers.set(id, 0))
  while (queue.length) {
    const id = queue.shift()!
    const layer = layers.get(id)!
    for (const child of children.get(id) ?? []) {
      if (!layers.has(child) || layers.get(child)! < layer + 1) {
        layers.set(child, layer + 1)
        queue.push(child)
      }
    }
  }

  // Group by layer
  const byLayer = new Map<number, string[]>()
  layers.forEach((layer, id) => {
    if (!byLayer.has(layer)) byLayer.set(layer, [])
    byLayer.get(layer)!.push(id)
  })

  // Assign positions
  const positions = new Map<string, { x: number; y: number }>()
  byLayer.forEach((ids, layer) => {
    ids.forEach((id, idx) => {
      const totalH = ids.length * NODE_H
      const startY = (600 - totalH) / 2 + idx * NODE_H
      positions.set(id, { x: 80 + layer * NODE_W, y: startY })
    })
  })

  return nodes.map((n) => ({
    ...n,
    position: positions.get(n.id) ?? { x: 80, y: 80 },
  })) as Node[]
}

export default function WorkflowEditorPage() {
  return (
    <ReactFlowProvider>
      <WorkflowEditorInner />
    </ReactFlowProvider>
  )
}

function WorkflowEditorInner() {
  const { id } = useParams<{ id: string }>()
  const { data: workflow, isLoading } = useWorkflow(id!)
  const updateWorkflow = useUpdateWorkflow(id!)
  const toggleWorkflow = useToggleWorkflow()
  const { screenToFlowPosition } = useReactFlow()

  const [nodes, setNodes, onNodesChange] = useNodesState(DEFAULT_NODES)
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([])
  const [selectedNode, setSelectedNode] = useState<Node | null>(null)
  const [workflowName, setWorkflowName] = useState('Untitled workflow')
  const [isDirty, setIsDirty] = useState(false)
  const [initialized, setInitialized] = useState(false)
  const [lastExecution, setLastExecution] = useState<Execution | null>(null)
  const [showGenerateDialog, setShowGenerateDialog] = useState(false)
  const executeWorkflow = useExecuteWorkflow(id!)
  const generateWorkflow = useGenerateWorkflow()

  useEffect(() => {
    if (workflow && !initialized) {
      setWorkflowName(workflow.name)
      const graph = workflow.graph as any
      if (graph?.nodes?.length) {
        setNodes(graph.nodes)
        setEdges(graph.edges ?? [])
      } else {
        setNodes(DEFAULT_NODES)
        setEdges([])
      }
      setInitialized(true)
    }
  }, [workflow, initialized])

  const onConnect = useCallback((connection: Connection) => {
    setEdges((eds) => addEdge({ ...connection, ...defaultEdgeOptions }, eds))
    setIsDirty(true)
  }, [setEdges])

  const onNodesChangeTracked = useCallback((changes: any) => {
    onNodesChange(changes)
    if (changes.some((c: any) => c.type !== 'select' && c.type !== 'dimensions')) {
      setIsDirty(true)
    }
  }, [onNodesChange])

  const onEdgesChangeTracked = useCallback((changes: any) => {
    onEdgesChange(changes)
    setIsDirty(true)
  }, [onEdgesChange])

  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
  }, [])

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    const type = e.dataTransfer.getData('application/reactflow/type')
    if (!type) return
    const position = screenToFlowPosition({ x: e.clientX, y: e.clientY })
    const newNode: Node = {
      id: `${type.replace('.', '-')}-${Date.now()}`,
      type,
      position,
      data: getDefaultNodeData(type),
    }
    setNodes((prev) => [...prev, newNode])
    setIsDirty(true)
  }, [screenToFlowPosition, setNodes])

  const onNodeClick = useCallback((_: React.MouseEvent, node: Node) => {
    setSelectedNode(node)
  }, [])

  const onPaneClick = useCallback(() => {
    setSelectedNode(null)
  }, [])

  const updateNodeData = useCallback((nodeId: string, data: Record<string, any>) => {
    setNodes((prev) =>
      prev.map((n) => n.id === nodeId ? { ...n, data: { ...n.data, ...data } } : n)
    )
    setSelectedNode((prev) => prev?.id === nodeId ? { ...prev, data: { ...prev.data, ...data } } : prev)
    setIsDirty(true)
  }, [setNodes])

  const deleteNode = useCallback((nodeId: string) => {
    setNodes((prev) => prev.filter((n) => n.id !== nodeId))
    setEdges((prev) => prev.filter((e) => e.source !== nodeId && e.target !== nodeId))
    setSelectedNode(null)
    setIsDirty(true)
  }, [setNodes, setEdges])

  const save = useCallback(() => {
    updateWorkflow.mutate(
      { name: workflowName, graph: { nodes, edges } },
      { onSuccess: () => setIsDirty(false) },
    )
  }, [updateWorkflow, workflowName, nodes, edges])

  const memoizedNodeTypes = useMemo(() => nodeTypes, [])

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background text-muted-foreground">
        Loading…
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Toolbar */}
        <div className="h-14 shrink-0 border-b border-border bg-card flex items-center px-4 gap-3">
          <Link to="/workflows">
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              <ArrowLeft size={15} />
            </Button>
          </Link>

          <input
            value={workflowName}
            onChange={(e) => { setWorkflowName(e.target.value); setIsDirty(true) }}
            className="bg-transparent font-semibold text-sm focus:outline-none border-b border-transparent focus:border-border px-0.5 min-w-0 max-w-xs"
          />

          {isDirty && (
            <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Circle size={6} className="fill-amber-400 text-amber-400" />
              Unsaved
            </span>
          )}
          {updateWorkflow.isSuccess && !isDirty && (
            <span className="text-xs text-green-500">Saved</span>
          )}

          <button
            title={workflow?.isEnabled ? 'Disable workflow' : 'Enable workflow'}
            disabled={toggleWorkflow.isPending}
            onClick={() => workflow && toggleWorkflow.mutate({ id: id!, isEnabled: !workflow.isEnabled })}
            className={`flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-medium transition-colors border ${
              workflow?.isEnabled
                ? 'border-emerald-600/50 text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20'
                : 'border-border text-muted-foreground hover:bg-accent'
            }`}
          >
            <Power size={11} />
            {workflow?.isEnabled ? 'Active' : 'Draft'}
          </button>

          <div className="ml-auto flex items-center gap-2">
            <Button
              size="sm"
              variant="ghost"
              className="text-muted-foreground hover:text-foreground"
              onClick={() => {
                const json = JSON.stringify({ name: workflowName, graph: { nodes, edges } }, null, 2)
                const blob = new Blob([json], { type: 'application/json' })
                const url = URL.createObjectURL(blob)
                const a = document.createElement('a')
                a.href = url
                a.download = `${workflowName.replace(/\s+/g, '-').toLowerCase()}.json`
                a.click()
                URL.revokeObjectURL(url)
              }}
            >
              <Download size={13} className="mr-1.5" />
              Export
            </Button>
            <Link to={`/workflows/${id}/history`}>
              <Button size="sm" variant="ghost" className="text-muted-foreground hover:text-foreground">
                <History size={13} className="mr-1.5" />
                History
              </Button>
            </Link>
            <Button
              size="sm"
              variant="outline"
              className="border-violet-500/40 text-violet-400 hover:bg-violet-500/10 hover:text-violet-300"
              onClick={() => {
                generateWorkflow.reset()
                setShowGenerateDialog(true)
              }}
            >
              <Sparkles size={13} className="mr-1.5" />
              Generate
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => executeWorkflow.mutate(undefined, {
                onSuccess: (result) => setLastExecution(result),
                onError: (err: any) => alert(err?.response?.data?.message ?? 'Execution failed'),
              })}
              disabled={executeWorkflow.isPending || isDirty}
              title={isDirty ? 'Save before running' : 'Run workflow'}
            >
              <Play size={13} className="mr-1.5" />
              {executeWorkflow.isPending ? 'Running…' : 'Run'}
            </Button>
            <Button size="sm" onClick={save} disabled={updateWorkflow.isPending || !isDirty}>
              <Save size={13} className="mr-1.5" />
              {updateWorkflow.isPending ? 'Saving…' : 'Save'}
            </Button>
          </div>
        </div>

        {/* Canvas area */}
        <div className="flex-1 flex overflow-hidden">
          <NodePalette />

          <div className="flex-1 relative" onDrop={onDrop} onDragOver={onDragOver}>
            <ReactFlow
              nodes={nodes}
              edges={edges}
              onNodesChange={onNodesChangeTracked}
              onEdgesChange={onEdgesChangeTracked}
              onConnect={onConnect}
              onNodeClick={onNodeClick}
              onPaneClick={onPaneClick}
              nodeTypes={memoizedNodeTypes}
              defaultEdgeOptions={defaultEdgeOptions}
              deleteKeyCode="Delete"
              fitView
              proOptions={{ hideAttribution: true }}
            >
              <Background
                variant={BackgroundVariant.Dots}
                gap={20}
                size={1}
                color="#1e293b"
              />
              <Controls showInteractive={false} />
            </ReactFlow>

            {lastExecution && (
              <div className="absolute bottom-0 left-0 right-0 z-10">
                <ExecutionPanel
                  execution={lastExecution}
                  onClose={() => setLastExecution(null)}
                />
              </div>
            )}
          </div>

          {selectedNode && (
            <NodeConfig
              node={selectedNode}
              workflowId={id!}
              onUpdate={updateNodeData}
              onDelete={deleteNode}
              onClose={() => setSelectedNode(null)}
            />
          )}
        </div>
      </div>

      {showGenerateDialog && (
        <GenerateDialog
          isLoading={generateWorkflow.isPending}
          error={
            generateWorkflow.isError
              ? ((generateWorkflow.error as any)?.response?.data?.message ?? 'Generation failed. Please try again.')
              : null
          }
          onClose={() => setShowGenerateDialog(false)}
          onGenerate={(description) => {
            generateWorkflow.mutate(description, {
              onSuccess: (graph) => {
                const laid = layoutNodes(graph.nodes, graph.edges)
                const styledEdges = graph.edges.map((e: any) => ({
                  ...e,
                  ...defaultEdgeOptions,
                }))
                setNodes(laid)
                setEdges(styledEdges as any)
                setSelectedNode(null)
                setIsDirty(true)
                setShowGenerateDialog(false)
              },
            })
          }}
        />
      )}
    </div>
  )
}
