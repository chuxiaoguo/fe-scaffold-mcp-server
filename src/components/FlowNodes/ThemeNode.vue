<template>
  <div :class="nodeClasses">
    <div class="node-header">
      <el-icon class="node-icon">
        <Collection />
      </el-icon>
      <BlinkLight :status="data.status" size="small" />
    </div>
    <div class="node-content">
      <div class="node-title">{{ data.label }}</div>
      <div class="node-type">主题</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Collection } from '@element-plus/icons-vue'
import BlinkLight from '../BlinkLight.vue'
import type { FlowNodeData } from '@/types'

interface Props {
  data: FlowNodeData
}

const props = defineProps<Props>()

const nodeClasses = computed(() => [
  'flow-node',
  'theme-node',
  `status-${props.data.status}`
])
</script>

<style scoped lang="scss">
.flow-node {
  min-width: 140px;
  background-color: var(--el-bg-color-overlay);
  border: 2px solid var(--el-border-color);
  border-radius: 10px;
  padding: 14px;
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

.theme-node {
  background: linear-gradient(135deg, var(--el-bg-color-overlay) 0%, var(--el-fill-color) 100%);
}

.node-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
  
  .node-icon {
    font-size: 18px;
    color: var(--el-color-info);
  }
}

.node-content {
  text-align: center;
  
  .node-title {
    font-size: 14px;
    font-weight: 600;
    color: var(--el-text-color-primary);
    margin-bottom: 4px;
    line-height: 1.4;
  }
  
  .node-type {
    font-size: 11px;
    color: var(--el-text-color-secondary);
    background-color: var(--el-fill-color-light);
    padding: 2px 6px;
    border-radius: 3px;
    display: inline-block;
  }
}
</style>