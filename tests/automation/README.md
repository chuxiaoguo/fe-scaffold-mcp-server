# 前端脚手架自动化测试框架

## 概述

这个自动化测试框架用于验证前端脚手架生成的模板项目是否可以正常运行。它包含两个主要组件：

1. **模板验证器 (Template Validator)** - 验证单个模板的完整性和可运行性
2. **集成测试器 (Integration Tester)** - 测试脚手架工具与模板的完整集成流程

## 功能特性

### 🔍 模板验证器 (template-validator.js)

- **项目结构验证**: 检查生成的项目是否包含所有必要文件
- **package.json 验证**: 验证脚本、依赖等配置正确性
- **依赖安装测试**: 自动安装 npm 依赖并检查是否成功
- **代码质量检查**: 运行 ESLint 等代码检查工具
- **单元测试执行**: 运行项目的测试套件
- **构建验证**: 执行项目构建并验证产物
- **超时控制**: 防止测试进程无限期运行
- **详细报告**: 生成 JSON 格式的测试报告

### 🔄 集成测试器 (integration-test.js)

- **端到端测试**: 从脚手架生成到项目验证的完整流程
- **多模板支持**: 同时测试 Vue3、Vue2、React 等多种模板
- **配置驱动**: 支持不同的框架、构建工具、语言组合
- **并行处理**: 可以同时测试多个项目配置
- **清理机制**: 自动清理测试过程中的临时文件

## 使用方法

### 运行模板验证器

```bash
# 验证所有模板
node tests/automation/template-validator.js

# 使用 npm 脚本运行
npm run test:templates
```

### 运行集成测试

```bash
# 完整的集成测试
node tests/automation/integration-test.js

# 使用 npm 脚本运行
npm run test:integration
```

### 一键运行所有测试

```bash
# 运行完整测试套件
npm run test:automation
```

## 测试配置

### 支持的模板组合

| 框架 | 构建工具 | 语言 | 样式方案 | 状态 |
|------|----------|------|----------|------|
| Vue3 | Vite | TypeScript | Tailwind CSS | ✅ |
| Vue3 | Vite | TypeScript | Sass | ✅ |
| Vue2 | Webpack | JavaScript | Sass | ✅ |
| React | Vite | TypeScript | Tailwind CSS | ✅ |

### 验证步骤

每个模板会经过以下验证步骤：

1. **生成项目** - 使用脚手架工具生成项目
2. **结构检查** - 验证项目文件结构完整性
3. **配置验证** - 检查 package.json 等配置文件
4. **依赖安装** - 运行 `npm install` 安装依赖
5. **代码检查** - 运行 `npm run lint` 进行代码质量检查
6. **单元测试** - 运行 `npm test` 执行测试套件
7. **项目构建** - 运行 `npm run build` 构建项目
8. **构建验证** - 检查构建产物是否正确生成

## 测试报告

### 报告格式

测试完成后会生成以下报告文件：

- `template-test-report.json` - 模板验证详细报告
- `integration-test-report.json` - 集成测试详细报告

### 报告内容

```json
{
  "timestamp": "2024-01-01T00:00:00.000Z",
  "summary": {
    "total": 3,
    "passed": 2,
    "failed": 1,
    "successRate": 66.7
  },
  "results": [
    {
      "template": "vue3-vite",
      "framework": "vue3",
      "buildTool": "vite",
      "language": "typescript",
      "success": true,
      "steps": {
        "generate": true,
        "structure": true,
        "packageJson": true,
        "install": true,
        "lint": true,
        "test": true,
        "build": true
      }
    }
  ]
}
```

## 配置选项

### 超时设置

```javascript
// 默认超时时间（毫秒）
const timeout = {
  install: 600000,    // 依赖安装: 10分钟
  build: 300000,      // 项目构建: 5分钟
  test: 180000,       // 测试运行: 3分钟
  lint: 120000        // 代码检查: 2分钟
}
```

### 测试环境

- **Node.js**: >= 16.x
- **npm**: >= 8.x
- **操作系统**: macOS, Linux, Windows
- **临时目录**: 使用系统临时目录存储测试项目

## 故障排除

### 常见问题

1. **依赖安装失败**
   - 检查网络连接
   - 清理 npm 缓存: `npm cache clean --force`
   - 尝试使用不同的 registry

2. **构建超时**
   - 增加超时时间配置
   - 检查系统资源使用情况
   - 确认构建工具版本兼容性

3. **测试失败**
   - 检查模板中的测试文件是否正确
   - 验证测试依赖是否完整
   - 查看详细错误日志

### 调试模式

启用详细日志输出：

```bash
DEBUG=true node tests/automation/template-validator.js
```

## 扩展指南

### 添加新模板测试

1. 在 `integration-test.js` 中添加新的测试用例
2. 配置对应的模板参数
3. 更新预期文件列表

### 自定义验证步骤

1. 继承 `TemplateValidator` 类
2. 重写或添加验证方法
3. 在测试流程中调用自定义验证

### 集成 CI/CD

```yaml
# GitHub Actions 示例
- name: Run Template Tests
  run: |
    npm install
    npm run test:automation
```

## 贡献

如果发现问题或有改进建议，请：

1. 提交 Issue 描述问题
2. 创建 Pull Request 提供解决方案
3. 更新测试用例覆盖新场景

## 许可证

MIT License