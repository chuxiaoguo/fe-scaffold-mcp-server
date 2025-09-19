# 项目依赖关系树状图

## 主入口依赖树

```
index.ts
└── server.js
    ├── @modelcontextprotocol/sdk/server/index.js
    ├── @modelcontextprotocol/sdk/server/stdio.js
    ├── @modelcontextprotocol/sdk/types.js
    ├── tools/createScaffold.js
    ├── tools/listTemplates.js
    ├── tools/validateStack.js
    └── tools/previewConfig.js
```

## Tools 模块依赖关系

### createScaffold.ts
```
createScaffold.ts
├── @modelcontextprotocol/sdk/types.js → Tool
├── types.js → ScaffoldOptions, CreateScaffoldParams
├── utils/stackValidator.js → StackValidator
├── generators/projectGenerator.js → ProjectGenerator
├── path → resolve, join, isAbsolute
└── fs → existsSync

方法详解:
├── handleCreateScaffold() - 主处理函数
├── buildScaffoldOptions() - 构建配置选项
├── resolveProjectPathAndName() - 解析路径和名称
├── findValidWorkspace() - 查找有效工作空间
└── getTemplateDefaultName() - 获取模板默认名称
```

### listTemplates.ts
```
listTemplates.ts
├── @modelcontextprotocol/sdk/types.js → Tool
├── types.js → StackTemplate, PackageVersion
└── utils/stackValidator.js → StackValidator

方法详解:
├── handleListTemplates() - 主处理函数
├── getTemplateById() - 根据ID获取模板
└── getAllTemplates() - 获取所有模板
```

### validateStack.ts
```
validateStack.ts
├── @modelcontextprotocol/sdk/types.js → Tool
├── types.js → ValidateStackParams, ScaffoldOptions
└── utils/stackValidator.js → StackValidator

方法详解:
├── handleValidateStack() - 主处理函数
├── buildOptionsFromParams() - 从参数构建选项
├── getBestPractices() - 获取最佳实践建议
├── calculateCompatibilityScore() - 计算兼容性评分
└── getScoreDescription() - 获取评分描述
```

### previewConfig.ts
```
previewConfig.ts
├── @modelcontextprotocol/sdk/types.js → Tool
├── types.js → ScaffoldOptions, CreateScaffoldParams
├── utils/stackValidator.js → StackValidator
└── utils/dependencyManager.js → DependencyManager

方法详解:
├── handlePreviewConfig() - 主处理函数
├── generateProjectStructure() - 生成项目结构
├── buildScaffoldOptions() - 构建脚手架选项
└── getDefaultProjectName() - 获取默认项目名称
```

## Utils 模块依赖关系

### stackValidator.ts
```
stackValidator.ts
└── types.js → ScaffoldOptions

类: StackValidator
├── validate() - 验证技术栈兼容性
│   ├── validateFrameworkBuildTool() - 验证框架构建工具
│   ├── validateUILibrary() - 验证UI组件库
│   ├── validateTestingFramework() - 验证测试框架
│   ├── validateMockSolution() - 验证Mock方案
│   ├── validateStyleFramework() - 验证样式框架
│   └── validateBundleAnalyzer() - 验证打包分析工具
├── getRecommendations() - 获取推荐配置
└── autoFix() - 自动修复配置
```

### dependencyManager.ts
```
dependencyManager.ts
└── types.js → DependencyInfo, ScaffoldOptions, DependencyType, etc.

类: DependencyManager
├── getDependencies() - 获取项目依赖
└── generateScripts() - 生成package.json脚本

依赖矩阵配置:
├── frameworks (vue3, vue2, react)
├── buildTools (vite, webpack)
├── qualityTools (eslint, prettier, etc.)
├── styleFrameworks (tailwind, sass, less)
├── uiLibraries (element-ui, element-plus, antd)
├── testing (vitest, jest)
├── mock (msw, vite-plugin-mock, etc.)
└── bundleAnalyzer (rollup-plugin-visualizer, webpack-bundle-analyzer)
```

### fileUtils.ts
```
fileUtils.ts
├── fs/promises → promises as fs
├── path → dirname, join
└── types.js → GeneratedFile

类: FileUtils
├── ensureDir() - 确保目录存在
├── writeFile() - 写入文件
├── writeFiles() - 批量写入文件
├── fileExists() - 检查文件存在
├── readFile() - 读取文件
└── copyFile() - 复制文件
```

## Generators 模块依赖关系

### projectGenerator.ts
```
projectGenerator.ts
├── types.js → ScaffoldOptions
├── templateCopier.js → TemplateCopier
├── templateCustomizer.js → TemplateCustomizer
├── utils/fileUtils.js → FileUtils
└── path → resolve

类: ProjectGenerator
├── generateProject() - 生成完整项目
├── generateProjectStats() - 生成项目统计
└── validateProject() - 验证项目生成结果
```

### templateCopier.ts
```
templateCopier.ts
├── fs/promises → promises as fs
├── path → join, dirname, resolve
├── url → fileURLToPath
└── types.js → ScaffoldOptions

类: TemplateCopier
├── copyTemplate() - 复制基础模板
├── copySharedConfigs() - 复制共享配置
├── getTemplateName() - 获取模板名称
├── copyDirectory() - 递归复制目录
├── copyFile() - 复制单个文件
├── processFileName() - 处理文件名
├── getRelativePath() - 获取相对路径
├── copyConfigFiles() - 复制配置文件
├── getConfigFilesForFramework() - 获取框架配置文件
└── addMockFiles() - 添加Mock文件
```

### templateCustomizer.ts
```
templateCustomizer.ts
├── fs/promises → promises as fs
├── path → join
├── types.js → ScaffoldOptions
└── utils/dependencyManager.js → DependencyManager

类: TemplateCustomizer
├── customizeTemplate() - 定制模板文件
├── customizePackageJson() - 定制package.json
├── replacePlaceholders() - 替换占位符
├── replaceInDirectory() - 目录中递归替换
├── replaceInFile() - 文件中替换
├── addOptionalFiles() - 添加可选文件
├── getOptionalFiles() - 获取可选文件列表
└── getRelativePath() - 获取相对路径
```

## 核心数据流

```
用户请求 → MCP Server → Tool Handler → Business Logic
    ↓
ScaffoldOptions ← StackValidator ← CreateScaffoldParams
    ↓
ProjectGenerator → TemplateCopier + TemplateCustomizer
    ↓
FileUtils ← DependencyManager → Templates
    ↓
生成的项目文件
```

## 模块间通信模式

1. **工具注册模式**: server.ts 注册所有MCP工具
2. **配置驱动模式**: 所有操作基于ScaffoldOptions配置
3. **管道模式**: 文件生成通过复制→定制→写入的管道流程
4. **策略模式**: 根据框架类型选择不同的处理策略
5. **工厂模式**: DependencyManager根据配置生成依赖列表