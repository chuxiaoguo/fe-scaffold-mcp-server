# 前端脚手架MCP服务器使用示例

## 🚀 快速开始

### 1. 创建Vue3项目脚手架

```json
{
  "projectName": "my-vue3-app",
  "framework": "vue3",
  "language": "typescript",
  "buildTool": "vite",
  "styleFramework": "tailwind",
  "features": ["eslint", "prettier", "testing", "mock", "bundle-analyzer"]
}
```

**使用create-scaffold工具**

### 2. 创建React项目脚手架

```json
{
  "projectName": "my-react-app", 
  "framework": "react",
  "language": "typescript",
  "buildTool": "vite",
  "styleFramework": "tailwind",
  "uiLibrary": "antd",
  "features": ["eslint", "prettier", "lint-staged", "commitlint", "testing", "mock"]
}
```

### 3. 创建企业级Vue2项目

```json
{
  "projectName": "legacy-vue-app",
  "framework": "vue2", 
  "language": "typescript",
  "buildTool": "webpack",
  "styleFramework": "sass",
  "uiLibrary": "element-ui",
  "features": ["eslint", "prettier", "lint-staged", "commitlint", "ls-lint", "testing", "mock", "bundle-analyzer"]
}
```

## 📋 工具使用指南

### list-templates 工具

列出所有支持的模板：
```json
{}
```

筛选Vue3框架的模板：
```json
{
  "framework": "vue3"
}
```

筛选Vite构建工具的模板：
```json
{
  "buildTool": "vite"
}
```

### validate-stack 工具

验证技术栈兼容性：
```json
{
  "framework": "vue3",
  "buildTool": "vite",
  "language": "typescript",
  "styleFramework": "tailwind",
  "uiLibrary": "element-plus",
  "testingFramework": "vitest",
  "mockSolution": "msw"
}
```

检查Vue2 + Webpack组合：
```json
{
  "framework": "vue2",
  "buildTool": "webpack",
  "language": "javascript",
  "styleFramework": "sass",
  "features": ["eslint", "prettier", "testing"]
}
```

## 🎯 典型使用场景

### 场景1: 快速原型开发
使用Vue3 + Vite + TypeScript的现代化配置快速搭建原型项目。

### 场景2: 企业级项目
使用Webpack + Jest + 完整代码质量工具链的稳定配置。

### 场景3: 遗留项目维护
使用Vue2兼容配置维护或升级现有项目。

### 场景4: 团队标准化
通过验证工具确保团队项目配置的一致性和最佳实践。

## 📊 功能特性对比

| 功能特性 | Vue3+Vite | Vue2+Vite | React+Vite | Webpack通用 |
|----------|-----------|-----------|------------|-------------|
| 开发速度 | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ |
| 稳定性 | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| 生态支持 | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| 学习成本 | ⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐ |

## 🔧 配置说明

### 自动选择规则

1. **UI组件库自动选择**:
   - Vue2 → Element UI
   - Vue3 → Element Plus  
   - React → Ant Design

2. **测试框架自动选择**:
   - Vite → Vitest
   - Webpack → Jest

3. **Mock方案自动选择**:
   - Vite → MSW
   - Webpack → webpack-dev-server proxy

4. **打包分析工具自动选择**:
   - Vite → rollup-plugin-visualizer
   - Webpack → webpack-bundle-analyzer

### 推荐配置组合

- **现代化开发**: Vue3 + Vite + TypeScript + Tailwind CSS
- **企业级稳定**: Vue3 + Webpack + TypeScript + Sass  
- **快速原型**: React + Vite + TypeScript + Tailwind CSS
- **遗留维护**: Vue2 + Vite + TypeScript + Element UI

## 🚨 注意事项

1. **兼容性检查**: 使用validate-stack工具验证配置兼容性
2. **版本依赖**: 自动管理依赖包版本，确保兼容性
3. **最佳实践**: 遵循各框架的官方推荐配置
4. **渐进升级**: 支持从旧技术栈向新技术栈的平滑迁移

## 📞 技术支持

如有问题，请查看项目README或提交GitHub Issues。