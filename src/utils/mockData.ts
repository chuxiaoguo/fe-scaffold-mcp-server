import type { 
  InstitutionAlert, 
  AlertItem, 
  AlertTableData, 
  InstitutionFlowData,
  Theme,
  KPIIndicator,
  ProcessIndicator,
  AlertStatus
} from '@/types'

// 模拟告警项配置
const ALERT_ITEMS: AlertItem[] = [
  { key: 'strategy', name: '策略下发', clickable: false },
  { key: 'response', name: '首问未回', clickable: false },
  { key: 'theme', name: '主题', clickable: true },
  { key: 'system', name: '系统运维', clickable: false },
  { key: 'satisfaction', name: '客户满意度', clickable: false }
]

// 机构列表
const INSTITUTIONS = [
  '深圳分中心',
  '上海分中心', 
  '北京分中心',
  '广州分中心',
  '杭州分中心',
  '成都分中心',
  '武汉分中心',
  '西安分中心'
]

// 随机生成告警状态
const getRandomStatus = (): AlertStatus => {
  return Math.random() > 0.7 ? 'warning' : 'normal'
}

// 随机生成百分比值
const getRandomPercentage = (min = 60, max = 100): string => {
  return `${Math.floor(Math.random() * (max - min) + min)}%`
}

// 随机生成数值
const getRandomValue = (min = 100, max = 1000): string => {
  return Math.floor(Math.random() * (max - min) + min).toString()
}

// 生成告警表格数据
const generateAlertData = (): AlertTableData => {
  const institutions: InstitutionAlert[] = INSTITUTIONS.map(name => {
    const alerts: Record<string, AlertStatus> = {}
    
    ALERT_ITEMS.forEach(item => {
      alerts[item.key] = getRandomStatus()
    })
    
    return {
      institutionName: name,
      alerts
    }
  })
  
  return {
    institutions,
    alertItems: ALERT_ITEMS
  }
}

// 生成流程图数据
const generateInstitutionFlowData = (institutionName: string): InstitutionFlowData => {
  // 主题配置
  const themes: Theme[] = [
    {
      id: 'theme_1',
      name: '做大银管',
      status: getRandomStatus(),
      kpis: [
        {
          id: 'kpi_1_1',
          name: '银管月日均净增',
          status: getRandomStatus(),
          value: getRandomValue(800, 1200),
          target: '1000',
          processIndicators: [
            {
              id: 'process_1_1_1',
              name: '重点商机跟进率',
              status: getRandomStatus(),
              value: getRandomPercentage(70, 95),
              target: '85%',
              description: '重点客户商机的跟进完成率'
            },
            {
              id: 'process_1_1_2', 
              name: '吸金率',
              status: getRandomStatus(),
              value: getRandomPercentage(60, 90),
              target: '80%',
              description: '资金吸纳效率指标'
            }
          ]
        },
        {
          id: 'kpi_1_2',
          name: '银管客户增长',
          status: getRandomStatus(),
          value: getRandomValue(150, 300),
          target: '200',
          processIndicators: [
            {
              id: 'process_1_2_1',
              name: '新客户获取率',
              status: getRandomStatus(),
              value: getRandomPercentage(65, 85),
              target: '75%',
              description: '新客户开发成功率'
            }
          ]
        }
      ]
    },
    {
      id: 'theme_2',
      name: '财富管理',
      status: getRandomStatus(),
      kpis: [
        {
          id: 'kpi_2_1',
          name: '理财产品销售额',
          status: getRandomStatus(),
          value: getRandomValue(5000, 8000),
          target: '6000',
          processIndicators: [
            {
              id: 'process_2_1_1',
              name: '基础理财覆盖率',
              status: getRandomStatus(),
              value: getRandomPercentage(75, 95),
              target: '85%',
              description: '基础理财产品的客户覆盖率'
            },
            {
              id: 'process_2_1_2',
              name: '高端理财转化率',
              status: getRandomStatus(),
              value: getRandomPercentage(40, 70),
              target: '55%',
              description: '高端理财产品的销售转化率'
            }
          ]
        }
      ]
    },
    {
      id: 'theme_3',
      name: '风险控制',
      status: getRandomStatus(),
      kpis: [
        {
          id: 'kpi_3_1',
          name: '风险资产占比',
          status: getRandomStatus(),
          value: getRandomPercentage(8, 15),
          target: '10%',
          processIndicators: [
            {
              id: 'process_3_1_1',
              name: '逾期率控制',
              status: getRandomStatus(),
              value: getRandomPercentage(1, 5),
              target: '3%',
              description: '贷款逾期率控制指标'
            },
            {
              id: 'process_3_1_2',
              name: '风险预警响应率',
              status: getRandomStatus(),
              value: getRandomPercentage(85, 100),
              target: '95%',
              description: '风险预警信号的响应处理率'
            }
          ]
        }
      ]
    }
  ]
  
  return {
    institutionName,
    institutionId: `inst_${institutionName}`,
    themes
  }
}

// 模拟数据服务
export const mockDataService = {
  // 获取告警数据
  getAlertData(): AlertTableData {
    return generateAlertData()
  },
  
  // 获取机构流程图数据
  getInstitutionFlowData(institutionName: string): InstitutionFlowData {
    return generateInstitutionFlowData(institutionName)
  },
  
  // 更新告警状态
  updateAlertStatus(institutionName: string, alertKey: string, status: AlertStatus): boolean {
    // 模拟API调用
    console.log(`Updating alert: ${institutionName} - ${alertKey} to ${status}`)
    return true
  },
  
  // 批量更新告警
  batchUpdateAlerts(updates: Array<{
    institutionName: string
    alertKey: string
    status: AlertStatus
  }>): boolean {
    console.log('Batch updating alerts:', updates)
    return true
  },
  
  // 获取历史数据
  getHistoryData(institutionName: string, dateRange: { start: Date; end: Date }) {
    console.log(`Getting history data for ${institutionName}`, dateRange)
    return {
      data: [],
      total: 0
    }
  },
  
  // 模拟实时数据推送
  subscribeRealTimeUpdates(callback: (data: AlertTableData) => void): () => void {
    const interval = setInterval(() => {
      const newData = generateAlertData()
      callback(newData)
    }, 30000) // 30秒推送一次
    
    return () => clearInterval(interval)
  },
  
  // 获取系统配置
  getSystemConfig() {
    return {
      refreshInterval: 10000,
      alertThresholds: {
        warning: 0.8,
        critical: 0.9
      },
      notificationSettings: {
        sound: true,
        desktop: true,
        email: false
      }
    }
  },
  
  // 导出数据
  exportData(format: 'csv' | 'excel' | 'pdf', data: any) {
    console.log(`Exporting data in ${format} format`, data)
    return Promise.resolve({
      success: true,
      downloadUrl: `/exports/data.${format}`
    })
  }
}

// 数据模拟工具
export const dataUtils = {
  // 生成随机ID
  generateId(): string {
    return Math.random().toString(36).substr(2, 9)
  },
  
  // 生成时间戳
  generateTimestamp(): Date {
    return new Date()
  },
  
  // 模拟网络延迟
  async simulateNetworkDelay(min = 200, max = 1000): Promise<void> {
    const delay = Math.random() * (max - min) + min
    return new Promise(resolve => setTimeout(resolve, delay))
  },
  
  // 模拟API错误
  simulateApiError(probability = 0.1): boolean {
    return Math.random() < probability
  },
  
  // 格式化数据
  formatPercentage(value: number): string {
    return `${(value * 100).toFixed(1)}%`
  },
  
  formatCurrency(value: number): string {
    return `¥${value.toLocaleString('zh-CN')}`
  },
  
  formatDate(date: Date): string {
    return date.toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit', 
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    })
  }
}