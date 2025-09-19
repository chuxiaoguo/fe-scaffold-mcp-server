# 核心方法详解

## 服务器核心 (server.ts)

### FeScaffoldServer 类

#### constructor()
- **功能**: 初始化MCP服务器实例
- **操作**: 
  - 创建Server实例，配置name、version和capabilities
  - 调用setupToolHandlers()设置工具处理器
  - 调用setupErrorHandling()设置错误处理

#### setupToolHandlers()
- **功能**: 注册MCP工具的请求处理器
- **操作**:
  - 注册ListToolsRequestSchema处理器，返回可用工具列表
  - 注册CallToolRequestSchema处理器，分发工具调用到对应handler

#### start()
- **功能**: 启动MCP服务器
- **操作**: 创建StdioServerTransport并连接服务器

## 工具处理器

### createScaffold 工具

#### handleCreateScaffold(params)
- **功能**: 创建前端项目脚手架
- **流程**:
  1. buildScaffoldOptions() - 构建配置选项
  2. StackValidator.autoFix() - 自动修复配置
  3. StackValidator.validate() - 验证兼容性
  4. resolveProjectPathAndName() - 解析路径名称
  5. ProjectGenerator.generateProject() - 生成项目
  6. 返回详细的创建报告

#### buildScaffoldOptions(params)
- **功能**: 从用户参数构建完整的ScaffoldOptions
- **操作**: 设置默认值、处理features数组、构建qualityTools配置

### validateStack 工具

#### handleValidateStack(params)
- **功能**: 验证技术栈组合的兼容性
- **流程**:
  1. buildOptionsFromParams() - 构建选项
  2. StackValidator.validate() - 执行验证
  3. StackValidator.getRecommendations() - 获取推荐
  4. calculateCompatibilityScore() - 计算评分
  5. 生成详细验证报告

## 验证器 (StackValidator)

#### validate(options)
- **功能**: 验证技术栈配置的兼容性
- **检查项**:
  - validateFrameworkBuildTool() - 框架与构建工具
  - validateUILibrary() - UI组件库兼容性
  - validateTestingFramework() - 测试框架兼容性
  - validateMockSolution() - Mock方案兼容性

#### autoFix(options)
- **功能**: 自动修复不兼容的配置
- **修复规则**:
  - Vite项目使用Vitest，Webpack项目使用Jest
  - 根据构建工具选择对应的bundle analyzer
  - 根据框架选择默认UI组件库

## 依赖管理器 (DependencyManager)

#### getDependencies(options)
- **功能**: 根据配置生成项目依赖列表
- **处理顺序**:
  1. 基础框架依赖 (Vue/React)
  2. 构建工具依赖 (Vite/Webpack)
  3. TypeScript依赖
  4. 代码质量工具依赖
  5. 样式框架依赖
  6. UI组件库依赖
  7. 测试和Mock依赖

#### generateScripts(options)
- **功能**: 生成package.json中的scripts字段
- **生成脚本**:
  - dev/build/preview (基于构建工具)
  - test相关脚本 (基于测试框架)
  - lint/format脚本 (基于代码质量工具)

## 项目生成器 (ProjectGenerator)

#### generateProject(options, projectName, outputPath)
- **功能**: 生成完整的前端项目
- **步骤**:
  1. TemplateCopier.copyTemplate() - 复制基础模板
  2. TemplateCopier.copySharedConfigs() - 复制共享配置
  3. TemplateCustomizer.customizeTemplate() - 定制模板
  4. 收集成功/失败文件列表

#### validateProject(projectPath, options)
- **功能**: 验证生成项目的完整性
- **检查**: 必需文件存在性、配置文件完整性

## 模板复制器 (TemplateCopier)

#### copyTemplate(options, targetPath)
- **功能**: 复制基础框架模板到目标目录
- **操作**:
  1. getTemplateName() - 确定模板名称
  2. copyDirectory() - 递归复制目录
  3. processFileName() - 处理文件名 (移除_前缀)

#### copySharedConfigs(options, targetPath)
- **功能**: 复制共享配置文件
- **选择逻辑**: 根据框架、样式方案、测试框架等选择对应配置

## 模板定制器 (TemplateCustomizer)

#### customizeTemplate(targetPath, options, projectName)
- **功能**: 根据配置定制模板文件
- **步骤**:
  1. customizePackageJson() - 更新package.json
  2. replacePlaceholders() - 替换占位符
  3. addOptionalFiles() - 添加可选文件

#### customizePackageJson(targetPath, options, projectName)
- **功能**: 定制package.json文件
- **操作**:
  - 更新项目名称
  - 合并dependencies和devDependencies
  - 更新scripts字段
  - 设置keywords

#### replacePlaceholders(targetPath, options, projectName)
- **功能**: 替换模板文件中的占位符
- **占位符**:
  - {{PROJECT_NAME}} - 项目名称
  - {{FRAMEWORK}} - 框架名称
  - {{BUILD_TOOL}} - 构建工具
  - {{UI_LIBRARY}} - UI组件库

## 文件工具 (FileUtils)

#### writeFiles(outputDir, files)
- **功能**: 批量写入文件到指定目录
- **特性**: 
  - 自动创建目录结构
  - 错误隔离 (单个文件失败不影响其他)
  - 返回成功/失败统计

#### ensureDir(dirPath)
- **功能**: 确保目录存在
- **操作**: 检查访问权限，不存在则递归创建

## 核心算法

### 技术栈兼容性验证算法
```
验证流程:
1. 检查框架与构建工具组合
2. 验证UI组件库与框架兼容性
3. 检查测试框架与构建工具匹配
4. 验证Mock方案的适用性
5. 汇总错误和警告信息
```

### 依赖解析算法
```
解析流程:
1. 基础框架依赖 → 确定核心运行时
2. 构建工具依赖 → 确定开发工具链
3. 特性依赖 → 根据用户选择添加功能
4. 去重和版本管理 → 避免冲突
```

### 模板处理算法
```
处理流程:
1. 模板选择 → 基于framework+buildTool
2. 文件复制 → 保持目录结构
3. 配置注入 → 根据选项添加配置
4. 内容替换 → 占位符动态替换
5. 依赖更新 → 同步package.json
```