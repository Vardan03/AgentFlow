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
} from '@xyflow/react'
import { ArrowLeft, Circle, Save } from 'lucide-react'
import { Sidebar } from '@/components/layout/sidebar'
import { Button } from '@/components/ui/button'
import { useWorkflow, useUpdateWorkflow } from '@/hooks/use-workflows'
import { TriggerNode } from './nodes/trigger-node'
import { AgentNode } from './nodes/agent-node'
import { ConditionNode } from './nodes/condition-node'
import { OutputNode } from './nodes/output-node'
import { NodePalette } from './node-palette'
import { NodeConfig } from './node-config'

const nodeTypes = {
  'trigger.manual': TriggerNode,
  'ai.run_agent': AgentNode,
  'control.condition': ConditionNode,
  'util.response': OutputNode,
}

const defaultEdgeOptions = {
  style: { stroke: '#475569', strokeWidth: 2 },
  markerEnd: { type: MarkerType.ArrowClosed, color: '#475569' },
}

function getDefaultNodeData(type: string): Record<string, any> {
  switch (type) {
    case 'trigger.manual': return { label: 'Manual Trigger' }
    case 'ai.run_agent':   return { label: 'Run Agent', agentId: '', agentName: '' }
    case 'control.condition': return { label: 'Condition', condition: '' }
    case 'util.response':  return { label: 'Response' }
    default:               return { label: type }
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
  const { screenToFlowPosition } = useReactFlow()

  const [nodes, setNodes, onNodesChange] = useNodesState(DEFAULT_NODES)
  const [edges, setEdges, onEdgesChange] = useEdgesState([])
  const [selectedNode, setSelectedNode] = useState<Node | null>(null)
  const [workflowName, setWorkflowName] = useState('Untitled workflow')
  const [isDirty, setIsDirty] = useState(false)
  const [initialized, setInitialized] = useState(false)

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

          <div className="ml-auto">
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
              <Controls
                showInteractive={false}
                style={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))' }}
              />
            </ReactFlow>
          </div>

          {selectedNode && (
            <NodeConfig
              node={selectedNode}
              onUpdate={updateNodeData}
              onDelete={deleteNode}
              onClose={() => setSelectedNode(null)}
            />
          )}
        </div>
      </div>
    </div>
  )
}
