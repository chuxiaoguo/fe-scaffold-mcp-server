# fe-scaffold-mcp-server 技术文档目录

本目录包含了 fe-scaffold-mcp-server 项目的完整技术文档，基于 index.ts 入口文件进行依赖关系分析生成。

## 文档列表

### 1. [技术文档总览](./technical-documentation.md)
- **内容**: 项目架构图、核心模块详解、技术方案讲解
- **适用对象**: 新加入团队的开发者、架构师
- **关键信息**: 
  - MCP协议集成方案
  - 模块化架构设计
  - 核心算法说明
  - 性能优化策略

### 2. [依赖关系树状图](./dependency-tree.md)
- **内容**: 从 index.ts 开始的完整依赖关系树
- **适用对象**: 需要理解模块间关系的开发者
- **关键信息**:
  - 主入口依赖树
  - 各模块详细依赖关系
  - 数据流向图
  - 模块间通信模式

### 3. [核心方法详解](./methods-documentation.md)
- **内容**: 每个核心类和方法的功能说明
- **适用对象**: 进行代码维护和功能开发的程序员
- **关键信息**:
  - 方法功能描述
  - 参数和返回值
  - 核心算法流程
  - 实现细节

## 项目结构概览

```
fe-scaffold-mcp-server/
├── src/
│   ├── index.ts                    # 🚀 入口文件
│   ├── server.ts                   # 🖥️ MCP服务器主逻辑
│   ├── types.ts                    # 📝 TypeScript类型定义
│   ├── tools/                      # 🔧 MCP工具集合
│   │   ├── createScaffold.ts       # 📦 创建脚手架工具
│   │   ├── listTemplates.ts        # 📋 列出模板工具
│   │   ├── validateStack.ts        # ✅ 验证技术栈工具
│   │   └── previewConfig.ts        # 👀 预览配置工具
│   ├── utils/                      # 🛠️ 工具类
│   │   ├── stackValidator.ts       # 🔍 技术栈验证器
│   │   ├── dependencyManager.ts    # 📦 依赖管理器
│   │   └── fileUtils.ts           # 📁 文件操作工具
│   └── generators/                 # ⚙️ 项目生成器
│       ├── projectGenerator.ts     # 🏗️ 项目生成器主类
│       ├── templateCopier.ts       # 📋 模板复制器
│       └── templateCustomizer.ts   # 🎨 模板定制器
├── templates/                      # 📚 项目模板
└── docs/                          # 📖 技术文档 (本目录)
```

## 核心概念

### MCP (Model Context Protocol)
- 用于AI模型与工具交互的标准协议
- 本项目通过MCP提供前端脚手架生成服务
- 支持工具注册、参数验证、错误处理

### 技术栈支持
- **框架**: Vue3, Vue2, React
- **构建工具**: Vite, Webpack  
- **语言**: TypeScript, JavaScript
- **样式方案**: Tailwind CSS, Sass, Less
- **UI组件库**: Element Plus, Element UI, Ant Design

### 核心功能
1. **create-scaffold**: 创建项目脚手架
2. **list-templates**: 列出可用模板
3. **validate-stack**: 验证技术栈兼容性
4. **preview-config**: 预览项目配置

## 快速开始

### 开发环境搭建
```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建项目
npm run build
```

### 使用MCP工具
```bash
# 通过npx使用
npx @your-org/fe-scaffold-mcp-server

# 作为MCP服务器
node dist/index.js
```

## 贡献指南

### 添加新功能
1. 在相应目录创建新文件
2. 更新类型定义 (types.ts)
3. 添加单元测试
4. 更新文档

### 代码规范
- 使用TypeScript严格模式
- 遵循ESLint规范
- 添加JSDoc注释
- 保持函数单一职责

## 问题反馈

如果在使用过程中遇到问题或有改进建议，请：
1. 查阅相关技术文档
2. 检查GitHub Issues
3. 提交新的Issue或PR

---

*文档生成时间: 2024-01-20*  
*基于项目版本: 1.0.0*  
*生成工具: 代码依赖分析器*