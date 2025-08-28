# 技术设计文档 (Tech Design)

## 项目概述

### 技术栈
- **前端框架**：Vue 3 (Composition API)
- **编程语言**：TypeScript
- **构建工具**：Vite
- **UI组件库**：Element Plus
- **流程图组件**：Vue Flow
- **样式预处理**：SCSS
- **状态管理**：Pinia
- **HTTP客户端**：Axios

## 系统架构

### 整体架构图
```
┌─────────────────────────────────────────┐
│                 前端应用                 │
├─────────────────┬───────────────────────┤
│   主界面组件     │      弹窗组件          │
│  (AlertTable)   │   (FlowDiagram)       │
├─────────────────┼───────────────────────┤
│   Element Plus  │     Vue Flow          │
├─────────────────┴───────────────────────┤
│            Vue 3 + TypeScript           │
├─────────────────────────────────────────┤
│                 Vite                    │
└─────────────────────────────────────────┘
```

### 目录结构
```
flow-demo/
├── public/
│   └── favicon.ico
├── src/
│   ├── components/           # 公共组件
│   │   ├── AlertTable.vue   # 告警表格组件
│   │   ├── FlowDiagram.vue  # 流程图组件
│   │   └── BlinkLight.vue   # 闪烁灯光组件
│   ├── views/               # 页面组件
│   │   └── Dashboard.vue    # 主仪表板页面
│   ├── stores/              # 状态管理
│   │   ├── alert.ts         # 告警状态管理
│   │   └── flow.ts          # 流程图状态管理
│   ├── types/               # TypeScript类型定义
│   │   ├── alert.ts         # 告警相关类型
│   │   └── flow.ts          # 流程图相关类型
│   ├── utils/               # 工具函数
│   │   ├── api.ts           # API接口
│   │   └── constants.ts     # 常量定义
│   ├── styles/              # 样式文件
│   │   ├── global.scss      # 全局样式
│   │   ├── variables.scss   # 样式变量
│   │   └── themes/          # 主题样式
│   │       └── dark.scss    # 暗色主题
│   ├── App.vue              # 根组件
│   ├── main.ts              # 应用入口
│   └── vite-env.d.ts        # Vite类型声明
├── package.json
├── vite.config.ts
├── tsconfig.json
└── README.md
```

## 核心组件设计

### 1. AlertTable 组件

#### 功能描述
主要的告警表格展示组件，负责渲染机构和告警项的矩阵表格。

#### 组件结构
```typescript
interface AlertTableProps {
  data: AlertData[]
  loading?: boolean
}

interface AlertData {
  institutionName: string
  alerts: Record<string, AlertStatus>
}

type AlertStatus = 'normal' | 'warning'
```

#### 关键特性
- 使用 `el-table` 作为基础表格组件
- 自定义单元格渲染，集成 `BlinkLight` 组件
- 支持主题列的点击事件处理
- 响应式布局适配

### 2. BlinkLight 组件

#### 功能描述
可配置的闪烁灯光组件，支持不同颜色和闪烁模式。

#### 组件接口
```typescript
interface BlinkLightProps {
  status: 'normal' | 'warning'
  clickable?: boolean
  size?: 'small' | 'medium' | 'large'
}
```

#### 动画实现
- 使用 CSS keyframes 实现呼吸灯效果
- 支持暂停/恢复动画
- 提供点击反馈效果

### 3. FlowDiagram 组件

#### 功能描述
基于 Vue Flow 的流程图组件，展示层级化的指标关系。

#### 技术实现
```typescript
import { VueFlow, Panel, Controls, MiniMap } from '@vue-flow/core'
import { Background } from '@vue-flow/background'

interface FlowNode {
  id: string
  type: 'institution' | 'theme' | 'kpi' | 'process'
  data: {
    label: string
    status: AlertStatus
    value?: string
    target?: string
  }
  position: { x: number; y: number }
}

interface FlowEdge {
  id: string
  source: string
  target: string
  type: 'smoothstep'
}
```

#### 布局算法
- 采用层次化布局算法
- 自动计算节点位置
- 支持手动调整和拖拽

## 数据流设计

### 状态管理架构

#### Alert Store
```typescript
// stores/alert.ts
export const useAlertStore = defineStore('alert', () => {
  const alertData = ref<AlertData[]>([])
  const loading = ref(false)
  const selectedInstitution = ref<string>('')
  
  const fetchAlertData = async () => {
    loading.value = true
    try {
      const response = await api.getAlertData()
      alertData.value = response.data
    } catch (error) {
      console.error('Failed to fetch alert data:', error)
    } finally {
      loading.value = false
    }
  }
  
  const openFlowDiagram = (institutionName: string) => {
    selectedInstitution.value = institutionName
  }
  
  return {
    alertData,
    loading,
    selectedInstitution,
    fetchAlertData,
    openFlowDiagram
  }
})
```

#### Flow Store
```typescript
// stores/flow.ts
export const useFlowStore = defineStore('flow', () => {
  const nodes = ref<FlowNode[]>([])
  const edges = ref<FlowEdge[]>([])
  const visible = ref(false)
  
  const generateFlowData = (institutionData: InstitutionFlowData) => {
    // 生成节点和边的算法
    const { generatedNodes, generatedEdges } = layoutAlgorithm(institutionData)
    nodes.value = generatedNodes
    edges.value = generatedEdges
  }
  
  return {
    nodes,
    edges,
    visible,
    generateFlowData
  }
})
```

### API接口设计

```typescript
// utils/api.ts
export const api = {
  // 获取告警数据
  getAlertData: (): Promise<ApiResponse<AlertData[]>> => {
    return axios.get('/api/alerts')
  },
  
  // 获取机构流程图数据
  getInstitutionFlow: (institutionName: string): Promise<ApiResponse<InstitutionFlowData>> => {
    return axios.get(`/api/institutions/${institutionName}/flow`)
  },
  
  // 实时数据订阅（WebSocket）
  subscribeRealTimeData: (callback: (data: AlertData[]) => void) => {
    const ws = new WebSocket('/ws/alerts')
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data)
      callback(data)
    }
    return ws
  }
}
```

## 样式主题设计

### 暗色主题配置

```scss
// styles/themes/dark.scss
:root {
  // 主色调
  --primary-color: #409eff;
  --success-color: #67c23a;
  --warning-color: #e6a23c;
  --danger-color: #f56c6c;
  --info-color: #909399;
  
  // 背景色
  --bg-color-primary: #1a1a1a;
  --bg-color-secondary: #2d2d2d;
  --bg-color-tertiary: #3a3a3a;
  
  // 文字色
  --text-color-primary: #e4e7ed;
  --text-color-regular: #cfcfcf;
  --text-color-secondary: #a8abb2;
  
  // 边框色
  --border-color: #4c4d4f;
  --border-color-light: #414243;
  
  // 告警灯颜色
  --light-normal: #67c23a;
  --light-warning: #f56c6c;
  --light-shadow-normal: rgba(103, 194, 58, 0.3);
  --light-shadow-warning: rgba(245, 108, 108, 0.3);
}

// 全局暗色主题样式
body {
  background-color: var(--bg-color-primary);
  color: var(--text-color-primary);
}

// Element Plus 组件主题覆盖
.el-table {
  --el-table-bg-color: var(--bg-color-secondary);
  --el-table-header-bg-color: var(--bg-color-tertiary);
  --el-table-row-hover-bg-color: rgba(64, 158, 255, 0.1);
}
```

### 闪烁动画样式

```scss
// 呼吸灯动画
@keyframes blink-pulse {
  0%, 100% {
    opacity: 1;
    transform: scale(1);
    box-shadow: 0 0 10px var(--shadow-color);
  }
  50% {
    opacity: 0.6;
    transform: scale(1.1);
    box-shadow: 0 0 20px var(--shadow-color);
  }
}

.blink-light {
  width: 16px;
  height: 16px;
  border-radius: 50%;
  cursor: pointer;
  transition: all 0.3s ease;
  animation: blink-pulse 2s infinite;
  
  &.normal {
    background-color: var(--light-normal);
    --shadow-color: var(--light-shadow-normal);
  }
  
  &.warning {
    background-color: var(--light-warning);
    --shadow-color: var(--light-shadow-warning);
  }
  
  &.clickable:hover {
    transform: scale(1.2);
    animation-duration: 1s;
  }
}
```

## 性能优化策略

### 1. 组件优化
- 使用 `defineAsyncComponent` 懒加载大型组件
- 实现虚拟滚动处理大量数据
- 使用 `v-memo` 优化列表渲染

### 2. 数据优化
- 实现数据缓存机制
- 使用防抖处理频繁更新
- 采用增量更新减少重渲染

### 3. 构建优化
- 代码分割和按需加载
- 资源压缩和缓存策略
- CDN加速静态资源

## 测试策略

### 单元测试
- 使用 Vitest 进行组件单元测试
- 覆盖关键业务逻辑
- Mock API接口和外部依赖

### 集成测试
- 使用 Cypress 进行端到端测试
- 测试用户交互流程
- 验证数据流转正确性

### 性能测试
- 使用 Lighthouse 分析性能指标
- 监控内存使用情况
- 测试大数据量下的响应速度

## 部署配置

### 开发环境
```typescript
// vite.config.ts
export default defineConfig({
  plugins: [vue()],
  server: {
    port: 3000,
    host: '0.0.0.0',
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true
      }
    }
  }
})
```

### 生产环境
```typescript
export default defineConfig({
  plugins: [vue()],
  build: {
    outDir: 'dist',
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['vue', 'element-plus'],
          flow: ['@vue-flow/core']
        }
      }
    }
  }
})
```

## 安全考虑

### 1. 数据安全
- API接口鉴权
- 敏感数据加密传输
- XSS防护

### 2. 访问控制
- 用户权限验证
- 路由访问控制
- 操作日志记录

## 扩展性设计

### 1. 插件化架构
- 支持自定义告警项
- 可配置的流程图节点类型
- 主题插件系统

### 2. 国际化支持
- 多语言配置
- 时区处理
- 本地化数据格式

### 3. 移动端适配
- 响应式布局
- 触摸手势支持
- 移动端优化交互

## 技术风险评估

### 高风险项
1. Vue Flow 组件的性能表现
2. 实时数据更新的稳定性
3. 大量动画对性能的影响

### 缓解措施
1. 实现组件性能监控
2. 添加数据更新失败重试机制
3. 提供动画开关选项

## 开发计划

### 第一阶段（2周）
- 项目初始化和基础架构搭建
- 核心组件开发
- 基础样式和主题实现

### 第二阶段（2周）
- 数据集成和API对接
- 交互功能完善
- 性能优化

### 第三阶段（1周）
- 测试和调试
- 部署和上线准备
- 文档完善