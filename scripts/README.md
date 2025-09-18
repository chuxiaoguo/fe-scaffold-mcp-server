# 发布脚本使用指南

## 概述

这个发布脚本 (`scripts/release.ts`) 是一个全自动化的发布工具，用于执行代码校验、打包和发布到 NPM 等操作。

## 功能特性

### 🔍 完整的质量检查
- **Git 状态检查**: 确保没有未提交的更改
- **TypeScript 类型检查**: 运行 `npm run type-check`
- **ESLint 代码检查**: 运行 `npm run lint`
- **自动化测试**: 运行 `npm run test:automation`
- **项目构建**: 运行 `npm run build`

### 📦 版本管理
- **自动版本计算**: 支持 patch/minor/major 版本自动递增
- **自定义版本**: 支持指定特定版本号
- **版本回滚**: 发布失败时自动回滚版本号

### 🚀 发布流程
- **Git 提交和标签**: 自动创建发布提交和版本标签
- **NPM 发布**: 发布到 NPM 仓库
- **远程推送**: 推送代码和标签到远程仓库
- **发布报告**: 显示详细的发布结果

### 🛡️ 安全特性
- **试运行模式**: 支持 `--dry-run` 模式预览发布流程
- **NPM 认证检查**: 确保已登录 NPM
- **错误恢复**: 发布失败时自动回滚

## 使用方法

### 基本命令

```bash
# 发布补丁版本 (1.0.0 → 1.0.1)
npm run release:patch

# 发布次要版本 (1.0.0 → 1.1.0)
npm run release:minor

# 发布主要版本 (1.0.0 → 2.0.0)
npm run release:major

# 发布指定版本
npm run release -- --version 2.1.0

# 试运行模式 (不实际发布)
npm run release:dry-run
```

### 高级选项

```bash
# 跳过测试的发布
npm run release -- --skip-tests

# 发布到 beta 标签
npm run release -- --tag beta

# 组合选项
npm run release -- --minor --skip-tests --tag beta
```

### 完整参数列表

| 参数 | 说明 | 默认值 |
|------|------|--------|
| `--patch` | 发布补丁版本 | ✅ (默认) |
| `--minor` | 发布次要版本 | |
| `--major` | 发布主要版本 | |
| `--version <版本号>` | 指定自定义版本号 | |
| `--skip-tests` | 跳过自动化测试 | |
| `--dry-run` | 试运行模式，不实际发布 | |
| `--tag <标签>` | NPM 发布标签 | `latest` |
| `--help`, `-h` | 显示帮助信息 | |

## 发布前准备

### 1. 环境检查

确保开发环境准备就绪：

```bash
# 检查 Node.js 版本 (需要 >= 18.0.0)
node --version

# 检查 NPM 版本
npm --version

# 确保已登录 NPM
npm whoami
```

### 2. 代码准备

```bash
# 确保所有更改已提交
git status

# 确保在主分支上
git branch

# 拉取最新代码
git pull origin main
```

### 3. 质量检查

可以手动运行质量检查确保一切正常：

```bash
# 类型检查
npm run type-check

# 代码检查
npm run lint

# 自动化测试
npm run test:automation

# 构建检查
npm run build
```

## 发布流程详解

发布脚本按以下顺序执行：

1. **📋 参数解析**: 解析命令行参数，确定发布类型和选项
2. **🔍 Git 状态检查**: 确保工作目录干净，没有未提交的更改
3. **🔐 NPM 认证检查**: 确保已登录 NPM (非试运行模式)
4. **📝 代码质量检查**: 运行 TypeScript 检查和 ESLint
5. **🧪 自动化测试**: 运行完整的测试套件 (可跳过)
6. **🏗️ 项目构建**: 编译 TypeScript 并验证构建产物
7. **🔢 版本更新**: 更新 package.json 中的版本号
8. **📝 Git 提交**: 创建发布提交和版本标签
9. **📦 NPM 发布**: 发布包到 NPM 仓库
10. **📤 远程推送**: 推送代码和标签到远程仓库
11. **🧹 清理工作**: 执行发布后清理任务
12. **📊 发布报告**: 显示发布结果摘要

## 错误处理

### 常见错误及解决方案

#### 1. Git 状态错误

```
❌ 发布失败: 存在未提交的更改，请先提交或暂存
```

**解决方案**:
```bash
# 提交所有更改
git add .
git commit -m "feat: 完成功能开发"

# 或者暂存更改
git stash
```

#### 2. NPM 认证错误

```
❌ 发布失败: 请先登录NPM: npm login
```

**解决方案**:
```bash
npm login
```

#### 3. 测试失败

```
❌ 发布失败: 测试失败，请修复后重试
```

**解决方案**:
```bash
# 手动运行测试查看详细错误
npm run test:automation

# 修复测试问题后重新发布
# 或者跳过测试发布 (不推荐)
npm run release -- --skip-tests
```

#### 4. 构建失败

```
❌ 发布失败: 构建失败：找不到dist目录
```

**解决方案**:
```bash
# 手动运行构建查看详细错误
npm run build

# 检查 TypeScript 配置
npm run type-check
```

## 最佳实践

### 1. 发布前检查清单

- [ ] 所有功能开发和测试完成
- [ ] 代码已经过 Code Review
- [ ] 所有测试通过
- [ ] 文档已更新
- [ ] CHANGELOG 已更新 (如果有)
- [ ] 在主分支上
- [ ] 本地代码与远程同步

### 2. 版本选择建议

- **补丁版本 (patch)**: 修复 bug，不改变 API
- **次要版本 (minor)**: 新增功能，向下兼容
- **主要版本 (major)**: 破坏性更改，不向下兼容

### 3. 试运行建议

首次使用或重要发布前，建议先运行试运行模式：

```bash
npm run release:dry-run
```

### 4. 标签使用

- `latest`: 稳定版本 (默认)
- `beta`: 测试版本
- `alpha`: 开发版本
- `next`: 下一个版本

```bash
# 发布测试版本
npm run release -- --tag beta
```

## 故障排除

### 回滚版本

如果发布出现问题，脚本会自动回滚 package.json，但你可能需要手动清理：

```bash
# 删除错误的标签
git tag -d v1.0.1
git push origin --delete v1.0.1

# 回滚到上一个提交
git reset --hard HEAD~1
```

### 重新发布

如果需要重新发布相同版本：

```bash
# 删除 NPM 上的版本 (24小时内)
npm unpublish package-name@1.0.1

# 重新发布
npm run release:patch
```

## 脚本开发

如果需要修改发布脚本，参考以下信息：

### 脚本结构

```
scripts/release.ts
├── ReleaseManager 类
│   ├── 参数解析
│   ├── Git 操作
│   ├── NPM 操作
│   ├── 构建流程
│   └── 错误处理
```

### 扩展脚本

可以通过以下方式扩展脚本功能：

1. 添加新的命令行参数
2. 扩展质量检查步骤
3. 添加发布通知功能
4. 集成 CI/CD 流程

### 调试模式

```bash
# 启用详细日志输出
DEBUG=true npm run release:dry-run
```

## 支持与反馈

如果遇到问题或有改进建议：

1. 查看脚本输出的详细错误信息
2. 确认环境配置正确
3. 提交 Issue 或 Pull Request

## 更新日志

- **v1.0.0**: 初始版本，支持基本发布流程
- 更多更新请查看 Git 提交历史