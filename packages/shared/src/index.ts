export type ExecutionStatus = 'pending' | 'running' | 'success' | 'failed' | 'cancelled'

export type TriggerType = 'manual' | 'schedule' | 'webhook'

export type WorkflowNodeType =
  | 'trigger.manual'
  | 'trigger.schedule'
  | 'trigger.webhook'
  | 'control.condition'
  | 'control.switch'
  | 'control.merge'
  | 'control.delay'
  | 'ai.run_agent'
  | 'ai.agent_decision'
  | 'ai.agent_review'
  | 'mcp.execute_tool'
  | 'mcp.fetch_resource'
  | 'util.set_variable'
  | 'util.transform_data'
  | 'util.json_parser'
  | 'util.response'
  | 'util.notification'
  | 'util.log'

export interface WorkflowNode {
  id: string
  type: WorkflowNodeType
  position: { x: number; y: number }
  data: Record<string, unknown>
}

export interface WorkflowEdge {
  id: string
  source: string
  target: string
  label?: string
}

export interface WorkflowGraph {
  nodes: WorkflowNode[]
  edges: WorkflowEdge[]
}
