<template>
  <div :class="nodeClasses">
    <div class="node-header">
      <el-icon class="node-icon">
        <OfficeBuilding />
      </el-icon>
      <BlinkLight :status="data.status" size="small" />
    </div>
    <div class="node-content">
      <div class="node-title">{{ data.label }}</div>
      <div class="node-type">机构</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { OfficeBuilding } from '@element-plus/icons-vue'
import BlinkLight from '../BlinkLight.vue'
import type { FlowNodeData } from '@/types'

interface Props {
  data: FlowNodeData
}

const props = defineProps<Props>()

const nodeClasses = computed(() => [
  'flow-node',
  'institution-node',
  `status-${props.data.status}`
])
</script>

<style scoped lang="scss">
.flow-node {
  min-width: 160px;
  background-color: var(--el-bg-color-overlay);
  border: 2px solid var(--el-border-color);
  border-radius: 12px;
  padding: 16px;
  transition: all 0.3s ease;
  
  &:hover {
    border-color: var(--el-color-primary);
    box-shadow: 0 4px 12px rgba(64, 158, 255, 0.2);
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

.institution-node {
  border-width: 3px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
}

.node-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  
  .node-icon {
    font-size: 20px;
    color: var(--el-color-primary);
  }
}

.node-content {
  text-align: center;
  
  .node-title {
    font-size: 16px;
    font-weight: 600;
    color: var(--el-text-color-primary);
    margin-bottom: 4px;
  }
  
  .node-type {
    font-size: 12px;
    color: var(--el-text-color-secondary);
    background-color: var(--el-fill-color-light);
    padding: 2px 8px;
    border-radius: 4px;
    display: inline-block;
  }
}
</style>