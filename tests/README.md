# 测试系统说明

本文档说明了fe-scaffold-mcp-server项目的完整测试系统，包括如何运行测试和理解测试结果。

## 测试概览

项目包含多层次的测试系统，确保生成的前端项目能够正常工作：

### 1. 模板完整性测试 (`test:template-integrity`)

验证所有模板文件的完整性和一致性：

- ✅ **占位符定义完整性**: 确保所有使用的占位符都在有效列表中
- ✅ **依赖变量映射**: 验证package.json中的依赖占位符格式正确
- ✅ **模板文件格式**: 检查所有模板文件的结构和格式
- ✅ **配置文件完整性**: 确保所有必需的配置文件都存在
- ✅ **跨模板一致性**: 验证不同模板间公共字段的一致性

```bash
npm run test:template-integrity
```

### 2. 项目生命周期测试 (`test:lifecycle`)

测试从项目生成到运行的完整流程：

- 📦 **项目生成测试**: 验证能够正确生成项目结构
- 📥 **依赖安装测试**: 确保`npm install`能够成功
- 🏗️ **构建测试**: 验证`npm run build`能够成功
- 🚀 **开发服务器测试**: 确保`npm run dev`能够启动
- 🔍 **代码质量测试**: 运行lint、type-check等质量检查
- 🧪 **单元测试**: 执行项目的测试用例
- 🔧 **模板变量测试**: 确保所有占位符都被正确替换
- ⚙️ **配置文件测试**: 验证生成的配置文件格式正确

```bash
npm run test:lifecycle
```

### 3. 完整测试套件 (`test:full`)

运行所有测试用例并生成综合报告：

```bash
npm run test:full
```

### 4. CI/CD集成测试 (`test:ci`)

用于持续集成环境的完整验证：

```bash
npm run test:ci
```

## 快速开始

### 运行所有测试

```bash
# 运行完整测试套件
npm run test:full

# 仅运行快速测试
npm run test:template-integrity

# 运行深度集成测试
npm run test:lifecycle
```

### 查看测试报告

测试完成后会生成 `test-report.json` 文件，包含详细的测试结果：

```json
{
  "timestamp": "2025-09-19T10:30:00.000Z",
  "duration": 45000,
  "summary": {
    "total": 2,
    "passed": 2,
    "failed": 0,
    "success_rate": "100.0"
  },
  "suites": [
    {
      "name": "模板完整性测试",
      "success": true,
      "duration": 5000,
      "error": null
    },
    {
      "name": "项目生命周期测试", 
      "success": true,
      "duration": 40000,
      "error": null
    }
  ]
}
```

## 测试失败排查

### 常见问题和解决方案

#### 1. 依赖安装失败
- **症状**: `npm install` 失败，提示包名无效
- **原因**: 模板中存在未替换的占位符
- **解决**: 检查 `templateCustomizer.ts` 中的占位符替换逻辑

#### 2. 构建失败
- **症状**: `npm run build` 报错
- **原因**: 配置文件中存在错误的引用或依赖
- **解决**: 检查 vite.config.ts、webpack.config.js 等配置文件

#### 3. 开发服务器启动失败
- **症状**: `npm run dev` 无法启动
- **原因**: 端口冲突或配置错误
- **解决**: 检查服务器配置和端口设置

#### 4. 模板完整性失败
- **症状**: 占位符检查或文件完整性检查失败
- **原因**: 模板文件缺失或格式错误
- **解决**: 检查模板目录结构和文件内容

## 自定义测试

### 添加新的测试用例

1. 在 `tests/integration/` 目录下创建新的测试文件
2. 使用 `.cjs` 扩展名（因为项目使用ES模块）
3. 在 `run-tests.cjs` 中注册新的测试套件

### 修改现有测试

测试配置在以下文件中：

- `tests/integration/template-integrity-test.cjs` - 模板完整性测试
- `tests/integration/project-lifecycle-test.cjs` - 生命周期测试
- `tests/integration/run-tests.cjs` - 测试运行器

## CI/CD集成

项目包含 GitHub Actions 工作流 (`.github/workflows/test.yml`)，会自动运行测试：

- **触发条件**: Push到main/develop分支，Pull Request，定时任务
- **测试矩阵**: 多操作系统 (Ubuntu, Windows, macOS) × 多Node.js版本
- **测试步骤**: 类型检查 → 代码检查 → 构建 → 模板测试 → 生命周期测试

## 性能基准

| 测试类型 | 预期耗时 | 资源消耗 |
|---------|---------|---------|
| 模板完整性测试 | < 10秒 | 低 |
| 项目生命周期测试 | 1-3分钟 | 中等 |
| 完整测试套件 | 2-5分钟 | 中等 |

## 贡献指南

在提交代码前，请确保：

1. 所有测试通过: `npm run test:ci`
2. 代码符合规范: `npm run lint`
3. 类型检查通过: `npm run type-check`
4. 构建成功: `npm run build`

## 故障排除

如果遇到测试相关问题，请：

1. 查看测试输出的详细错误信息
2. 检查 `test-report.json` 文件
3. 运行单个测试用例来定位问题
4. 查看项目的Issues页面寻找类似问题

---

通过这套完整的测试系统，我们可以确保fe-scaffold-mcp-server生成的项目始终保持高质量和可用性。