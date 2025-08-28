import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { FlowNode, FlowEdge, InstitutionFlowData, Theme, KPIIndicator, ProcessIndicator } from '@/types'

export const useFlowStore = defineStore('flow', () => {
  // 状态
  const visible = ref(false)
  const currentInstitution = ref<string>('')
  const institutionData = ref<InstitutionFlowData | null>(null)
  const nodes = ref<FlowNode[]>([])
  const edges = ref<FlowEdge[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)
  const selectedNodeId = ref<string>('')
  
  // 计算属性
  const totalNodes = computed(() => nodes.value.length)
  
  const nodesByType = computed(() => {
    const groups = {
      institution: 0,
      theme: 0,
      kpi: 0,
      process: 0
    }
    nodes.value.forEach(node => {
      if (node.type in groups) {
        groups[node.type as keyof typeof groups]++
      }
    })
    return groups
  })
  
  const warningNodes = computed(() => {
    return nodes.value.filter(node => node.data.status === 'warning')
  })
  
  const normalNodes = computed(() => {
    return nodes.value.filter(node => node.data.status === 'normal')
  })
  
  const currentThemes = computed(() => {
    return institutionData.value?.themes || []
  })
  
  const selectedNode = computed(() => {
    return nodes.value.find(node => node.id === selectedNodeId.value)
  })
  
  // 动作
  const setVisible = (value: boolean) => {
    visible.value = value
    if (!value) {
      // 关闭时清理选中状态
      selectedNodeId.value = ''
    }
  }
  
  const setLoading = (value: boolean) => {
    loading.value = value
  }
  
  const setError = (message: string | null) => {
    error.value = message
  }
  
  const setCurrentInstitution = (institutionName: string) => {
    currentInstitution.value = institutionName
  }
  
  const setInstitutionData = (data: InstitutionFlowData | null) => {
    institutionData.value = data
    if (data) {
      currentInstitution.value = data.institutionName
      generateFlowData(data)
    } else {
      clearFlowData()
    }
  }
  
  const setNodes = (newNodes: FlowNode[]) => {
    nodes.value = newNodes
  }
  
  const setEdges = (newEdges: FlowEdge[]) => {
    edges.value = newEdges
  }
  
  const setSelectedNode = (nodeId: string) => {
    selectedNodeId.value = nodeId
  }
  
  const clearFlowData = () => {
    nodes.value = []
    edges.value = []
    selectedNodeId.value = ''
    error.value = null
  }
  
  // 生成流程图数据
  const generateFlowData = (data: InstitutionFlowData) => {
    const newNodes: FlowNode[] = []
    const newEdges: FlowEdge[] = []
    
    let nodeId = 0
    const getNextId = () => `node_${++nodeId}`
    
    // 层级配置
    const levelConfig = {
      institution: { y: 50, spacing: 0 },
      theme: { y: 200, spacing: 300 },
      kpi: { y: 350, spacing: 250 },
      process: { y: 500, spacing: 200 }
    }
    
    // 创建机构根节点
    const institutionId = getNextId()
    newNodes.push({
      id: institutionId,
      type: 'institution',
      position: { x: 400, y: levelConfig.institution.y },
      data: {
        label: data.institutionName,
        status: data.themes.some(t => t.status === 'warning') ? 'warning' : 'normal'
      }
    })
    
    // 创建主题节点
    data.themes.forEach((theme, themeIndex) => {
      const themeId = getNextId()
      const themeX = 100 + themeIndex * levelConfig.theme.spacing
      
      newNodes.push({
        id: themeId,
        type: 'theme',
        position: { x: themeX, y: levelConfig.theme.y },
        data: {
          label: theme.name,
          status: theme.status
        }
      })
      
      // 连接机构到主题
      newEdges.push({
        id: `edge_${institutionId}_${themeId}`,
        source: institutionId,
        target: themeId,
        type: 'smoothstep'
      })
      
      // 创建KPI节点
      theme.kpis.forEach((kpi, kpiIndex) => {
        const kpiId = getNextId()
        const kpiX = themeX - 50 + kpiIndex * levelConfig.kpi.spacing
        
        newNodes.push({
          id: kpiId,
          type: 'kpi',
          position: { x: kpiX, y: levelConfig.kpi.y },
          data: {
            label: kpi.name,
            status: kpi.status,
            value: kpi.value,
            target: kpi.target
          }
        })
        
        // 连接主题到KPI
        newEdges.push({
          id: `edge_${themeId}_${kpiId}`,
          source: themeId,
          target: kpiId,
          type: 'smoothstep'
        })
        
        // 创建过程指标节点
        kpi.processIndicators.forEach((process, processIndex) => {
          const processId = getNextId()
          const processX = kpiX - 50 + processIndex * levelConfig.process.spacing
          
          newNodes.push({
            id: processId,
            type: 'process',
            position: { x: processX, y: levelConfig.process.y },
            data: {
              label: process.name,
              status: process.status,
              value: process.value,
              target: process.target,
              description: process.description
            }
          })
          
          // 连接KPI到过程指标
          newEdges.push({
            id: `edge_${kpiId}_${processId}`,
            source: kpiId,
            target: processId,
            type: 'smoothstep'
          })
        })
      })
    })
    
    setNodes(newNodes)
    setEdges(newEdges)
    setError(null)
  }
  
  // 打开流程图对话框
  const openFlowDialog = (institutionName: string, data?: InstitutionFlowData) => {
    setCurrentInstitution(institutionName)
    if (data) {
      setInstitutionData(data)
    }
    setVisible(true)
  }
  
  // 关闭流程图对话框
  const closeFlowDialog = () => {
    setVisible(false)
    setTimeout(() => {
      clearFlowData()
      setCurrentInstitution('')
      setInstitutionData(null)
    }, 300) // 延迟清理，等待动画完成
  }
  
  // 更新节点状态
  const updateNodeStatus = (nodeId: string, status: 'normal' | 'warning') => {
    const node = nodes.value.find(n => n.id === nodeId)
    if (node) {
      node.data.status = status
    }
  }
  
  // 重置状态
  const reset = () => {
    visible.value = false
    currentInstitution.value = ''
    institutionData.value = null
    nodes.value = []
    edges.value = []
    loading.value = false
    error.value = null
    selectedNodeId.value = ''
  }
  
  return {
    // 状态
    visible,
    currentInstitution,
    institutionData,
    nodes,
    edges,
    loading,
    error,
    selectedNodeId,
    
    // 计算属性
    totalNodes,
    nodesByType,
    warningNodes,
    normalNodes,
    currentThemes,
    selectedNode,
    
    // 动作
    setVisible,
    setLoading,
    setError,
    setCurrentInstitution,
    setInstitutionData,
    setNodes,
    setEdges,
    setSelectedNode,
    clearFlowData,
    generateFlowData,
    openFlowDialog,
    closeFlowDialog,
    updateNodeStatus,
    reset
  }
})