// 导出所有类型定义
export * from './alert'
export * from './flow'

// 通用工具类型
export interface BaseResponse {
  success: boolean
  message?: string
}

// 分页类型
export interface Pagination {
  current: number
  size: number
  total: number
}

// 组件基础属性
export interface ComponentProps {
  loading?: boolean
  disabled?: boolean
}

// 主题配置
export interface ThemeConfig {
  primaryColor: string
  successColor: string
  warningColor: string
  dangerColor: string
  backgroundColor: string
}

// 常量定义
export const ALERT_STATUS_COLORS = {
  normal: '#67c23a',
  warning: '#f56c6c'
} as const

export const NODE_TYPES = {
  institution: 'institution',
  theme: 'theme', 
  kpi: 'kpi',
  process: 'process'
} as const