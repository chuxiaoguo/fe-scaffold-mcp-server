<template>
  <div class="alert-table-container">
    <!-- 表格标题 -->
    <div class="table-header">
      <h2 class="table-title">告警监控总览</h2>
      <div class="table-actions">
        <el-button
          type="primary"
          :icon="Refresh"
          @click="handleRefresh"
          :loading="loading"
        >
          刷新数据
        </el-button>
      </div>
    </div>

    <!-- 主表格 -->
    <el-table
      :data="tableData"
      :loading="loading"
      height="100%"
      stripe
      border
      highlight-current-row
      class="alert-table"
    >
      <!-- 机构名称列 -->
      <el-table-column
        prop="institutionName"
        label="机构名称"
        width="180"
        fixed="left"
        class-name="institution-column"
      >
        <template #default="{ row }">
          <div class="institution-cell">
            <el-icon class="institution-icon">
              <OfficeBuilding />
            </el-icon>
            <span class="institution-name">{{ row.institutionName }}</span>
          </div>
        </template>
      </el-table-column>

      <!-- 动态告警项列 -->
      <el-table-column
        v-for="alertItem in alertItems"
        :key="alertItem.key"
        :prop="alertItem.key"
        :label="alertItem.name"
        align="center"
        width="120"
        :class-name="alertItem.clickable ? 'clickable-column' : ''"
      >
        <template #default="{ row }">
          <div class="alert-cell">
            <BlinkLight
              :status="row.alerts[alertItem.key]"
              :clickable="alertItem.clickable"
              size="large"
              @click="handleAlertClick(row.institutionName, alertItem.key)"
            />
            <div class="alert-status-text">
              {{ getStatusText(row.alerts[alertItem.key]) }}
            </div>
          </div>
        </template>
      </el-table-column>

      <!-- 操作列 -->
      <el-table-column
        label="操作"
        width="120"
        fixed="right"
        align="center"
      >
        <template #default="{ row }">
          <el-button
            type="text"
            size="small"
            @click="handleViewDetails(row.institutionName)"
          >
            查看详情
          </el-button>
        </template>
      </el-table-column>

      <!-- 空状态 -->
      <template #empty>
        <div class="empty-state">
          <el-icon class="empty-icon">
            <Document />
          </el-icon>
          <p>暂无告警数据</p>
        </div>
      </template>
    </el-table>

    <!-- 表格底部信息 -->
    <div class="table-footer">
      <div class="status-legend">
        <div class="legend-item">
          <BlinkLight status="normal" size="small" />
          <span>正常</span>
        </div>
        <div class="legend-item">
          <BlinkLight status="warning" size="small" />
          <span>告警</span>
        </div>
      </div>
      <div class="update-time">
        最后更新：{{ formatUpdateTime(lastUpdateTime) }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { Refresh, OfficeBuilding, Document } from '@element-plus/icons-vue'
import BlinkLight from './BlinkLight.vue'
import type { InstitutionAlert, AlertItem, AlertStatus } from '@/types'

interface Props {
  data: InstitutionAlert[]
  alertItems: AlertItem[]
  loading?: boolean
}

interface Emits {
  (e: 'alert-click', institutionName: string, alertKey: string): void
  (e: 'view-details', institutionName: string): void
  (e: 'refresh'): void
}

const props = withDefaults(defineProps<Props>(), {
  loading: false
})

const emit = defineEmits<Emits>()

const lastUpdateTime = ref<Date>(new Date())

// 表格数据
const tableData = computed(() => props.data)

// 获取状态文本
const getStatusText = (status: AlertStatus): string => {
  const statusMap = {
    normal: '正常',
    warning: '告警'
  }
  return statusMap[status] || '未知'
}

// 格式化更新时间
const formatUpdateTime = (time: Date): string => {
  return time.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  })
}

// 处理告警点击
const handleAlertClick = (institutionName: string, alertKey: string) => {
  console.log('Alert clicked:', institutionName, alertKey)
  
  // 如果是主题列，触发特殊处理
  if (alertKey === 'theme') {
    emit('alert-click', institutionName, alertKey)
  } else {
    ElMessage.info(`点击了 ${institutionName} 的 ${alertKey} 告警`)
  }
}

// 处理查看详情
const handleViewDetails = (institutionName: string) => {
  emit('view-details', institutionName)
}

// 处理刷新
const handleRefresh = () => {
  lastUpdateTime.value = new Date()
  emit('refresh')
}

// 组件挂载时更新时间
onMounted(() => {
  lastUpdateTime.value = new Date()
})
</script>

<style scoped lang="scss">
.alert-table-container {
  display: flex;
  flex-direction: column;
  height: 100%;
  background-color: var(--el-bg-color-overlay);
  border-radius: 8px;
  padding: 20px;
}

.table-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  
  .table-title {
    font-size: 24px;
    font-weight: 600;
    color: var(--el-text-color-primary);
    margin: 0;
  }
  
  .table-actions {
    display: flex;
    gap: 12px;
  }
}

.alert-table {
  flex: 1;
  
  :deep(.el-table__header-wrapper) {
    .el-table__header {
      th {
        background-color: var(--el-fill-color-light);
        color: var(--el-text-color-primary);
        font-weight: 600;
        border-bottom: 2px solid var(--el-border-color);
      }
    }
  }
  
  :deep(.el-table__body-wrapper) {
    .el-table__body {
      tr {
        &:hover {
          background-color: rgba(64, 158, 255, 0.1);
        }
        
        td {
          border-bottom: 1px solid var(--el-border-color-lighter);
        }
      }
    }
  }
  
  :deep(.institution-column) {
    background-color: var(--el-fill-color);
  }
  
  :deep(.clickable-column) {
    cursor: pointer;
    
    &:hover {
      background-color: rgba(64, 158, 255, 0.05);
    }
  }
}

.institution-cell {
  display: flex;
  align-items: center;
  gap: 8px;
  
  .institution-icon {
    font-size: 16px;
    color: var(--el-color-primary);
  }
  
  .institution-name {
    font-weight: 500;
    color: var(--el-text-color-primary);
  }
}

.alert-cell {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  
  .alert-status-text {
    font-size: 12px;
    color: var(--el-text-color-secondary);
  }
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px;
  color: var(--el-text-color-secondary);
  
  .empty-icon {
    font-size: 48px;
    margin-bottom: 16px;
    opacity: 0.5;
  }
  
  p {
    font-size: 14px;
    margin: 0;
  }
}

.table-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid var(--el-border-color-lighter);
}

.status-legend {
  display: flex;
  gap: 24px;
  
  .legend-item {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 14px;
    color: var(--el-text-color-regular);
  }
}

.update-time {
  font-size: 12px;
  color: var(--el-text-color-secondary);
}

// 响应式适配
@media (max-width: 1024px) {
  .table-header {
    flex-direction: column;
    gap: 16px;
    align-items: flex-start;
    
    .table-title {
      font-size: 20px;
    }
  }
  
  .table-footer {
    flex-direction: column;
    gap: 12px;
    align-items: flex-start;
  }
}

@media (max-width: 768px) {
  .alert-table-container {
    padding: 16px;
  }
  
  .table-header {
    .table-title {
      font-size: 18px;
    }
  }
  
  .alert-table {
    :deep(.el-table__header-wrapper),
    :deep(.el-table__body-wrapper) {
      .el-table__header th,
      .el-table__body td {
        padding: 8px 4px;
        font-size: 12px;
      }
    }
  }
  
  .status-legend {
    gap: 16px;
    
    .legend-item {
      font-size: 12px;
    }
  }
}
</style>