# 前端脚手架MCP服务器

一个基于 Model Context Protocol (MCP) 的前端项目脚手架生成服务，支持 Vue3/Vue2/React 等多种技术栈组合的自动化项目创建。

## 🚀 功能特性

### 支持的技术栈

#### 🏗️ 基础架构
- **前端框架**: Vue3 | Vue2 | React
- **开发语言**: JavaScript | TypeScript
- **构建工具**: Vite | Webpack

#### 🔧 代码质量工具
- **ESLint**: 代码语法检查和规范
- **Prettier**: 代码格式化
- **lint-staged**: Git暂存文件检查
- **commitlint**: Git提交信息规范检查
- **ls-lint**: 文件/目录命名规范检查

#### 🎨 样式解决方案
- **默认选择**: Tailwind CSS
- **可选方案**: Sass | Less

#### 🧪 测试工具
- **Vite项目**: Vitest
- **Webpack项目**: Jest

#### 🎭 Mock方案
- **Vite项目**: MSW (Mock Service Worker) | vite-plugin-mock
- **Webpack项目**: webpack-dev-server proxy | mocker-api

#### 📊 打包分析工具
- **Vite项目**: rollup-plugin-visualizer
- **Webpack项目**: webpack-bundle-analyzer

#### 🎯 UI组件库
- **Vue2**: Element UI
- **Vue3**: Element Plus
- **React**: Ant Design

## 📦 安装

```bash
# 克隆项目
git clone <repository-url>
cd fe-scaffold-mcp-server

# 安装依赖
npm install

# 构建项目
npm run build

# 启动服务
npm start
```

## 🛠️ MCP工具

### 1. create-scaffold
创建前端项目脚手架

**参数**:
- `projectName` (必需): 项目名称
- `framework` (必需): 前端框架 (vue3/vue2/react)
- `language`: 开发语言 (javascript/typescript)，默认 typescript
- `buildTool`: 构建工具 (vite/webpack)，默认 vite
- `styleFramework`: 样式方案 (tailwind/sass/less)，默认 tailwind
- `features`: 功能特性数组
- `uiLibrary`: UI组件库，不指定则自动选择

**示例**:
```json
{
  "projectName": "my-vue-app",
  "framework": "vue3",
  "language": "typescript",
  "buildTool": "vite",
  "styleFramework": "tailwind",
  "features": ["eslint", "prettier", "testing", "mock"]
}
```

### 2. list-templates
列出所有支持的技术栈模板

**参数**:
- `framework`: 筛选特定框架 (可选)
- `buildTool`: 筛选特定构建工具 (可选)

### 3. validate-stack
验证技术栈组合的兼容性

**参数**:
- `framework` (必需): 前端框架
- `buildTool` (必需): 构建工具
- `language`: 开发语言
- `styleFramework`: 样式方案
- `uiLibrary`: UI组件库
- `features`: 功能特性
- `testingFramework`: 测试框架
- `mockSolution`: Mock方案

### 4. preview-config
预览将要生成的项目配置文件和结构

**参数**:
- `projectName` (必需): 项目名称
- `framework` (必需): 前端框架
- `language`: 开发语言，默认 typescript
- `buildTool`: 构建工具，默认 vite
- `styleFramework`: 样式方案，默认 tailwind
- `features`: 功能特性数组
- `uiLibrary`: UI组件库
- `showFileContent`: 是否显示配置文件内容，默认 false

**示例**:
```json
{
  "projectName": "my-preview",
  "framework": "vue3",
  "showFileContent": true
}
```

## 🎯 预设模板

### Vue3 现代化模板
- Vue3 + Vite + TypeScript + Tailwind CSS + Element Plus
- 集成 Vitest + MSW + 完整代码质量工具链

### Vue2 遗留项目模板
- Vue2 + Vite + TypeScript + Tailwind CSS + Element UI
- 适用于维护遗留项目或渐进式升级

### React 现代化模板
- React + Vite + TypeScript + Tailwind CSS + Ant Design
- 集成 Vitest + MSW + React Testing Library

### 企业级模板
- 支持 Webpack + Sass + Jest 的稳定配置
- 适用于大型企业级项目

## 🔧 智能特性

### 自动推荐
- 根据框架自动选择最佳UI组件库
- 根据构建工具自动选择测试框架和Mock方案
- 智能版本依赖管理

### 兼容性验证
- 技术栈组合兼容性检查
- 自动修复不兼容配置
- 最佳实践建议

### 配置生成
- 自动生成完整的配置文件
- 智能的package.json scripts
- 统一的代码质量工具配置

### 实际文件生成
- **完整项目结构**: 创建完整的项目目录和文件
- **源代码模板**: 自动生成框架对应的源代码文件
- **配置文件**: 生成所有必要的配置文件
- **测试文件**: 包含示例测试用例
- **项目验证**: 自动验证生成的项目结构

## 📋 生成的项目结构

```
my-project/
├── src/
│   ├── components/     # 组件
│   ├── views/          # 页面
│   ├── utils/          # 工具函数
│   ├── types/          # 类型定义 (TypeScript)
│   ├── mocks/          # Mock数据 (MSW)
│   └── main.ts         # 入口文件
├── public/             # 静态资源
├── tests/              # 测试文件
├── .eslintrc.js        # ESLint配置
├── .prettierrc         # Prettier配置
├── commitlint.config.js # Commitlint配置
├── .ls-lint.yml        # ls-lint配置
├── tailwind.config.js  # Tailwind配置 (如果选择)
├── vite.config.ts      # Vite配置 (如果选择)
├── vitest.config.ts    # Vitest配置 (如果选择)
├── package.json        # 项目配置
├── tsconfig.json       # TypeScript配置
├── .gitignore          # Git忽略文件
├── .npmrc              # npm配置
└── README.md           # 项目文档
```

## 🤝 在MCP客户端中使用

### Claude Desktop配置

在 `~/AppData/Roaming/Claude/claude_desktop_config.json` 中添加:

```json
{
  "mcpServers": {
    "fe-scaffold": {
      "command": "node",
      "args": ["path/to/fe-scaffold-mcp-server/dist/index.js"]
    }
  }
}
```

### VS Code with MCP扩展

安装MCP扩展并配置服务器路径。

## 🧪 开发

```bash
# 开发模式
npm run dev

# 类型检查
npm run type-check

# 代码检查
npm run lint

# 修复代码问题
npm run lint:fix
```

## 📄 许可证

MIT License

## 🤝 贡献

欢迎提交 Issues 和 Pull Requests！

## 📞 支持

如有问题，请在 GitHub Issues 中提出。