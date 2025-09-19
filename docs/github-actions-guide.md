# 🚀 GitHub Actions CI/CD 配置说明

本文档介绍了项目中集成的GitHub Actions工作流程，包括自动化发布、E2E测试、代码覆盖率报告和Changelog生成。

## 📋 工作流程概览

### 1. 🚀 自动化发布流程 (`.github/workflows/release.yml`)

**触发条件:**
- 推送到 `main` 分支且修改了 `src/`、`package.json` 或 `scripts/` 目录
- 手动触发 (支持指定发布类型)

**功能特性:**
- 🔍 智能检测是否需要发布 (避免重复发布)
- 📊 代码质量检查 (TypeScript、ESLint)
- 🧪 运行自动化测试
- 📈 生成代码覆盖率报告
- 🏷️ 自动版本管理和Git标签
- 📦 发布到NPM
- 🎉 创建GitHub Release
- 💬 生成发布说明

**使用方法:**
```bash
# 自动发布 (根据提交信息确定版本类型)
git push origin main

# 手动发布
# 在GitHub仓库页面 Actions -> 自动化发布流程 -> Run workflow
# 选择发布类型: patch/minor/major
```

### 2. 🧪 生成项目E2E测试 (`.github/workflows/e2e-tests.yml`)

**触发条件:**
- 推送到 `main` 或 `develop` 分支且修改了 `src/` 或 `templates/` 目录
- Pull Request 到 `main` 分支
- 每天早上8点定时运行
- 手动触发 (支持指定测试模板)

**测试覆盖:**
- 🌐 多平台: Ubuntu, Windows, macOS
- 🛠️ 多框架: Vue3, Vue2, React
- ⚡ 多构建工具: Vite, Webpack
- 📝 多语言: TypeScript, JavaScript

**测试内容:**
- ✅ 项目生成功能
- 📁 项目结构验证
- 📦 依赖安装测试
- 🔍 代码检查和类型检查
- 🏗️ 项目构建测试
- 🖥️ 开发服务器启动测试
- ⚡ 性能基准测试

### 3. 📝 自动生成Changelog (`.github/workflows/changelog.yml`)

**触发条件:**
- 自动化发布流程完成后
- 手动触发

**功能特性:**
- 📊 智能分类提交类型 (feat, fix, docs, etc.)
- 📈 生成版本统计信息
- 🔗 添加提交链接和作者信息
- 📛 更新README徽章
- 📋 生成发布摘要

**提交信息规范:**
```bash
feat: 添加新功能
fix: 修复bug
docs: 更新文档
style: 代码格式调整
refactor: 重构代码
test: 添加测试
chore: 其他改进
ci: CI/CD改进
perf: 性能优化
```

### 4. 📊 代码覆盖率报告 (`.github/workflows/coverage.yml`)

**触发条件:**
- 推送到 `main` 或 `develop` 分支且修改了 `src/` 或 `tests/` 目录
- Pull Request 到 `main` 分支
- 手动触发

**功能特性:**
- 📈 多环境覆盖率测试
- 🎯 覆盖率阈值检查 (行≥75%, 函数≥75%, 分支≥65%, 语句≥75%)
- 📊 生成详细的覆盖率报告
- 📛 生成覆盖率徽章
- 💬 在PR中自动评论覆盖率报告
- 🔗 上传到Codecov

## 📦 新增的npm脚本

项目添加了以下新的npm脚本:

```json
{
  "scripts": {
    "test:coverage": "c8 --reporter=lcov --reporter=text --reporter=json-summary npm run test:automation",
    "test:performance": "tsx tests/performance/benchmark.ts",
    "docs:generate": "typedoc src/index.ts --out docs/api --excludePrivate",
    "changelog:generate": "conventional-changelog -p angular -i CHANGELOG.md -s"
  }
}
```

## 🔧 配置文件

### 代码覆盖率配置 (`.c8rc.json`)
- 设置覆盖率阈值
- 配置包含/排除文件
- 指定报告格式

### 性能基准测试 (`tests/performance/benchmark.ts`)
- 测试项目生成性能
- 测试构建性能
- 生成性能报告

## 🎯 质量门禁

每个工作流程都包含质量检查:

### 代码质量
- ✅ TypeScript 类型检查
- ✅ ESLint 代码规范检查
- ✅ 项目构建验证

### 测试覆盖率
- ✅ 最低覆盖率要求
- ✅ 多环境验证
- ✅ 趋势分析

### E2E测试
- ✅ 多平台兼容性
- ✅ 生成项目完整性
- ✅ 性能基准验证

## 🔑 需要的GitHub Secrets

为了完整使用所有功能，需要在GitHub仓库设置中添加以下Secrets:

### 必需的Secrets
- `NPM_TOKEN` - NPM发布令牌
  ```bash
  # 生成NPM令牌
  npm login
  npm token create --access=public
  ```

### 可选的Secrets
- `CODECOV_TOKEN` - Codecov上传令牌 (可选，公开仓库不需要)

## 📈 使用建议

### 1. 发布流程
- 使用语义化提交信息
- 在 `main` 分支进行发布
- 确保所有测试通过后再发布

### 2. 代码覆盖率
- 保持覆盖率在阈值以上
- 为新功能添加相应测试
- 定期检查覆盖率趋势

### 3. E2E测试
- 添加新模板时确保E2E测试通过
- 关注不同平台的兼容性
- 监控性能基准变化

### 4. 文档维护
- 提交遵循约定式提交规范
- 及时更新CHANGELOG
- 保持README和文档同步

## 🐛 故障排除

### 常见问题

**1. 发布失败**
- 检查NPM_TOKEN是否正确配置
- 确保版本号没有冲突
- 检查代码质量是否通过

**2. E2E测试失败**
- 检查模板文件是否正确
- 验证依赖安装过程
- 查看具体的错误日志

**3. 覆盖率低于阈值**
- 添加缺失的测试用例
- 检查测试配置是否正确
- 分析覆盖率报告找出未覆盖的代码

## 📞 获取帮助

如果遇到问题，可以:
1. 查看GitHub Actions的详细日志
2. 检查相关配置文件
3. 查看本文档的故障排除部分
4. 提交Issue描述具体问题

---

*此文档随着CI/CD流程的改进会持续更新* 🚀