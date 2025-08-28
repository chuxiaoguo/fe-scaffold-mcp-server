<template>
  <div :class="nodeClasses">
    <div class="node-header">
      <el-icon class="node-icon">
        <TrendCharts />
      </el-icon>
      <BlinkLight :status="data.status" size="small" />
    </div>
    <div class="node-content">
      <div class="node-title">{{ data.label }}</div>
      <div class="node-metrics" v-if="data.value || data.target">
        <div class="metric-item" v-if="data.value">
          <span class="metric-label">当前值:</span>
          <span class="metric-value">{{ data.value }}</span>
        </div>
        <div class="metric-item" v-if="data.target">
          <span class="metric-label">目标值:</span>
          <span class="metric-target">{{ data.target }}</span>
        </div>
      </div>
      <div class="node-type">KPI指标</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { TrendCharts } from '@element-plus/icons-vue'
import BlinkLight from '../BlinkLight.vue'
import type { FlowNodeData } from '@/types'

interface Props {
  data: FlowNodeData
}

const props = defineProps<Props>()

const nodeClasses = computed(() => [
  'flow-node',
  'kpi-node',
  `status-${props.data.status}`
])
</script>

<style scoped lang="scss">
.flow-node {
  min-width: 160px;
  background-color: var(--el-bg-color-overlay);
  border: 2px solid var(--el-border-color);
  border-radius: 8px;
  padding: 12px;
  transition: all 0.3s ease;
  
  &:hover {
    border-color: var(--el-color-primary);
    box-shadow: 0 4px 12px rgba(64, 158, 255, 0.2);
    transform: translateY(-2px);
  }
  
  &.status-warning {
    border-color: var(--el-color-danger);
    background-color: rgba(245, 108, 108, 0.05);
  }
  
  &.status-normal {
    border-color: var(--el-color-success);
    background-color: rgba(103, 194, 58, 0.05);
  }
}

.kpi-node {
  background: linear-gradient(135deg, var(--el-bg-color-overlay) 0%, var(--el-fill-color-light) 100%);
  border-style: dashed;
}

.node-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
  
  .node-icon {
    font-size: 16px;
    color: var(--el-color-warning);
  }
}

.node-content {
  text-align: center;
  
  .node-title {
    font-size: 13px;
    font-weight: 600;
    color: var(--el-text-color-primary);
    margin-bottom: 8px;
    line-height: 1.3;
  }
  
  .node-metrics {
    margin-bottom: 8px;
    
    .metric-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 4px;
      font-size: 11px;
      
      .metric-label {
        color: var(--el-text-color-secondary);
      }
      
      .metric-value {
        color: var(--el-text-color-primary);
        font-weight: 500;
      }
      
      .metric-target {
        color: var(--el-color-info);
        font-weight: 500;
      }
    }
  }
  
  .node-type {
    font-size: 10px;
    color: var(--el-text-color-secondary);
    background-color: var(--el-fill-color-light);
    padding: 2px 6px;
    border-radius: 3px;
    display: inline-block;
  }
}
</style>