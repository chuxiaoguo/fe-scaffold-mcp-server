<template>
  <div :class="nodeClasses">
    <div class="node-header">
      <el-icon class="node-icon">
        <DataAnalysis />
      </el-icon>
      <BlinkLight :status="data.status" size="small" />
    </div>
    <div class="node-content">
      <div class="node-title">{{ data.label }}</div>
      <div class="node-metrics" v-if="data.value || data.target">
        <div class="metric-row">
          <span class="metric-value" v-if="data.value">{{ data.value }}</span>
          <span class="metric-separator" v-if="data.value && data.target">/</span>
          <span class="metric-target" v-if="data.target">{{ data.target }}</span>
        </div>
        <div class="progress-bar" v-if="data.value && data.target">
          <div class="progress-fill" :style="{ width: getProgressWidth() }"></div>
        </div>
      </div>
      <div class="node-description" v-if="data.description">
        {{ data.description }}
      </div>
      <div class="node-type">过程指标</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { DataAnalysis } from '@element-plus/icons-vue'
import BlinkLight from '../BlinkLight.vue'
import type { FlowNodeData } from '@/types'

interface Props {
  data: FlowNodeData
}

const props = defineProps<Props>()

const nodeClasses = computed(() => [
  'flow-node',
  'process-node',
  `status-${props.data.status}`
])

// 计算进度条宽度
const getProgressWidth = (): string => {
  if (!props.data.value || !props.data.target) return '0%'
  
  const current = parseFloat(props.data.value.replace('%', ''))
  const target = parseFloat(props.data.target.replace('%', ''))
  
  if (isNaN(current) || isNaN(target) || target === 0) return '0%'
  
  const percentage = Math.min((current / target) * 100, 100)
  return `${percentage}%`
}
</script>

<style scoped lang="scss">
.flow-node {
  min-width: 140px;
  max-width: 180px;
  background-color: var(--el-bg-color-overlay);
  border: 1px solid var(--el-border-color);
  border-radius: 6px;
  padding: 10px;
  transition: all 0.3s ease;
  
  &:hover {
    border-color: var(--el-color-primary);
    box-shadow: 0 2px 8px rgba(64, 158, 255, 0.15);
    transform: translateY(-1px);
  }
  
  &.status-warning {
    border-color: var(--el-color-danger);
    background-color: rgba(245, 108, 108, 0.03);
  }
  
  &.status-normal {
    border-color: var(--el-color-success);
    background-color: rgba(103, 194, 58, 0.03);
  }
}

.process-node {
  background: var(--el-fill-color);
  border-radius: 4px;
}

.node-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 6px;
  
  .node-icon {
    font-size: 14px;
    color: var(--el-text-color-secondary);
  }
}

.node-content {
  text-align: center;
  
  .node-title {
    font-size: 12px;
    font-weight: 500;
    color: var(--el-text-color-primary);
    margin-bottom: 6px;
    line-height: 1.3;
    word-break: break-word;
  }
  
  .node-metrics {
    margin-bottom: 6px;
    
    .metric-row {
      display: flex;
      justify-content: center;
      align-items: center;
      gap: 4px;
      margin-bottom: 4px;
      font-size: 10px;
      
      .metric-value {
        color: var(--el-text-color-primary);
        font-weight: 600;
      }
      
      .metric-separator {
        color: var(--el-text-color-secondary);
      }
      
      .metric-target {
        color: var(--el-color-info);
        font-weight: 500;
      }
    }
    
    .progress-bar {
      width: 100%;
      height: 4px;
      background-color: var(--el-border-color-lighter);
      border-radius: 2px;
      overflow: hidden;
      
      .progress-fill {
        height: 100%;
        background-color: var(--el-color-primary);
        border-radius: 2px;
        transition: width 0.3s ease;
        
        .status-warning & {
          background-color: var(--el-color-danger);
        }
        
        .status-normal & {
          background-color: var(--el-color-success);
        }
      }
    }
  }
  
  .node-description {
    font-size: 10px;
    color: var(--el-text-color-placeholder);
    margin-bottom: 6px;
    line-height: 1.2;
    word-break: break-word;
  }
  
  .node-type {
    font-size: 9px;
    color: var(--el-text-color-secondary);
    background-color: var(--el-fill-color-lighter);
    padding: 1px 4px;
    border-radius: 2px;
    display: inline-block;
  }
}

// 状态特定的进度条颜色
.process-node.status-warning {
  .progress-fill {
    background-color: var(--el-color-danger);
  }
}

.process-node.status-normal {
  .progress-fill {
    background-color: var(--el-color-success);
  }
}
</style>