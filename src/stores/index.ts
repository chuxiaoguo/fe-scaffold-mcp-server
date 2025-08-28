// 导出所有store
export { useAlertStore } from './alert'
export { useFlowStore } from './flow'

// 重置所有store的工具函数
export const resetAllStores = () => {
  const alertStore = useAlertStore()
  const flowStore = useFlowStore()
  
  alertStore.reset()
  flowStore.reset()
}

// 获取所有store状态摘要
export const getAllStoresSummary = () => {
  const alertStore = useAlertStore()
  const flowStore = useFlowStore()
  
  return {
    alert: alertStore.getAlertSummary(),
    flow: flowStore.getFlowSummary(),
    timestamp: new Date()
  }
}