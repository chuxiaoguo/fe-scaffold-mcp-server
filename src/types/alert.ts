// 告警状态类型
export type AlertStatus = 'normal' | 'warning'

// 告警项类型
export interface AlertItem {
  key: string
  name: string
  clickable?: boolean
}

// 机构告警数据类型
export interface InstitutionAlert {
  institutionName: string
  alerts: Record<string, AlertStatus>
}

// 告警表格数据类型
export interface AlertTableData {
  institutions: InstitutionAlert[]
  alertItems: AlertItem[]
}

// API响应类型
export interface ApiResponse<T> {
  code: number
  message: string
  data: T
}