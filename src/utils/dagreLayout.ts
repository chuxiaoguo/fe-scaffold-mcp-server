import dagre from 'dagre'
import type { FlowNode, FlowEdge } from '@/types'

// 节点尺寸配置
const NODE_SIZES = {
  institution: { width: 220, height: 90 },
  theme: { width: 180, height: 75 },
  kpi: { width: 190, height: 80 },
  process: { width: 180, height: 70 }
}

// 布局选项类型
export type LayoutDirection = 'TB' | 'BT' | 'LR' | 'RL'
export type LayoutStyle = 'compact' | 'spacious' | 'balanced'

// 预设布局配置
const LAYOUT_PRESETS: Record<LayoutStyle, Partial<typeof LAYOUT_CONFIG>> = {
  compact: {
    nodesep: 60,
    ranksep: 80,
    marginx: 30,
    marginy: 30
  },
  spacious: {
    nodesep: 120,
    ranksep: 160,
    marginx: 60,
    marginy: 60
  },
  balanced: {
    nodesep: 80,
    ranksep: 120,
    marginx: 40,
    marginy: 40
  }
}

// 布局配置
const LAYOUT_CONFIG = {
  rankdir: 'TB',  // 从上到下布局
  align: 'UL',    // 对齐方式: UL(左上), UR(右上), DL(左下), DR(右下)
  nodesep: 80,    // 同层节点间距
  ranksep: 120,   // 层级间距
  marginx: 40,    // 水平边距
  marginy: 40,    // 垂直边距
  acyclicer: 'greedy', // 处理环路
  ranker: 'tight-tree' // 排序算法
}

/**
 * 使用 dagre 自动布局节点
 * @param nodes 节点数组
 * @param edges 边数组
 * @param options 布局选项
 * @returns 带有新位置的节点数组
 */
export function layoutNodesWithDagre(
  nodes: FlowNode[], 
  edges: FlowEdge[],
  options: {
    direction?: LayoutDirection
    style?: LayoutStyle
    customConfig?: Partial<typeof LAYOUT_CONFIG>
  } = {}
): FlowNode[] {
  if (nodes.length === 0) {
    return nodes
  }

  // 创建 dagre 图实例
  const dagreGraph = new dagre.graphlib.Graph()
  
  // 构建布局配置
  const { direction = 'TB', style = 'balanced', customConfig = {} } = options
  const preset = LAYOUT_PRESETS[style] || LAYOUT_PRESETS.balanced
  
  const layoutConfig = {
    ...LAYOUT_CONFIG,
    ...preset,
    rankdir: direction,
    ...customConfig
  }
  
  console.log('Using layout config:', layoutConfig)
  
  // 设置图的默认属性
  dagreGraph.setDefaultEdgeLabel(() => ({}))
  dagreGraph.setGraph(layoutConfig)
  
  // 按节点类型分组，确保层次结构
  const nodesByType = {
    institution: nodes.filter(n => n.type === 'institution'),
    theme: nodes.filter(n => n.type === 'theme'),
    kpi: nodes.filter(n => n.type === 'kpi'),
    process: nodes.filter(n => n.type === 'process')
  }
  
  console.log('Nodes by type:', {
    institution: nodesByType.institution.length,
    theme: nodesByType.theme.length,
    kpi: nodesByType.kpi.length,
    process: nodesByType.process.length
  })
  
  // 添加节点到 dagre 图
  nodes.forEach((node) => {
    const nodeSize = NODE_SIZES[node.type] || NODE_SIZES.process
    dagreGraph.setNode(node.id, {
      width: nodeSize.width,
      height: nodeSize.height,
      // 添加节点级别信息，帮助dagre更好地分层
      rank: getNodeRank(node.type)
    })
  })
  
  // 添加边到 dagre 图
  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target, {
      weight: getEdgeWeight(nodes, edge) // 根据节点类型设置边权重
    })
  })
  
  // 执行布局计算
  dagre.layout(dagreGraph)
  
  // 将计算后的位置应用到节点
  const layoutedNodes = nodes.map((node) => {
    const nodeWithPosition = dagreGraph.node(node.id)
    
    return {
      ...node,
      position: {
        // dagre 返回的是节点中心点坐标，需要转换为左上角坐标
        x: nodeWithPosition.x - nodeWithPosition.width / 2,
        y: nodeWithPosition.y - nodeWithPosition.height / 2
      }
    }
  })
  
  console.log('Layout completed, positioned', layoutedNodes.length, 'nodes')
  
  return layoutedNodes
}

/**
 * 智能选择布局选项
 * @param nodes 节点数组
 * @param edges 边数组
 * @returns 推荐的布局选项
 */
export function getRecommendedLayoutOptions(
  nodes: FlowNode[], 
  edges: FlowEdge[]
): { direction: LayoutDirection; style: LayoutStyle } {
  const nodeCount = nodes.length
  const maxBranching = getMaxBranchingFactor(nodes, edges)
  
  // 根据节点数和分支因子选择布局风格
  let style: LayoutStyle = 'balanced'
  if (nodeCount > 30 || maxBranching > 8) {
    style = 'compact'
  } else if (nodeCount < 10 && maxBranching <= 3) {
    style = 'spacious'
  }
  
  // 简单的方向选择逻辑：默认从上到下
  const direction: LayoutDirection = 'TB'
  
  return { direction, style }
}

/**
 * 获取最大分支因子
 * @param nodes 节点数组
 * @param edges 边数组
 * @returns 最大分支因子
 */
function getMaxBranchingFactor(nodes: FlowNode[], edges: FlowEdge[]): number {
  const outDegree: Record<string, number> = {}
  
  edges.forEach(edge => {
    outDegree[edge.source] = (outDegree[edge.source] || 0) + 1
  })
  
  return Math.max(...Object.values(outDegree), 0)
}

/**
 * 创建带动画的布局过渡
 * @param currentNodes 当前节点
 * @param targetNodes 目标节点
 * @param duration 动画时长(毫秒)
 * @returns Promise<FlowNode[]>
 */
export function animateLayoutTransition(
  currentNodes: FlowNode[],
  targetNodes: FlowNode[],
  duration: number = 500
): Promise<FlowNode[]> {
  return new Promise((resolve) => {
    const steps = 30 // 动画帧数
    const stepDuration = duration / steps
    let currentStep = 0
    
    const animate = () => {
      currentStep++
      const progress = currentStep / steps
      
      // 使用缓动函数
      const easedProgress = easeInOutCubic(progress)
      
      const animatedNodes = currentNodes.map((currentNode) => {
        const targetNode = targetNodes.find(n => n.id === currentNode.id)
        if (!targetNode) return currentNode
        
        return {
          ...currentNode,
          position: {
            x: currentNode.position.x + (targetNode.position.x - currentNode.position.x) * easedProgress,
            y: currentNode.position.y + (targetNode.position.y - currentNode.position.y) * easedProgress
          }
        }
      })
      
      if (currentStep >= steps) {
        resolve(targetNodes) // 返回最终位置
      } else {
        setTimeout(animate, stepDuration)
      }
    }
    
    animate()
  })
}

/**
 * 缓动函数 - 三次方缓入缓出
 * @param t 进度 (0-1)
 * @returns 缓动后的进度
 */
function easeInOutCubic(t: number): number {
  return t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1
}

/**
 * 获取节点在布局中的层级等级
 * @param nodeType 节点类型
 * @returns 层级等级（数字越小越靠上）
 */
function getNodeRank(nodeType: string): number {
  const rankMap: Record<string, number> = {
    institution: 0,
    theme: 1,
    kpi: 2,
    process: 3
  }
  return rankMap[nodeType] || 4
}

/**
 * 根据连接的节点类型计算边的权重
 * @param nodes 所有节点
 * @param edge 边
 * @returns 边权重
 */
function getEdgeWeight(nodes: FlowNode[], edge: FlowEdge): number {
  const sourceNode = nodes.find(n => n.id === edge.source)
  const targetNode = nodes.find(n => n.id === edge.target)
  
  if (!sourceNode || !targetNode) return 1
  
  // 层级跨度越大，权重越高，确保垂直布局
  const sourcerRank = getNodeRank(sourceNode.type)
  const targetRank = getNodeRank(targetNode.type)
  
  return Math.abs(targetRank - sourcerRank) + 1
}

/**
 * 获取布局后的图形尺寸
 * @param nodes 布局后的节点
 * @returns 图形的边界框
 */
export function getLayoutBounds(nodes: FlowNode[]) {
  if (nodes.length === 0) {
    return { width: 0, height: 0, minX: 0, minY: 0, maxX: 0, maxY: 0 }
  }
  
  let minX = Infinity
  let minY = Infinity
  let maxX = -Infinity
  let maxY = -Infinity
  
  nodes.forEach((node) => {
    const nodeSize = NODE_SIZES[node.type] || NODE_SIZES.process
    
    minX = Math.min(minX, node.position.x)
    minY = Math.min(minY, node.position.y)
    maxX = Math.max(maxX, node.position.x + nodeSize.width)
    maxY = Math.max(maxY, node.position.y + nodeSize.height)
  })
  
  return {
    width: maxX - minX,
    height: maxY - minY,
    minX,
    minY,
    maxX,
    maxY
  }
}

/**
 * 居中布局
 * @param nodes 节点数组
 * @param containerWidth 容器宽度
 * @param containerHeight 容器高度
 * @returns 居中后的节点数组
 */
export function centerLayout(
  nodes: FlowNode[], 
  containerWidth: number = 800, 
  containerHeight: number = 600
): FlowNode[] {
  const bounds = getLayoutBounds(nodes)
  
  // 计算偏移量以居中布局
  const offsetX = (containerWidth - bounds.width) / 2 - bounds.minX
  const offsetY = (containerHeight - bounds.height) / 2 - bounds.minY
  
  return nodes.map(node => ({
    ...node,
    position: {
      x: node.position.x + offsetX,
      y: node.position.y + offsetY
    }
  }))
}