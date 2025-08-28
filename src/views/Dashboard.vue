<template>
  <div class="dashboard-container">
    <!-- 页面头部 -->
    <div class="dashboard-header">
      <div class="header-left">
        <h1 class="page-title">告警监控系统</h1>
        <div class="subtitle">实时监控各机构业务指标状态</div>
      </div>
      <div class="header-right">
        <div class="status-overview">
          <div class="overview-item normal">
            <BlinkLight status="normal" size="small" />
            <span class="overview-label">正常</span>
            <span class="overview-count">{{ alertStore.normalCount }}</span>
          </div>
          <div class="overview-item warning">
            <BlinkLight status="warning" size="small" />
            <span class="overview-label">告警</span>
            <span class="overview-count">{{ alertStore.warningCount }}</span>
          </div>
        </div>
        <div class="header-actions">
          <el-button
            type="primary"
            :icon="Refresh"
            @click="handleRefreshData"
            :loading="alertStore.loading"
            size="default"
          >
            刷新数据
          </el-button>
          <el-button
            :icon="Setting"
            @click="showSettings = true"
            size="default"
          >
            设置
          </el-button>
        </div>
      </div>
    </div>

    <!-- 主要内容区域 -->
    <div class="dashboard-content">
      <!-- 告警表格 -->
      <div class="table-section">
        <AlertTable
          :data="alertStore.institutions"
          :alert-items="alertStore.alertItems"
          :loading="alertStore.loading"
          @alert-click="handleAlertClick"
          @view-details="handleViewDetails"
          @refresh="handleRefreshData"
        />
      </div>
    </div>

    <!-- 流程图弹窗 -->
    <FlowDiagram
      v-model:visible="flowStore.visible"
      :institution-data="flowStore.institutionData"
      @node-click="handleNodeClick"
    />

    <!-- 设置弹窗 -->
    <el-dialog
      v-model="showSettings"
      title="系统设置"
      width="500px"
      :close-on-click-modal="false"
    >
      <div class="settings-content">
        <el-form :model="settings" label-width="120px">
          <el-form-item label="自动刷新">
            <el-switch
              v-model="settings.autoRefresh"
              @change="handleAutoRefreshChange"
            />
          </el-form-item>
          <el-form-item label="刷新间隔" v-if="settings.autoRefresh">
            <el-select v-model="settings.refreshInterval" @change="handleIntervalChange">
              <el-option label="5秒" :value="5000" />
              <el-option label="10秒" :value="10000" />
              <el-option label="30秒" :value="30000" />
              <el-option label="1分钟" :value="60000" />
            </el-select>
          </el-form-item>
          <el-form-item label="动画效果">
            <el-switch v-model="settings.animations" />
          </el-form-item>
          <el-form-item label="声音提醒">
            <el-switch v-model="settings.soundAlerts" />
          </el-form-item>
        </el-form>
      </div>
      <template #footer>
        <el-button @click="showSettings = false">取消</el-button>
        <el-button type="primary" @click="saveSettings">保存</el-button>
      </template>
    </el-dialog>

    <!-- 错误提示 -->
    <div v-if="alertStore.error" class="error-banner">
      <el-alert
        :title="alertStore.error"
        type="error"
        :closable="true"
        @close="alertStore.setError(null)"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { ElMessage, ElNotification } from 'element-plus'
import { Refresh, Setting } from '@element-plus/icons-vue'
import AlertTable from '@/components/AlertTable.vue'
import FlowDiagram from '@/components/FlowDiagram.vue'
import BlinkLight from '@/components/BlinkLight.vue'
import { useAlertStore, useFlowStore } from '@/stores'
import { loadMockData, getInstitutionFlowData } from '@/utils/api'
import type { FlowNode } from '@/types'

// 状态管理
const alertStore = useAlertStore()
const flowStore = useFlowStore()

// 组件状态
const showSettings = ref(false)
const refreshTimer = ref<number | null>(null)

// 设置数据
const settings = ref({
  autoRefresh: true,
  refreshInterval: 10000,
  animations: true,
  soundAlerts: false
})

// 初始化数据
const initializeData = async () => {
  try {
    alertStore.setLoading(true)
    const data = await loadMockData()
    alertStore.setInstitutions(data.institutions)
    alertStore.setAlertItems(data.alertItems)
    
    ElMessage.success('数据加载成功')
  } catch (error) {
    console.error('Failed to load data:', error)
    alertStore.setError('数据加载失败，请重试')
    ElMessage.error('数据加载失败')
  } finally {
    alertStore.setLoading(false)
  }
}

// 处理刷新数据
const handleRefreshData = async () => {
  await initializeData()
}

// 处理告警点击事件
const handleAlertClick = async (institutionName: string, alertKey: string) => {
  console.log('Alert clicked:', institutionName, alertKey)
  
  if (alertKey === 'theme') {
    try {
      // 获取机构流程图数据
      const flowData = await getInstitutionFlowData(institutionName)
      
      // 打开流程图弹窗
      flowStore.openFlowDialog(institutionName, flowData)
      
      ElMessage.info(`正在查看 ${institutionName} 的主题流程图`)
    } catch (error) {
      console.error('Failed to load flow data:', error)
      ElMessage.error('流程图数据加载失败')
    }
  } else {
    ElMessage.info(`点击了 ${institutionName} 的 ${alertKey} 告警`)
  }
}

// 处理查看详情
const handleViewDetails = (institutionName: string) => {
  ElMessage.info(`查看 ${institutionName} 的详细信息`)
  // 这里可以跳转到详情页面或打开详情弹窗
}

// 处理流程图节点点击
const handleNodeClick = (node: FlowNode) => {
  console.log('Flow node clicked:', node)
  
  const nodeTypeNames = {
    institution: '机构',
    theme: '主题',
    kpi: 'KPI指标',
    process: '过程指标'
  }
  
  const typeName = nodeTypeNames[node.type] || '节点'
  
  ElNotification({
    title: `${typeName}信息`,
    message: `名称: ${node.data.label}\\n状态: ${node.data.status === 'warning' ? '告警' : '正常'}`,
    type: node.data.status === 'warning' ? 'warning' : 'success',
    duration: 3000
  })
}

// 处理自动刷新设置变化
const handleAutoRefreshChange = (enabled: boolean) => {
  alertStore.setAutoRefresh(enabled)
  if (enabled) {
    startAutoRefresh()
  } else {
    stopAutoRefresh()
  }
}

// 处理刷新间隔变化
const handleIntervalChange = (interval: number) => {
  alertStore.setRefreshInterval(interval)
  settings.value.refreshInterval = interval
  
  if (settings.value.autoRefresh) {
    stopAutoRefresh()
    startAutoRefresh()
  }
}

// 开始自动刷新
const startAutoRefresh = () => {
  if (refreshTimer.value) {
    clearInterval(refreshTimer.value)
  }
  
  refreshTimer.value = window.setInterval(() => {
    handleRefreshData()
  }, settings.value.refreshInterval)
}

// 停止自动刷新
const stopAutoRefresh = () => {
  if (refreshTimer.value) {
    clearInterval(refreshTimer.value)
    refreshTimer.value = null
  }
}

// 保存设置
const saveSettings = () => {
  // 这里可以将设置保存到localStorage或服务器
  localStorage.setItem('dashboard-settings', JSON.stringify(settings.value))
  
  showSettings.value = false
  ElMessage.success('设置已保存')
}

// 加载设置
const loadSettings = () => {
  const saved = localStorage.getItem('dashboard-settings')
  if (saved) {
    try {
      const parsedSettings = JSON.parse(saved)
      settings.value = { ...settings.value, ...parsedSettings }
      
      // 应用设置
      alertStore.setAutoRefresh(settings.value.autoRefresh)
      alertStore.setRefreshInterval(settings.value.refreshInterval)
    } catch (error) {
      console.error('Failed to load settings:', error)
    }
  }
}

// 页面标题和状态计算
const pageTitle = computed(() => {
  const warnings = alertStore.warningCount
  
  if (warnings > 0) {
    return `告警监控系统 (${warnings}项告警)`
  }
  return '告警监控系统'
})

// 生命周期
onMounted(async () => {
  // 加载设置
  loadSettings()
  
  // 初始化数据
  await initializeData()
  
  // 启动自动刷新
  if (settings.value.autoRefresh) {
    startAutoRefresh()
  }
  
  // 设置页面标题
  document.title = pageTitle.value
})

onUnmounted(() => {
  stopAutoRefresh()
})
</script>

<style scoped lang="scss">
.dashboard-container {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: var(--el-bg-color);
  overflow: hidden;
}

.dashboard-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  background-color: var(--el-bg-color-overlay);
  border-bottom: 1px solid var(--el-border-color);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  
  .header-left {
    .page-title {
      font-size: 28px;
      font-weight: 700;
      color: var(--el-text-color-primary);
      margin: 0 0 4px 0;
      background: linear-gradient(135deg, var(--el-color-primary), var(--el-color-info));
      background-clip: text;
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }
    
    .subtitle {
      font-size: 14px;
      color: var(--el-text-color-secondary);
    }
  }
  
  .header-right {
    display: flex;
    align-items: center;
    gap: 24px;
    
    .status-overview {
      display: flex;
      gap: 20px;
      
      .overview-item {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 8px 16px;
        background-color: var(--el-fill-color);
        border-radius: 8px;
        border: 1px solid var(--el-border-color);
        
        .overview-label {
          font-size: 14px;
          color: var(--el-text-color-regular);
        }
        
        .overview-count {
          font-size: 18px;
          font-weight: 600;
          color: var(--el-text-color-primary);
        }
        
        &.normal {
          border-color: var(--el-color-success);
          background-color: rgba(103, 194, 58, 0.1);
        }
        
        &.warning {
          border-color: var(--el-color-danger);
          background-color: rgba(245, 108, 108, 0.1);
        }
      }
    }
    
    .header-actions {
      display: flex;
      gap: 12px;
    }
  }
}

.dashboard-content {
  flex: 1;
  padding: 20px 24px;
  overflow: hidden;
  
  .table-section {
    height: 100%;
  }
}

.settings-content {
  .el-form-item {
    margin-bottom: 20px;
  }
}

.error-banner {
  position: fixed;
  top: 80px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 2000;
  width: 90%;
  max-width: 600px;
}

// 响应式适配
@media (max-width: 1200px) {
  .dashboard-header {
    flex-direction: column;
    gap: 16px;
    align-items: flex-start;
    
    .header-right {
      width: 100%;
      justify-content: space-between;
      flex-wrap: wrap;
      gap: 16px;
    }
  }
}

@media (max-width: 768px) {
  .dashboard-header {
    padding: 16px 16px;
    
    .header-left {
      .page-title {
        font-size: 24px;
      }
    }
    
    .header-right {
      .status-overview {
        flex-direction: column;
        gap: 12px;
        width: 100%;
        
        .overview-item {
          justify-content: space-between;
          width: 100%;
        }
      }
      
      .header-actions {
        width: 100%;
        justify-content: center;
      }
    }
  }
  
  .dashboard-content {
    padding: 16px;
  }
}

// 加载动画
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>