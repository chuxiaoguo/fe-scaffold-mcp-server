// 应用常量配置
export const APP_CONFIG = {
  name: '告警监控系统',
  version: '1.0.0',
  description: '实时监控各分中心的业务指标完成情况',
  author: '开发团队'
}

// 刷新间隔选项
export const REFRESH_INTERVALS = [
  { label: '5秒', value: 5000 },
  { label: '10秒', value: 10000 },
  { label: '30秒', value: 30000 },
  { label: '1分钟', value: 60000 },
  { label: '5分钟', value: 300000 }
]

// 告警状态配置
export const ALERT_STATUS = {
  NORMAL: 'normal' as const,
  WARNING: 'warning' as const
}

// 颜色配置
export const COLORS = {
  PRIMARY: '#409eff',
  SUCCESS: '#67c23a',
  WARNING: '#e6a23c',
  DANGER: '#f56c6c',
  INFO: '#909399'
}

// 节点类型配置
export const NODE_TYPES = {
  INSTITUTION: 'institution' as const,
  THEME: 'theme' as const,
  KPI: 'kpi' as const,
  PROCESS: 'process' as const
}

// 流程图布局配置
export const FLOW_LAYOUT = {
  LEVELS: {
    institution: { y: 50, spacing: 0 },
    theme: { y: 200, spacing: 300 },
    kpi: { y: 350, spacing: 250 },
    process: { y: 500, spacing: 200 }
  },
  NODE_SPACING: {
    horizontal: 200,
    vertical: 150
  },
  CANVAS: {
    defaultZoom: 0.8,
    minZoom: 0.1,
    maxZoom: 2.0
  }
}

// 本地存储键名
export const STORAGE_KEYS = {
  SETTINGS: 'dashboard-settings',
  USER_PREFERENCES: 'user-preferences',
  THEME: 'app-theme',
  AUTH_TOKEN: 'auth-token'
}

// 通知配置
export const NOTIFICATION_CONFIG = {
  DURATION: {
    success: 3000,
    info: 4000,
    warning: 5000,
    error: 0 // 不自动关闭
  },
  POSITION: 'top-right' as const,
  MAX_COUNT: 5
}

// API配置
export const API_CONFIG = {
  BASE_URL: '/api',
  TIMEOUT: 10000,
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000
}

// WebSocket配置
export const WS_CONFIG = {
  URL: 'ws://localhost:8080/ws',
  RECONNECT_ATTEMPTS: 5,
  RECONNECT_INTERVAL: 3000,
  HEARTBEAT_INTERVAL: 30000
}

// 表格配置
export const TABLE_CONFIG = {
  PAGE_SIZES: [10, 20, 50, 100],
  DEFAULT_PAGE_SIZE: 20,
  ROW_HEIGHT: 48,
  HEADER_HEIGHT: 56
}

// 导出格式
export const EXPORT_FORMATS = {
  CSV: 'csv' as const,
  EXCEL: 'excel' as const,
  PDF: 'pdf' as const,
  JSON: 'json' as const
}

// 主题配置
export const THEME_CONFIG = {
  DARK: {
    name: 'dark',
    colors: {
      background: '#1a1a1a',
      surface: '#2d2d2d',
      primary: '#409eff',
      text: '#e4e7ed'
    }
  },
  LIGHT: {
    name: 'light',
    colors: {
      background: '#ffffff',
      surface: '#f5f7fa',
      primary: '#409eff',
      text: '#303133'
    }
  }
}

// 动画配置
export const ANIMATION_CONFIG = {
  DURATION: {
    fast: 200,
    normal: 300,
    slow: 500
  },
  EASING: {
    ease: 'ease',
    easeIn: 'ease-in',
    easeOut: 'ease-out',
    easeInOut: 'ease-in-out'
  }
}

// 验证规则
export const VALIDATION_RULES = {
  REQUIRED: { required: true, message: '此字段为必填项', trigger: 'blur' },
  EMAIL: { type: 'email', message: '请输入正确的邮箱地址', trigger: 'blur' },
  PHONE: { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号', trigger: 'blur' },
  PASSWORD: { min: 6, max: 20, message: '密码长度为6-20位', trigger: 'blur' }
}

// 权限配置
export const PERMISSIONS = {
  VIEW_ALERTS: 'view:alerts',
  MANAGE_ALERTS: 'manage:alerts',
  VIEW_FLOW: 'view:flow',
  MANAGE_FLOW: 'manage:flow',
  SYSTEM_CONFIG: 'system:config',
  USER_MANAGE: 'user:manage'
}

// 错误代码映射
export const ERROR_CODES = {
  NETWORK_ERROR: 'NETWORK_ERROR',
  AUTH_FAILED: 'AUTH_FAILED',
  PERMISSION_DENIED: 'PERMISSION_DENIED',
  DATA_NOT_FOUND: 'DATA_NOT_FOUND',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  SERVER_ERROR: 'SERVER_ERROR'
}

// 日志级别
export const LOG_LEVELS = {
  DEBUG: 0,
  INFO: 1,
  WARN: 2,
  ERROR: 3
} as const

export type LogLevel = typeof LOG_LEVELS[keyof typeof LOG_LEVELS]