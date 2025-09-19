# {{PROJECT_NAME}}

A React + Vite project scaffolded with fe-scaffold-mcp-server.

## ✨ 特性

- ⚡️ React 18 + Vite - 快速开发体验
- 🎨 Ant Design - 企业级 UI 组件库
- 📱 响应式设计 - 适配各种屏幕尺寸
- 🛠️ TypeScript - 类型安全
- 🎯 ESLint + Prettier - 代码规范
- 🧪 Vitest - 单元测试
- 🎨 Tailwind CSS - 原子化 CSS
- 🔄 Mock 数据 - 开发阶段数据模拟
- 📦 按需导入 - 自动优化打包体积

## 🚀 快速开始

### 1. 安装依赖

```bash
npm install
```

### 2. 初始化 Git 仓库（可选）

如果您想使用 Git hooks 进行代码质量控制：

```bash
# 初始化 Git 仓库
git init

# 设置 Git hooks
npm run setup-hooks

# 添加远程仓库（可选）
git remote add origin <your-repo-url>
```

### 3. 启动开发服务器

```bash
npm run dev
```

### 4. 构建生产版本

```bash
npm run build
```

## 📝 可用脚本

| 脚本 | 描述 |
|------|------|
| `npm run dev` | 启动开发服务器 |
| `npm run build` | 构建生产版本 |
| `npm run preview` | 预览生产构建 |
| `npm run test` | 运行单元测试 |
| `npm run test:coverage` | 运行测试并生成覆盖率报告 |
| `npm run test:ui` | 启动测试 UI 界面 |
| `npm run lint` | 检查并修复代码规范 |
| `npm run lint:check` | 仅检查代码规范 |
| `npm run format` | 格式化代码 |
| `npm run format:check` | 检查代码格式 |
| `npm run lint:ls` | 检查文件名规范 |
| `npm run setup-hooks` | 设置 Git hooks |
| `npm run analyze` | 分析打包产物 |

## 🔧 项目结构

```
{{PROJECT_NAME}}/
├── src/
│   ├── components/     # 公共组件
│   ├── pages/         # 页面组件
│   ├── hooks/         # 自定义 Hooks
│   ├── utils/         # 工具函数
│   ├── assets/        # 静态资源
│   ├── styles/        # 样式文件
│   ├── App.tsx        # 根组件
│   └── main.tsx       # 入口文件
├── public/            # 公共资源
├── tests/             # 测试文件
└── dist/              # 构建输出（自动生成）
```

## 🎯 开发规范

### Git 提交规范

项目使用 [Conventional Commits](https://www.conventionalcommits.org/) 规范：

- `feat:` 新功能
- `fix:` 修复 bug
- `docs:` 文档变更
- `style:` 代码格式变更
- `refactor:` 重构
- `perf:` 性能优化
- `test:` 测试相关
- `chore:` 构建过程或辅助工具变动

### 代码规范

- 使用 ESLint + Prettier 进行代码规范检查
- 使用 TypeScript 进行类型检查
- 组件命名使用 PascalCase
- 文件命名使用 kebab-case

## 🔍 常见问题

### Q: npm install 时出现 "不是 git 仓库" 警告？

A: 这是正常现象。如果您需要使用 Git hooks，请按照上述步骤初始化 Git 仓库。

### Q: npm run dev 时出现 "getaddrinfo ENOTFOUND localhost" 错误？

A: 这是网络配置问题，请尝试以下解决方案：

1. **检查网络连接**：
   ```bash
   # 测试本地回环地址
   ping 127.0.0.1
   
   # 检查 hosts 文件
   cat /etc/hosts | grep localhost
   ```

2. **使用 IP 地址启动**：
   修改 `vite.config.ts` 中的 host 配置：
   ```typescript
   server: {
     host: "0.0.0.0", // 绑定所有网络接口
     port: 3000,
     open: true,
   }
   ```

3. **修复 hosts 文件**（需要管理员权限）：
   ```bash
   sudo echo "127.0.0.1 localhost" >> /etc/hosts
   ```

4. **清空 DNS 缓存**（macOS）：
   ```bash
   sudo dscacheutil -flushcache
   sudo killall -HUP mDNSResponder
   ```

### Q: 如何添加新的 UI 组件？

A: 项目已集成 Ant Design，您可以按需导入组件。参考 [Ant Design 文档](https://ant.design/)。

### Q: 如何配置 Mock 数据？

A: 在 `mock/` 目录下添加您的 mock 文件，开发服务器会自动加载。

### Q: 如何使用 React Hooks？

A: 在 `src/hooks/` 目录下创建自定义 Hooks，遵循 React Hooks 规范。

## 📄 许可证

MIT License