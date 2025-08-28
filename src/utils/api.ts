import axios, { AxiosInstance, InternalAxiosRequestConfig, AxiosResponse } from 'axios'
import { ElMessage } from 'element-plus'
import type { ApiResponse, InstitutionAlert, InstitutionFlowData, AlertTableData } from '@/types'
import { mockDataService } from './mockData'

// 创建axios实例
const apiClient: AxiosInstance = axios.create({
  baseURL: '/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// 请求拦截器
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // 添加认证token（如果有）
    const token = localStorage.getItem('auth-token')
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`
    }
    
    // 添加请求时间戳
    if (config.params) {
      config.params._t = Date.now()
    } else {
      config.params = { _t: Date.now() }
    }
    
    console.log('API Request:', config.method?.toUpperCase(), config.url, config.params || config.data)
    return config
  },
  (error) => {
    console.error('Request Error:', error)
    return Promise.reject(error)
  }
)

// 响应拦截器
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    console.log('API Response:', response.config.url, response.data)
    return response
  },
  (error) => {
    console.error('Response Error:', error)
    
    // 统一错误处理
    if (error.response) {
      const { status, data } = error.response
      let message = '请求失败'
      
      switch (status) {
        case 400:
          message = data?.message || '请求参数错误'
          break
        case 401:
          message = '未授权，请重新登录'
          // 可以在这里处理登录逻辑
          break
        case 403:
          message = '禁止访问'
          break
        case 404:
          message = '请求的资源不存在'
          break
        case 500:
          message = '服务器内部错误'
          break
        case 502:
          message = '网关错误'
          break
        case 503:
          message = '服务不可用'
          break
        default:
          message = data?.message || `请求失败 (${status})`
      }
      
      ElMessage.error(message)
    } else if (error.request) {
      ElMessage.error('网络连接失败，请检查网络设置')
    } else {
      ElMessage.error('请求配置错误')
    }
    
    return Promise.reject(error)
  }
)

// API接口定义
export const api = {
  // 告警相关接口
  alerts: {
    // 获取所有告警数据
    getAll(): Promise<ApiResponse<InstitutionAlert[]>> {
      return apiClient.get('/alerts')
    },
    
    // 获取指定机构的告警数据
    getByInstitution(institutionName: string): Promise<ApiResponse<InstitutionAlert>> {
      return apiClient.get(`/alerts/institution/${encodeURIComponent(institutionName)}`)
    },
    
    // 更新告警状态
    updateStatus(institutionName: string, alertKey: string, status: string): Promise<ApiResponse<void>> {
      return apiClient.put(`/alerts/institution/${encodeURIComponent(institutionName)}/${alertKey}`, {
        status
      })
    },
    
    // 批量更新告警状态
    batchUpdate(updates: Array<{
      institutionName: string
      alertKey: string
      status: string
    }>): Promise<ApiResponse<void>> {
      return apiClient.put('/alerts/batch', { updates })
    },
    
    // 获取告警历史
    getHistory(params: {
      institutionName?: string
      alertKey?: string
      startDate?: string
      endDate?: string
      page?: number
      size?: number
    }): Promise<ApiResponse<{
      data: any[]
      total: number
      page: number
      size: number
    }>> {
      return apiClient.get('/alerts/history', { params })
    }
  },
  
  // 流程图相关接口
  flow: {
    // 获取机构流程图数据
    getInstitutionData(institutionName: string): Promise<ApiResponse<InstitutionFlowData>> {
      return apiClient.get(`/flow/institution/${encodeURIComponent(institutionName)}`)
    },
    
    // 获取流程图配置
    getConfig(): Promise<ApiResponse<any>> {
      return apiClient.get('/flow/config')
    },
    
    // 更新节点数据
    updateNodeData(nodeId: string, data: any): Promise<ApiResponse<void>> {
      return apiClient.put(`/flow/node/${nodeId}`, data)
    }
  },
  
  // 系统配置接口
  system: {
    // 获取系统配置
    getConfig(): Promise<ApiResponse<any>> {
      return apiClient.get('/system/config')
    },
    
    // 更新系统配置
    updateConfig(config: any): Promise<ApiResponse<void>> {
      return apiClient.put('/system/config', config)
    },
    
    // 获取系统状态
    getStatus(): Promise<ApiResponse<any>> {
      return apiClient.get('/system/status')
    }
  },
  
  // 用户相关接口
  user: {
    // 用户登录
    login(credentials: { username: string; password: string }): Promise<ApiResponse<{
      token: string
      user: any
    }>> {
      return apiClient.post('/auth/login', credentials)
    },
    
    // 用户登出
    logout(): Promise<ApiResponse<void>> {
      return apiClient.post('/auth/logout')
    },
    
    // 获取用户信息
    getProfile(): Promise<ApiResponse<any>> {
      return apiClient.get('/user/profile')
    },
    
    // 更新用户偏好设置
    updatePreferences(preferences: any): Promise<ApiResponse<void>> {
      return apiClient.put('/user/preferences', preferences)
    }
  },
  
  // 导出接口
  export: {
    // 导出告警数据
    exportAlerts(format: 'csv' | 'excel' | 'pdf', params?: any): Promise<Blob> {
      return apiClient.get('/export/alerts', {
        params: { format, ...params },
        responseType: 'blob'
      })
    },
    
    // 导出流程图
    exportFlow(institutionName: string, format: 'png' | 'svg' | 'pdf'): Promise<Blob> {
      return apiClient.get(`/export/flow/${encodeURIComponent(institutionName)}`, {
        params: { format },
        responseType: 'blob'
      })
    }
  }
}

// WebSocket管理器
export class WebSocketManager {
  private ws: WebSocket | null = null
  private reconnectAttempts = 0
  private maxReconnectAttempts = 5
  private reconnectInterval = 3000
  private messageHandlers: Map<string, ((data: any) => void)[]> = new Map()
  
  connect(url: string) {
    try {
      this.ws = new WebSocket(url)
      
      this.ws.onopen = () => {
        console.log('WebSocket connected')
        this.reconnectAttempts = 0
      }
      
      this.ws.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data)
          this.handleMessage(message)
        } catch (error) {
          console.error('Failed to parse WebSocket message:', error)
        }
      }
      
      this.ws.onclose = () => {
        console.log('WebSocket disconnected')
        this.attemptReconnect(url)
      }
      
      this.ws.onerror = (error) => {
        console.error('WebSocket error:', error)
      }
      
    } catch (error) {
      console.error('Failed to connect WebSocket:', error)
    }
  }
  
  private attemptReconnect(url: string) {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++
      console.log(`Attempting to reconnect WebSocket (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`)
      
      setTimeout(() => {
        this.connect(url)
      }, this.reconnectInterval)
    } else {
      console.error('Max reconnection attempts reached')
      ElMessage.error('实时连接已断开，请刷新页面')
    }
  }
  
  private handleMessage(message: { type: string; data: any }) {
    const handlers = this.messageHandlers.get(message.type)
    if (handlers) {
      handlers.forEach(handler => handler(message.data))
    }
  }
  
  subscribe(type: string, handler: (data: any) => void) {
    if (!this.messageHandlers.has(type)) {
      this.messageHandlers.set(type, [])
    }
    this.messageHandlers.get(type)!.push(handler)
  }
  
  unsubscribe(type: string, handler: (data: any) => void) {
    const handlers = this.messageHandlers.get(type)
    if (handlers) {
      const index = handlers.indexOf(handler)
      if (index > -1) {
        handlers.splice(index, 1)
      }
    }
  }
  
  send(message: any) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message))
    } else {
      console.warn('WebSocket is not connected')
    }
  }
  
  disconnect() {
    if (this.ws) {
      this.ws.close()
      this.ws = null
    }
    this.messageHandlers.clear()
    this.reconnectAttempts = 0
  }
}

// 文件下载工具
export const downloadUtils = {
  // 下载Blob文件
  downloadBlob(blob: Blob, filename: string) {
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)
  },
  
  // 下载JSON数据
  downloadJSON(data: any, filename: string) {
    const json = JSON.stringify(data, null, 2)
    const blob = new Blob([json], { type: 'application/json' })
    this.downloadBlob(blob, filename)
  },
  
  // 下载CSV数据
  downloadCSV(data: any[], filename: string) {
    if (!data.length) return
    
    const headers = Object.keys(data[0])
    const csvContent = [
      headers.join(','),
      ...data.map(row => headers.map(header => `"${row[header] || ''}"`).join(','))
    ].join('\n')
    
    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8' })
    this.downloadBlob(blob, filename)
  }
}

// 便捷函数 - 加载模拟数据
export const loadMockData = async (): Promise<AlertTableData> => {
  // 模拟网络延迟
  await new Promise(resolve => setTimeout(resolve, 500))
  return mockDataService.getAlertData()
}

// 便捷函数 - 获取机构流程图数据
export const getInstitutionFlowData = async (institutionName: string): Promise<InstitutionFlowData> => {
  // 模拟网络延迟
  await new Promise(resolve => setTimeout(resolve, 300))
  return mockDataService.getInstitutionFlowData(institutionName)
}

export default api