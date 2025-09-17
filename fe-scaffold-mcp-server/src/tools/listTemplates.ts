import { Tool } from '@modelcontextprotocol/sdk/types.js';
import { StackTemplate, PackageVersion } from '../types.js';
import { StackValidator } from '../utils/stackValidator.js';

/**
 * 列出模板工具
 */
export const listTemplatesTool: Tool = {
  name: 'list-templates',
  description: '列出所有支持的技术栈模板组合',
  inputSchema: {
    type: 'object',
    properties: {
      framework: {
        type: 'string',
        enum: ['vue3', 'vue2', 'react'],
        description: '筛选特定框架的模板',
      },
      buildTool: {
        type: 'string',
        enum: ['vite', 'webpack'],
        description: '筛选特定构建工具的模板',
      },
    },
  },
};

/**
 * 预定义的技术栈模板
 */
const STACK_TEMPLATES: StackTemplate[] = [
  {
    id: 'vue3-vite-modern',
    name: 'Vue3 + Vite + TypeScript (现代化)',
    description: '使用Vue3、Vite、TypeScript的现代化Vue开发栈，适合新项目',
    category: 'official' as const,
    complexity: 'standard' as const,
    framework: 'vue3',
    buildTool: 'vite',
    defaultOptions: {
      language: 'typescript',
      styleFramework: 'tailwind',
      uiLibrary: 'element-plus',
      qualityTools: {
        eslint: true,
        prettier: true,
        lintStaged: true,
        commitlint: true,
        lsLint: true,
        husky: true,
        editorconfig: true,
      },
      testing: {
        framework: 'vitest',
        mockSolution: 'msw',
      },
      bundleAnalyzer: 'rollup-plugin-visualizer',
    },
    supportedFeatures: [
      'TypeScript支持',
      'Element Plus UI组件库',
      'Tailwind CSS',
      'Vitest单元测试',
      'MSW API模拟',
      '完整的代码质量工具链',
      'Rollup打包分析',
    ],
    requiredFeatures: ['eslint', 'prettier'],
    incompatibleFeatures: [],
    tags: ['vue3', 'vite', 'typescript', 'modern'],
    version: '1.0.0' as PackageVersion,
    author: 'FE Scaffold Generator',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },
  {
    id: 'vue3-webpack-enterprise',
    name: 'Vue3 + Webpack + TypeScript (企业级)',
    description: '适用于企业级项目的Vue3 + Webpack配置，稳定可靠',
    category: 'official' as const,
    complexity: 'enterprise' as const,
    framework: 'vue3',
    buildTool: 'webpack',
    defaultOptions: {
      language: 'typescript',
      styleFramework: 'sass',
      uiLibrary: 'element-plus',
      qualityTools: {
        eslint: true,
        prettier: true,
        lintStaged: true,
        commitlint: true,
        lsLint: true,
        husky: true,
        editorconfig: true,
      },
      testing: {
        framework: 'jest',
        mockSolution: 'webpack-proxy',
      },
      bundleAnalyzer: 'webpack-bundle-analyzer',
    },
    supportedFeatures: [
      'TypeScript支持',
      'Element Plus UI组件库',
      'Sass样式预处理',
      'Jest单元测试',
      'Webpack代理Mock',
      '完整的代码质量工具链',
      'Webpack打包分析',
    ],
    requiredFeatures: ['eslint', 'prettier'],
    incompatibleFeatures: [],
    tags: ['vue3', 'webpack', 'typescript', 'enterprise'],
    version: '1.0.0' as PackageVersion,
    author: 'FE Scaffold Generator',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },
  {
    id: 'vue2-legacy',
    name: 'Vue2 + Vite + TypeScript (遗留项目)',
    description: '用于维护Vue2遗留项目或渐进式升级的配置',
    category: 'community' as const,
    complexity: 'standard' as const,
    framework: 'vue2',
    buildTool: 'vite',
    defaultOptions: {
      language: 'typescript',
      styleFramework: 'tailwind',
      uiLibrary: 'element-ui',
      qualityTools: {
        eslint: true,
        prettier: true,
        lintStaged: true,
        commitlint: true,
        lsLint: true,
        husky: true,
        editorconfig: true,
      },
      testing: {
        framework: 'vitest',
        mockSolution: 'vite-plugin-mock',
      },
      bundleAnalyzer: 'rollup-plugin-visualizer',
    },
    supportedFeatures: [
      'Vue2兼容性',
      'Element UI组件库',
      'Tailwind CSS',
      'Vitest单元测试',
      'Vite Mock插件',
      '现代化开发工具',
    ],
    requiredFeatures: ['eslint'],
    incompatibleFeatures: ['element-plus'],
    tags: ['vue2', 'vite', 'typescript', 'legacy'],
    version: '1.0.0' as PackageVersion,
    author: 'FE Scaffold Generator',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },
  {
    id: 'react-vite-modern',
    name: 'React + Vite + TypeScript (现代化)',
    description: '使用React、Vite、TypeScript的现代化React开发栈',
    category: 'official' as const,
    complexity: 'standard' as const,
    framework: 'react',
    buildTool: 'vite',
    defaultOptions: {
      language: 'typescript',
      styleFramework: 'tailwind',
      uiLibrary: 'antd',
      qualityTools: {
        eslint: true,
        prettier: true,
        lintStaged: true,
        commitlint: true,
        lsLint: true,
        husky: true,
        editorconfig: true,
      },
      testing: {
        framework: 'vitest',
        mockSolution: 'msw',
      },
      bundleAnalyzer: 'rollup-plugin-visualizer',
    },
    supportedFeatures: [
      'React 18支持',
      'Ant Design组件库',
      'Tailwind CSS',
      'Vitest + React Testing Library',
      'MSW API模拟',
      '完整的代码质量工具链',
    ],
    requiredFeatures: ['eslint', 'prettier'],
    incompatibleFeatures: ['element-ui', 'element-plus'],
    tags: ['react', 'vite', 'typescript', 'modern'],
    version: '1.0.0' as PackageVersion,
    author: 'FE Scaffold Generator',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },
  {
    id: 'react-webpack-cra-like',
    name: 'React + Webpack + TypeScript (CRA风格)',
    description: '类似Create React App的配置，适合传统React项目',
    category: 'community' as const,
    complexity: 'standard' as const,
    framework: 'react',
    buildTool: 'webpack',
    defaultOptions: {
      language: 'typescript',
      styleFramework: 'sass',
      uiLibrary: 'antd',
      qualityTools: {
        eslint: true,
        prettier: true,
        lintStaged: true,
        commitlint: true,
        lsLint: true,
        husky: true,
        editorconfig: true,
      },
      testing: {
        framework: 'jest',
        mockSolution: 'msw',
      },
      bundleAnalyzer: 'webpack-bundle-analyzer',
    },
    supportedFeatures: [
      'React 18支持',
      'Ant Design组件库',
      'Sass样式预处理',
      'Jest + React Testing Library',
      'MSW API模拟',
      'Webpack打包分析',
    ],
    requiredFeatures: ['eslint', 'prettier'],
    incompatibleFeatures: ['element-ui', 'element-plus'],
    tags: ['react', 'webpack', 'typescript', 'cra'],
    version: '1.0.0' as PackageVersion,
    author: 'FE Scaffold Generator',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },
];

/**
 * 列出模板处理函数
 */
export async function handleListTemplates(params: {
  framework?: string;
  buildTool?: string;
}): Promise<string> {
  try {
    let templates = STACK_TEMPLATES;

    // 根据参数筛选
    if (params.framework) {
      templates = templates.filter(t => t.framework === params.framework);
    }
    if (params.buildTool) {
      templates = templates.filter(t => t.buildTool === params.buildTool);
    }

    if (templates.length === 0) {
      return '❌ 没有找到匹配的模板';
    }

    let response = `📋 **支持的技术栈模板** (共${templates.length}个)\n\n`;

    templates.forEach((template, index) => {
      response += `## ${index + 1}. ${template.name}\n`;
      response += `**ID**: \`${template.id}\`\n`;
      response += `**描述**: ${template.description}\n`;
      response += `**技术栈**: ${template.framework} + ${template.buildTool}\n`;
      response += `**默认配置**:\n`;
      response += `- 语言: ${template.defaultOptions.language}\n`;
      response += `- 样式: ${template.defaultOptions.styleFramework}\n`;
      response += `- UI库: ${template.defaultOptions.uiLibrary}\n`;
      response += `- 测试: ${template.defaultOptions.testing?.framework}\n`;
      response += `- Mock: ${template.defaultOptions.testing?.mockSolution}\n`;
      
      response += `**支持特性**:\n`;
      template.supportedFeatures.forEach(feature => {
        response += `- ${feature}\n`;
      });
      
      response += '\n---\n\n';
    });

    response += `💡 **使用方法**\n`;
    response += `使用 \`create-scaffold\` 工具创建项目，参考以下示例:\n\n`;
    response += `\`\`\`json\n`;
    response += `{\n`;
    response += `  "projectName": "my-project",\n`;
    response += `  "framework": "vue3",\n`;
    response += `  "buildTool": "vite",\n`;
    response += `  "language": "typescript"\n`;
    response += `}\n`;
    response += `\`\`\`\n\n`;

    // 添加推荐组合
    response += `🎯 **推荐组合**\n`;
    ['vue3', 'vue2', 'react'].forEach(framework => {
      const recommendation = StackValidator.getRecommendations(framework);
      if (recommendation.framework) {
        response += `- **${framework.toUpperCase()}**: ${recommendation.buildTool} + ${recommendation.language} + ${recommendation.styleFramework}\n`;
      }
    });

    return response;
  } catch (error) {
    return `❌ 获取模板列表失败: ${error instanceof Error ? error.message : String(error)}`;
  }
}

/**
 * 根据ID获取模板
 */
export function getTemplateById(id: string): StackTemplate | undefined {
  return STACK_TEMPLATES.find(template => template.id === id);
}

/**
 * 获取所有模板
 */
export function getAllTemplates(): StackTemplate[] {
  return [...STACK_TEMPLATES];
}