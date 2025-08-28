import type { Node, Edge } from '@vue-flow/core'
import type { AlertStatus } from './alert'

// 节点类型枚举
export type NodeType = 'institution' | 'theme' | 'kpi' | 'process'

// 流程图节点数据
export interface FlowNodeData {
  label: string
  status: AlertStatus
  value?: string
  target?: string
  description?: string
}

// 流程图节点
export interface FlowNode extends Node {
  id: string
  type: NodeType
  data: FlowNodeData
  position: { x: number; y: number }
}

// 流程图边
export interface FlowEdge extends Edge {
  id: string
  source: string
  target: string
  type: 'smoothstep'
}

// 过程指标
export interface ProcessIndicator {
  id: string
  name: string
  status: AlertStatus
  value: string
  target: string
  description?: string
}

// KPI指标
export interface KPIIndicator {
  id: string
  name: string
  status: AlertStatus
  value?: string
  target?: string
  processIndicators: ProcessIndicator[]
}

// 主题
export interface Theme {
  id: string
  name: string
  status: AlertStatus
  kpis: KPIIndicator[]
}

// 机构流程图数据
export interface InstitutionFlowData {
  institutionName: string
  institutionId: string
  themes: Theme[]
}

// 流程图组件属性
export interface FlowDiagramProps {
  visible: boolean
  institutionData: InstitutionFlowData | null
}

// 节点位置计算结果
export interface NodePosition {
  x: number
  y: number
}