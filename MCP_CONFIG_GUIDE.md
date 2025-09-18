# MCP 配置测试指南

## 问题解决

你遇到的错误 `could not determine executable to run` 已经在版本 **1.0.2** 中修复。

新的路径解析问题（`no such file or directory`）已在版本 **1.0.3** 中修复。

最新的测试报告和模板完整性验证在版本 **1.0.5** 中完成。

**新的模板路径解析问题**已在版本 **1.0.6** 中修复，现在支持npm包环境下的正确路径解析。

## 正确的 MCP 配置

更新后的配置应该可以正常工作：

```json
{
  "mcpServers": {
    "fe-scaffold": {
      "command": "npx",
      "args": [
        "-y",
        "fe-scaffold-mcp-server@1.0.6"
      ]
    }
  }
}
```

## 修复内容

在版本 1.0.6 中，我们包含了以下改进：

1. **模板路径解析**: 使用包安装路径而非当前工作目录
2. **项目创建安全性**: 防止在系统目录创建项目
3. **缺失配置文件**: 添加了 `tailwind.config.cjs` 配置文件
4. **测试报告更新**: 最新的集成测试和模板验证报告
5. **代码质量**: ESLint 警告修复和代码优化
6. **动态路径解析**: 根据环境（开发/npm包）自动选择正确的模板路径
7. **调试支持**: 添加详细的路径解析调试信息

## 测试方法

你可以通过以下命令测试包是否正常工作：

```bash
# 直接运行（应该启动 MCP 服务器）
npx fe-scaffold-mcp-server@1.0.6

# 或者使用 -y 参数自动确认
npx -y fe-scaffold-mcp-server@1.0.6
```

如果成功，你应该看到类似这样的输出：
```
前端脚手架MCP服务器已启动
支持的工具: create-scaffold, list-templates, validate-stack, preview-config
```

## 可用的 MCP 工具

一旦配置成功，你可以使用以下工具：

1. **create-scaffold**: 创建前端项目脚手架
2. **list-templates**: 列出支持的技术栈模板
3. **validate-stack**: 验证技术栈组合兼容性
4. **preview-config**: 预览项目配置文件

## 支持的技术栈

- **框架**: Vue3, Vue2, React
- **语言**: TypeScript, JavaScript  
- **构建工具**: Vite, Webpack
- **样式**: Tailwind CSS, Sass, Less
- **UI库**: Element Plus, Element UI, Ant Design
- **测试**: Vitest, Jest
- **Mock**: MSW, vite-plugin-mock

## 故障排除

如果仍然遇到问题：

1. 清除 npx 缓存：`npx clear-npx-cache`
2. 使用最新版本：`npx -y fe-scaffold-mcp-server@latest`
3. 检查 Node.js 版本：需要 >= 18.0.0

## 示例使用

配置成功后，你可以在支持 MCP 的客户端中使用：

```
请帮我创建一个 Vue3 + TypeScript + Vite + Tailwind CSS 的项目
```

这将自动调用 create-scaffold 工具生成完整的项目结构。