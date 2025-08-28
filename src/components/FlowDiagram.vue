<template>
  <el-dialog
    :model-value="props.visible"
    @update:model-value="emit('update:visible', $event)"
    :title="dialogTitle"
    width="90%"
    top="5vh"
    :close-on-click-modal="false"
    :close-on-press-escape="true"
    class="flow-dialog"
    @close="handleClose"
  >
    <div class="flow-container">
      <!-- 工具栏 -->
      <div class="flow-toolbar">
        <div class="toolbar-left">
          <el-button-group>
            <el-button
              type="primary"
              :icon="ZoomIn"
              @click="zoomIn"
              size="small"
            >
              放大
            </el-button>
            <el-button
              type="primary"
              :icon="ZoomOut"
              @click="zoomOut"
              size="small"
            >
              缩小
            </el-button>
            <el-button
              type="primary"
              :icon="Refresh"
              @click="resetView"
              size="small"
            >
              重置视图
            </el-button>
            <el-button
              type="success"
              :icon="Position"
              @click="reLayoutGraph"
              size="small"
              :loading="layoutInProgress"
            >
              {{ layoutInProgress ? '布局中...' : '重新布局' }}
            </el-button>
          </el-button-group>
          <div class="layout-info">
            <el-button
              size="small"
              type="info"
              @click="toggleLayoutStyle"
              :loading="layoutInProgress"
            >
              布局: {{ currentLayoutStyle === 'compact' ? '紧凑' : currentLayoutStyle === 'spacious' ? '宽松' : '平衡' }}
            </el-button>
          </div>
        </div>
        <div class="toolbar-right">
          <div class="status-summary">
            <div class="summary-item">
              <BlinkLight status="normal" size="small" />
              <span>正常: {{ normalCount }}</span>
            </div>
            <div class="summary-item">
              <BlinkLight status="warning" size="small" />
              <span>告警: {{ warningCount }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Vue Flow 画布 -->
      <div class="flow-canvas">
        <!-- 空状态提示 -->
        <div v-if="nodes.length === 0" class="empty-flow-state">
          <el-icon class="empty-icon"><Document /></el-icon>
          <p>正在加载流程图数据...</p>
        </div>
        
        <VueFlow
          :key="`flow-${props.institutionData?.institutionName || 'default'}`"
          v-model:nodes="nodes"
          v-model:edges="edges"
          :default-zoom="0.8"
          :min-zoom="0.1"
          :max-zoom="2"
          :snap-to-grid="true"
          :snap-grid="[20, 20]"
          :nodes-draggable="true"
          :zoom-on-scroll="true"
          :pan-on-scroll="false"
          class="vue-flow-custom"
          @node-click="handleNodeClick"
          @edge-click="handleEdgeClick"
          @pane-ready="onPaneReady"
        >
          <!-- 自定义节点模板 -->
          <template #node-institution="{ data }">
            <InstitutionNode :data="data" />
          </template>
          
          <template #node-theme="{ data }">
            <ThemeNode :data="data" />
          </template>
          
          <template #node-kpi="{ data }">
            <KpiNode :data="data" />
          </template>
          
          <template #node-process="{ data }">
            <ProcessNode :data="data" />
          </template>

          <!-- 控制面板 -->
          <Controls
            :show-zoom="true"
            :show-fit-view="true"
            :show-interactive="true"
            position="bottom-right"
          />

          <!-- 小地图 -->
          <MiniMap
            :node-color="getNodeColor"
            :node-stroke-color="getNodeStrokeColor"
            :node-stroke-width="2"
            position="bottom-left"
            pannable
            zoomable
          />

          <!-- 背景 -->
          <Background
            :size="20"
            pattern-color="#4a5568"
            :gap="20"
          />
        </VueFlow>
      </div>
    </div>

    <!-- 对话框底部 -->
    <template #footer>
      <div class="dialog-footer">
        <div class="footer-info">
          <span class="node-count">总节点数: {{ totalNodeCount }}</span>
          <span class="update-time">更新时间: {{ formatTime(updateTime) }}</span>
        </div>
        <el-button @click="handleClose">关闭</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { computed, ref, watch, nextTick } from 'vue'
import { VueFlow, useVueFlow } from '@vue-flow/core'
import { Background } from '@vue-flow/background'
import { Controls } from '@vue-flow/controls'
import { MiniMap } from '@vue-flow/minimap'
import { ZoomIn, ZoomOut, Refresh, Document, Position } from '@element-plus/icons-vue'
import BlinkLight from './BlinkLight.vue'
import InstitutionNode from './FlowNodes/InstitutionNode.vue'
import ThemeNode from './FlowNodes/ThemeNode.vue'
import KpiNode from './FlowNodes/KpiNode.vue'
import ProcessNode from './FlowNodes/ProcessNode.vue'
import { layoutNodesWithDagre, centerLayout, getRecommendedLayoutOptions, animateLayoutTransition, type LayoutDirection, type LayoutStyle } from '@/utils/dagreLayout'
import type { FlowNode, FlowEdge, InstitutionFlowData, NodeType } from '@/types'

interface Props {
  visible: boolean
  institutionData: InstitutionFlowData | null
}

interface Emits {
  (e: 'update:visible', value: boolean): void
  (e: 'node-click', node: FlowNode): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const { zoomIn, zoomOut, fitView } = useVueFlow()

const nodes = ref<FlowNode[]>([])
const edges = ref<FlowEdge[]>([])
const updateTime = ref<Date>(new Date())
const currentLayoutDirection = ref<LayoutDirection>('TB')
const currentLayoutStyle = ref<LayoutStyle>('balanced')
const layoutInProgress = ref(false)

// 对话框标题
const dialogTitle = computed(() => {
  return props.institutionData 
    ? `${props.institutionData.institutionName} - 指标流程图`
    : '指标流程图'
})

// 统计数据
const normalCount = computed(() => {
  return nodes.value.filter(node => node.data.status === 'normal').length
})

const warningCount = computed(() => {
  return nodes.value.filter(node => node.data.status === 'warning').length
})

const totalNodeCount = computed(() => nodes.value.length)

// 格式化时间
const formatTime = (time: Date): string => {
  return time.toLocaleString('zh-CN', {
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// 获取节点颜色（用于小地图）
const getNodeColor = (node: FlowNode): string => {
  return node.data.status === 'warning' ? '#f56c6c' : '#67c23a'
}

const getNodeStrokeColor = (node: FlowNode): string => {
  return node.data.status === 'warning' ? '#e54545' : '#5dab34'
}

// 处理面板准备就绪
const onPaneReady = () => {
  console.log('Vue Flow pane ready')
  if (nodes.value.length > 0) {
    setTimeout(() => {
      fitView({ padding: 0.1, duration: 500 })
      console.log('FitView called after pane ready')
    }, 100)
  }
}

// 生成流程图数据
const generateFlowData = (data: InstitutionFlowData) => {
  console.log('Generating flow data for:', data)
  
  if (!data || !data.themes || data.themes.length === 0) {
    console.warn('No themes data available')
    nodes.value = []
    edges.value = []
    return
  }
  
  layoutInProgress.value = true
  
  const newNodes: FlowNode[] = []
  const newEdges: FlowEdge[] = []
  
  let nodeId = 0
  const getNextId = () => `node_${++nodeId}`
  
  // 创建机构根节点（位置由dagre计算）
  const institutionId = getNextId()
  newNodes.push({
    id: institutionId,
    type: 'institution',
    position: { x: 0, y: 0 }, // 临时位置，将由dagre重新计算
    data: {
      label: data.institutionName,
      status: data.themes.some(t => t.status === 'warning') ? 'warning' : 'normal'
    }
  })
  
  // 创建主题节点
  data.themes.forEach((theme, themeIndex) => {
    const themeId = getNextId()
    
    newNodes.push({
      id: themeId,
      type: 'theme',
      position: { x: 0, y: 0 }, // 临时位置
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
      
      newNodes.push({
        id: kpiId,
        type: 'kpi',
        position: { x: 0, y: 0 }, // 临时位置
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
        
        newNodes.push({
          id: processId,
          type: 'process',
          position: { x: 0, y: 0 }, // 临时位置
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
  
  console.log('Generated nodes before layout:', newNodes.length)
  console.log('Generated edges:', newEdges.length)
  
  // 智能选择布局参数
  const recommendedOptions = getRecommendedLayoutOptions(newNodes, newEdges)
  currentLayoutDirection.value = recommendedOptions.direction
  currentLayoutStyle.value = recommendedOptions.style
  
  console.log('Using recommended layout:', recommendedOptions)
  
  // 使用 dagre 自动布局
  const layoutedNodes = layoutNodesWithDagre(newNodes, newEdges, {
    direction: currentLayoutDirection.value,
    style: currentLayoutStyle.value
  })
  
  // 居中布局
  const centeredNodes = centerLayout(layoutedNodes, 1200, 900)
  
  console.log('Nodes after dagre layout:', centeredNodes.length)
  
  nodes.value = centeredNodes
  edges.value = newEdges
  updateTime.value = new Date()
  
  // 强制触发fitView
  nextTick(() => {
    setTimeout(() => {
      fitView({ padding: 0.1, duration: 500 })
      layoutInProgress.value = false
      console.log('FitView called after dagre layout')
    }, 200)
  })
}

// 监听数据变化
watch(() => props.institutionData, (newData) => {
  console.log('Institution data changed:', newData)
  if (newData) {
    generateFlowData(newData)
  } else {
    // 清空数据
    nodes.value = []
    edges.value = []
  }
}, { immediate: true })

// 监听对话框显示状态
watch(() => props.visible, (visible) => {
  console.log('Dialog visibility changed:', visible)
  console.log('Current nodes count:', nodes.value.length)
  console.log('Current edges count:', edges.value.length)
})

// 重置视图
const resetView = () => {
  fitView({ padding: 0.1, duration: 300 })
}

// 重新布局
const reLayoutGraph = () => {
  if (nodes.value.length === 0) {
    console.warn('No nodes to layout')
    return
  }
  
  layoutInProgress.value = true
  console.log('Re-layouting graph with', nodes.value.length, 'nodes')
  
  // 获取新的推荐布局选项
  const recommendedOptions = getRecommendedLayoutOptions(nodes.value, edges.value)
  currentLayoutDirection.value = recommendedOptions.direction
  currentLayoutStyle.value = recommendedOptions.style
  
  console.log('Using layout options:', recommendedOptions)
  
  // 使用 dagre 重新计算布局
  const layoutedNodes = layoutNodesWithDagre(nodes.value, edges.value, {
    direction: currentLayoutDirection.value,
    style: currentLayoutStyle.value
  })
  
  const centeredNodes = centerLayout(layoutedNodes, 1200, 900)
  
  // 更新节点位置
  nodes.value = centeredNodes
  updateTime.value = new Date()
  
  // 适配视图
  nextTick(() => {
    setTimeout(() => {
      fitView({ padding: 0.1, duration: 500 })
      layoutInProgress.value = false
      console.log('Re-layout completed')
    }, 100)
  })
}

// 切换布局样式
const toggleLayoutStyle = () => {
  if (nodes.value.length === 0) return
  
  layoutInProgress.value = true
  
  // 循环切换布局样式
  const styles: LayoutStyle[] = ['balanced', 'compact', 'spacious']
  const currentIndex = styles.indexOf(currentLayoutStyle.value)
  const nextStyle = styles[(currentIndex + 1) % styles.length]
  
  console.log('Switching layout style from', currentLayoutStyle.value, 'to', nextStyle)
  
  currentLayoutStyle.value = nextStyle
  
  // 重新计算布局
  const layoutedNodes = layoutNodesWithDagre(nodes.value, edges.value, {
    direction: currentLayoutDirection.value,
    style: currentLayoutStyle.value
  })
  
  const centeredNodes = centerLayout(layoutedNodes, 1200, 900)
  
  // 更新节点位置
  nodes.value = centeredNodes
  updateTime.value = new Date()
  
  nextTick(() => {
    setTimeout(() => {
      fitView({ padding: 0.1, duration: 500 })
      layoutInProgress.value = false
      console.log('Layout style switched to:', nextStyle)
    }, 100)
  })
}

// 处理节点点击
const handleNodeClick = (event: { node: FlowNode }) => {
  console.log('Node clicked:', event.node)
  emit('node-click', event.node)
}

// 处理边点击
const handleEdgeClick = (event: { edge: FlowEdge }) => {
  console.log('Edge clicked:', event.edge)
}

// 处理对话框关闭
const handleClose = () => {
  emit('update:visible', false)
}
</script>

<style scoped lang="scss">
.flow-dialog {
  :deep(.el-dialog) {
    background-color: var(--el-bg-color-overlay);
    border: 1px solid var(--el-border-color);
  }
  
  :deep(.el-dialog__header) {
    background-color: var(--el-fill-color-light);
    border-bottom: 1px solid var(--el-border-color);
    padding: 16px 20px;
    
    .el-dialog__title {
      color: var(--el-text-color-primary);
      font-size: 18px;
      font-weight: 600;
    }
  }
  
  :deep(.el-dialog__body) {
    padding: 0;
    background-color: var(--el-bg-color);
  }
  
  :deep(.el-dialog__footer) {
    background-color: var(--el-fill-color-light);
    border-top: 1px solid var(--el-border-color);
  }
}

.flow-container {
  height: 70vh;
  display: flex;
  flex-direction: column;
}

.flow-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  background-color: var(--el-fill-color);
  border-bottom: 1px solid var(--el-border-color);
  
  .toolbar-left {
    display: flex;
    gap: 12px;
    align-items: center;
    
    .layout-info {
      margin-left: 12px;
    }
  }
  
  .toolbar-right {
    .status-summary {
      display: flex;
      gap: 24px;
      
      .summary-item {
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 14px;
        color: var(--el-text-color-regular);
      }
    }
  }
}

.flow-canvas {
  flex: 1;
  position: relative;
  min-height: 500px; // 添加最小高度
  
  .empty-flow-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100%;
    min-height: 400px;
    color: var(--el-text-color-secondary);
    
    .empty-icon {
      font-size: 48px;
      margin-bottom: 16px;
      opacity: 0.5;
    }
    
    p {
      font-size: 16px;
      margin: 0;
    }
  }
  
  .vue-flow-custom {
    width: 100%;
    height: 100%;
    background-color: var(--el-bg-color);
    
    // 确保 Vue Flow 容器有正确的尺寸
    .vue-flow__container {
      width: 100%;
      height: 100%;
    }
    
    // 节点样式
    .vue-flow__node {
      cursor: pointer;
    }
    
    :deep(.vue-flow__controls) {
      background-color: var(--el-bg-color-overlay);
      border: 1px solid var(--el-border-color);
      border-radius: 8px;
      
      .vue-flow__controls-button {
        background-color: var(--el-fill-color-light);
        border: 1px solid var(--el-border-color);
        color: var(--el-text-color-primary);
        
        &:hover {
          background-color: var(--el-fill-color-lighter);
        }
      }
    }
    
    :deep(.vue-flow__minimap) {
      background-color: var(--el-bg-color-overlay);
      border: 1px solid var(--el-border-color);
      border-radius: 8px;
    }
    
    :deep(.vue-flow__edge) {
      .vue-flow__edge-path {
        stroke: var(--el-border-color-light);
        stroke-width: 2;
      }
      
      &.selected .vue-flow__edge-path {
        stroke: var(--el-color-primary);
        stroke-width: 3;
      }
    }
  }
}

.dialog-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  
  .footer-info {
    display: flex;
    gap: 24px;
    font-size: 14px;
    color: var(--el-text-color-secondary);
    
    .node-count {
      font-weight: 500;
    }
  }
}

// 响应式适配
@media (max-width: 1024px) {
  .flow-toolbar {
    flex-direction: column;
    gap: 12px;
    
    .toolbar-left,
    .toolbar-right {
      width: 100%;
    }
    
    .status-summary {
      justify-content: center;
    }
  }
  
  .dialog-footer {
    flex-direction: column;
    gap: 12px;
    
    .footer-info {
      flex-direction: column;
      gap: 8px;
      text-align: center;
    }
  }
}
</style>