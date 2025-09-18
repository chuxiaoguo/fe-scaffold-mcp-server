import { Tool } from '@modelcontextprotocol/sdk/types.js';
import { ScaffoldOptions, CreateScaffoldParams } from '../types.js';
import { StackValidator } from '../utils/stackValidator.js';
import { ConfigGenerator } from '../generators/configGenerator.js';
import { TemplateGenerator } from '../generators/templateGenerator.js';
import { DependencyManager } from '../utils/dependencyManager.js';

/**
 * 预览配置工具
 */
export const previewConfigTool: Tool = {
  name: 'preview-config',
  description: '预览将要生成的项目配置文件和结构，不实际创建文件',
  inputSchema: {
    type: 'object',
    properties: {
      projectName: {
        type: 'string',
        description: '项目名称',
      },
      framework: {
        type: 'string',
        enum: ['vue3', 'vue2', 'react'],
        description: '前端框架',
      },
      language: {
        type: 'string',
        enum: ['javascript', 'typescript'],
        description: '开发语言，默认为typescript',
        default: 'typescript',
      },
      buildTool: {
        type: 'string',
        enum: ['vite', 'webpack'],
        description: '构建工具，默认为vite',
        default: 'vite',
      },
      styleFramework: {
        type: 'string',
        enum: ['tailwind', 'sass', 'less'],
        description: '样式方案，默认为tailwind',
        default: 'tailwind',
      },
      features: {
        type: 'array',
        items: {
          type: 'string',
          enum: [
            'eslint',
            'prettier',
            'lint-staged',
            'commitlint',
            'ls-lint',
            'testing',
            'mock',
            'bundle-analyzer'
          ],
        },
        description: '需要集成的功能特性',
        default: ['eslint', 'prettier', 'lint-staged', 'commitlint', 'ls-lint', 'testing', 'mock', 'bundle-analyzer'],
      },
      uiLibrary: {
        type: 'string',
        description: 'UI组件库，不指定则根据框架自动选择',
      },
      showFileContent: {
        type: 'boolean',
        description: '是否显示主要配置文件的内容',
        default: false,
      },
    },
    required: ['projectName', 'framework'],
  },
};

/**
 * 预览配置处理函数
 */
export async function handlePreviewConfig(params: CreateScaffoldParams & {
  showFileContent?: boolean;
}): Promise<string> {
  try {
    // 构建选项
    const options = buildScaffoldOptions(params);
    
    // 验证技术栈兼容性
    const validation = StackValidator.validate(options);
    
    // 自动修复配置
    const fixedOptions = StackValidator.autoFix(options);
    
    // 生成所有文件（仅内容，不写入磁盘）
    const configFiles = ConfigGenerator.generateAll(fixedOptions, params.projectName);
    const sourceFiles = TemplateGenerator.generateSourceFiles(fixedOptions, params.projectName);
    const { dependencies, devDependencies } = DependencyManager.getDependencies(fixedOptions);
    
    // 构建响应
    let response = `🔍 **项目配置预览**: ${params.projectName}\n\n`;
    
    // 技术栈配置
    response += `📋 **技术栈配置**\n`;
    response += `- 框架: ${fixedOptions.framework}\n`;
    response += `- 语言: ${fixedOptions.language}\n`;
    response += `- 构建工具: ${fixedOptions.buildTool}\n`;
    response += `- 样式方案: ${fixedOptions.styleFramework}\n`;
    response += `- UI组件库: ${fixedOptions.uiLibrary}\n`;
    response += `- 测试框架: ${fixedOptions.testing.framework}\n`;
    response += `- Mock方案: ${fixedOptions.testing.mockSolution}\n`;
    response += `- 打包分析: ${fixedOptions.bundleAnalyzer}\n\n`;
    
    // 验证结果
    if (!validation.isValid) {
      response += `❌ **配置问题**\n`;
      response += validation.errors.map(e => `- ${e}`).join('\n') + '\n\n';
    }
    
    if (validation.warnings.length > 0) {
      response += `⚠️ **警告信息**\n`;
      response += validation.warnings.map(w => `- ${w}`).join('\n') + '\n\n';
    }
    
    // 项目结构预览
    response += `📁 **项目结构预览**\n`;
    response += `${params.projectName}/\n`;
    response += `├── src/\n`;
    response += `│   ├── components/\n`;
    response += `│   │   └── HelloWorld.${fixedOptions.framework.startsWith('vue') ? 'vue' : (fixedOptions.language === 'typescript' ? 'tsx' : 'jsx')}\n`;
    response += `│   ├── views/\n`;
    response += `│   ├── utils/\n`;
    response += `│   ├── types/\n`;
    if (fixedOptions.testing.mockSolution === 'msw') {
      response += `│   ├── mocks/\n`;
      response += `│   │   ├── handlers.ts\n`;
      response += `│   │   └── browser.ts\n`;
    }
    response += `│   ├── App.${fixedOptions.framework.startsWith('vue') ? 'vue' : (fixedOptions.language === 'typescript' ? 'tsx' : 'jsx')}\n`;
    response += `│   ├── main.${fixedOptions.language === 'typescript' ? 'ts' : 'js'}\n`;
    response += `│   └── style.${fixedOptions.styleFramework === 'tailwind' ? 'css' : fixedOptions.styleFramework === 'sass' ? 'scss' : 'css'}\n`;
    response += `├── public/\n`;
    response += `│   └── favicon.svg\n`;
    response += `├── tests/\n`;
    response += `├── package.json\n`;
    
    // 配置文件列表
    configFiles.forEach(file => {
      response += `├── ${file.path}\n`;
    });
    
    response += `└── README.md\n\n`;
    
    // 依赖信息
    response += `📦 **依赖包信息**\n`;
    response += `生产依赖 (${dependencies.length}个):\n`;
    dependencies.slice(0, 5).forEach(dep => {
      response += `- ${dep.name}@${dep.version}\n`;
    });
    if (dependencies.length > 5) {
      response += `- ... 还有 ${dependencies.length - 5} 个依赖\n`;
    }
    
    response += `\n开发依赖 (${devDependencies.length}个):\n`;
    devDependencies.slice(0, 8).forEach(dep => {
      response += `- ${dep.name}@${dep.version}\n`;
    });
    if (devDependencies.length > 8) {
      response += `- ... 还有 ${devDependencies.length - 8} 个依赖\n`;
    }
    
    // Scripts预览
    const scripts = DependencyManager.generateScripts(fixedOptions);
    response += `\n⚡ **NPM Scripts**\n`;
    Object.entries(scripts).forEach(([name, command]) => {
      response += `- npm run ${name}: ${command}\n`;
    });
    
    // 文件内容预览
    if (params.showFileContent) {
      response += `\n📄 **主要配置文件内容**\n\n`;
      
      // package.json
      const packageJsonContent = generatePackageJsonPreview(fixedOptions, params.projectName, dependencies, devDependencies);
      response += `### package.json\n`;
      response += `\`\`\`json\n${packageJsonContent}\`\`\`\n\n`;
      
      // 主要配置文件
      const importantConfigs = configFiles.filter(file => 
        ['vite.config.ts', 'webpack.config.js', '.eslintrc.cjs', 'tailwind.config.js'].some(name => 
          file.path.includes(name)
        )
      );
      
      importantConfigs.slice(0, 2).forEach(file => {
        response += `### ${file.path}\n`;
        response += `\`\`\`${getFileLanguage(file.path)}\n${file.content}\`\`\`\n\n`;
      });
    }
    
    response += `💡 **下一步**\n`;
    response += `使用 \`create-scaffold\` 工具创建完整项目:\n`;
    response += `\`\`\`json\n`;
    const configExample = {
      projectName: params.projectName,
      framework: params.framework,
      language: params.language,
      buildTool: params.buildTool,
      styleFramework: params.styleFramework,
      features: params.features,
    };
    response += JSON.stringify(configExample, null, 2);
    response += `\n\`\`\``;
    
    return response;
  } catch (error) {
    return `❌ 预览配置失败: ${error instanceof Error ? error.message : String(error)}`;
  }
}

/**
 * 构建脚手架选项
 */
function buildScaffoldOptions(params: CreateScaffoldParams): ScaffoldOptions {
  const features = params.features || [
    'eslint', 'prettier', 'lint-staged', 'commitlint', 'ls-lint', 
    'testing', 'mock', 'bundle-analyzer'
  ];

  // 获取推荐配置
  const recommendations = StackValidator.getRecommendations(params.framework);

  const options: ScaffoldOptions = {
    framework: params.framework as ScaffoldOptions['framework'],
    language: (params.language || 'typescript') as ScaffoldOptions['language'],
    buildTool: (params.buildTool || 'vite') as ScaffoldOptions['buildTool'],
    styleFramework: (params.styleFramework || 'tailwind') as ScaffoldOptions['styleFramework'],
    uiLibrary: params.uiLibrary || recommendations.uiLibrary,
    qualityTools: {
      eslint: features.includes('eslint'),
      prettier: features.includes('prettier'),
      lintStaged: features.includes('lint-staged'),
      commitlint: features.includes('commitlint'),
      lsLint: features.includes('ls-lint'),
      husky: features.includes('lint-staged'), // husky 通常与 lint-staged 一起使用
      editorconfig: true, // EditorConfig 默认启用
    },
    testing: {
      framework: (params.buildTool || 'vite') === 'vite' ? 'vitest' : 'jest',
      mockSolution: features.includes('mock') ? 
        ((params.buildTool || 'vite') === 'vite' ? 'msw' : 'webpack-proxy') : 'msw',
    },
    bundleAnalyzer: features.includes('bundle-analyzer') ?
      ((params.buildTool || 'vite') === 'vite' ? 'rollup-plugin-visualizer' : 'webpack-bundle-analyzer') :
      'rollup-plugin-visualizer',
  };

  return options;
}

/**
 * 生成package.json预览
 */
function generatePackageJsonPreview(
  options: ScaffoldOptions,
  projectName: string,
  dependencies: any[],
  devDependencies: any[]
): string {
  const scripts = DependencyManager.generateScripts(options);
  
  const packageJson = {
    name: projectName,
    version: '0.1.0',
    description: `A ${options.framework} project`,
    type: 'module',
    scripts,
    dependencies: dependencies.slice(0, 3).reduce((acc, dep) => {
      acc[dep.name] = dep.version;
      return acc;
    }, {} as Record<string, string>),
    devDependencies: devDependencies.slice(0, 5).reduce((acc, dep) => {
      acc[dep.name] = dep.version;
      return acc;
    }, {} as Record<string, string>),
  };
  
  // 添加省略号表示还有更多
  if (dependencies.length > 3) {
    (packageJson.dependencies as any)['...'] = `还有 ${dependencies.length - 3} 个依赖`;
  }
  if (devDependencies.length > 5) {
    (packageJson.devDependencies as any)['...'] = `还有 ${devDependencies.length - 5} 个依赖`;
  }

  return JSON.stringify(packageJson, null, 2);
}

/**
 * 获取文件语言标识
 */
function getFileLanguage(filePath: string): string {
  if (filePath.endsWith('.ts')) return 'typescript';
  if (filePath.endsWith('.js')) return 'javascript';
  if (filePath.endsWith('.json')) return 'json';
  if (filePath.endsWith('.vue')) return 'vue';
  if (filePath.endsWith('.scss') || filePath.endsWith('.sass')) return 'scss';
  if (filePath.endsWith('.css')) return 'css';
  if (filePath.endsWith('.yml') || filePath.endsWith('.yaml')) return 'yaml';
  return 'text';
}