import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { InstitutionAlert, AlertItem, AlertStatus } from '@/types'

export const useAlertStore = defineStore('alert', () => {
  // 状态
  const institutions = ref<InstitutionAlert[]>([])
  const alertItems = ref<AlertItem[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)
  const lastUpdateTime = ref<Date>(new Date())
  const autoRefreshEnabled = ref(true)
  const refreshInterval = ref(10000) // 10秒
  
  // 计算属性
  const totalInstitutions = computed(() => institutions.value.length)
  
  const totalAlerts = computed(() => {
    return institutions.value.reduce((total, institution) => {
      return total + Object.keys(institution.alerts).length
    }, 0)
  })
  
  const warningCount = computed(() => {
    return institutions.value.reduce((count, institution) => {
      return count + Object.values(institution.alerts).filter(status => status === 'warning').length
    }, 0)
  })
  
  const normalCount = computed(() => {
    return institutions.value.reduce((count, institution) => {
      return count + Object.values(institution.alerts).filter(status => status === 'normal').length
    }, 0)
  })
  
  const warningInstitutions = computed(() => {
    return institutions.value.filter(institution => 
      Object.values(institution.alerts).some(status => status === 'warning')
    )
  })
  
  // 获取特定机构的告警状态
  const getInstitutionAlerts = computed(() => {
    return (institutionName: string) => {
      return institutions.value.find(inst => inst.institutionName === institutionName)?.alerts || {}
    }
  })
  
  // 动作
  const setLoading = (value: boolean) => {
    loading.value = value
  }
  
  const setError = (message: string | null) => {
    error.value = message
  }
  
  const setInstitutions = (data: InstitutionAlert[]) => {
    institutions.value = data
    lastUpdateTime.value = new Date()
    error.value = null
  }
  
  const setAlertItems = (items: AlertItem[]) => {
    alertItems.value = items
  }
  
  const updateInstitutionAlert = (institutionName: string, alertKey: string, status: AlertStatus) => {
    const institution = institutions.value.find(inst => inst.institutionName === institutionName)
    if (institution) {
      institution.alerts[alertKey] = status
      lastUpdateTime.value = new Date()
    }
  }
  
  const clearData = () => {
    institutions.value = []
    alertItems.value = []
    error.value = null
    lastUpdateTime.value = new Date()
  }
  
  const setAutoRefresh = (enabled: boolean) => {
    autoRefreshEnabled.value = enabled
  }
  
  const setRefreshInterval = (interval: number) => {
    refreshInterval.value = interval
  }
  
  const reset = () => {
    institutions.value = []
    alertItems.value = []
    loading.value = false
    error.value = null
    lastUpdateTime.value = new Date()
    autoRefreshEnabled.value = true
    refreshInterval.value = 10000
  }
  
  return {
    // 状态
    institutions,
    alertItems,
    loading,
    error,
    lastUpdateTime,
    autoRefreshEnabled,
    refreshInterval,
    
    // 计算属性
    totalInstitutions,
    totalAlerts,
    warningCount,
    normalCount,
    warningInstitutions,
    getInstitutionAlerts,
    
    // 动作
    setLoading,
    setError,
    setInstitutions,
    setAlertItems,
    updateInstitutionAlert,
    clearData,
    setAutoRefresh,
    setRefreshInterval,
    reset
  }
})