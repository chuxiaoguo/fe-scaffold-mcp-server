import { ScaffoldOptions, GeneratedFile, GeneratorContext } from '../types.js';
import { ConfigGenerator } from './configGenerator.js';
import { TemplateGenerator } from './templateGenerator.js';
import { FileUtils } from '../utils/fileUtils.js';
import { DependencyManager } from '../utils/dependencyManager.js';

/**
 * 项目生成器 - 统一管理项目创建
 */
export class ProjectGenerator {
  /**
   * 生成完整项目
   */
  static async generateProject(
    options: ScaffoldOptions,
    projectName: string,
    outputPath?: string
  ): Promise<{
    projectPath: string;
    files: GeneratedFile[];
    success: string[];
    failed: { file: string; error: string }[];
  }> {
    // 确定输出路径
    const projectPath = outputPath || `./${projectName}`;

    // 生成所有文件
    const files = await this.generateAllFiles(options, projectName);

    // 创建项目目录结构
    await this.createProjectStructure(projectPath, options);

    // 写入文件到磁盘
    const writeResult = await FileUtils.writeFiles(projectPath, files);

    return {
      projectPath,
      files,
      ...writeResult,
    };
  }

  /**
   * 生成所有文件内容
   */
  private static async generateAllFiles(
    options: ScaffoldOptions,
    projectName: string
  ): Promise<GeneratedFile[]> {
    const files: GeneratedFile[] = [];

    // 1. 生成配置文件
    const configFiles = ConfigGenerator.generateAll(options, projectName);
    files.push(...configFiles);

    // 2. 生成package.json
    const packageJsonFile = this.generatePackageJson(options, projectName);
    files.push(packageJsonFile);

    // 3. 生成项目源文件模板
    const sourceFiles = TemplateGenerator.generateSourceFiles(options, projectName);
    files.push(...sourceFiles);

    // 4. 生成额外的项目文件
    const extraFiles = this.generateExtraFiles(options);
    files.push(...extraFiles);

    return files;
  }

  /**
   * 生成package.json
   */
  private static generatePackageJson(
    options: ScaffoldOptions,
    projectName: string
  ): GeneratedFile {
    const { dependencies, devDependencies } = DependencyManager.getDependencies(options);
    const scripts = DependencyManager.generateScripts(options);

    const packageJson = {
      name: projectName,
      version: '0.1.0',
      description: `A ${options.framework} project scaffolded with fe-scaffold-mcp-server`,
      type: 'module',
      scripts,
      dependencies: dependencies.reduce((acc, dep) => {
        acc[dep.name] = dep.version;
        return acc;
      }, {} as Record<string, string>),
      devDependencies: devDependencies.reduce((acc, dep) => {
        acc[dep.name] = dep.version;
        return acc;
      }, {} as Record<string, string>),
      engines: {
        node: '>=18.0.0',
      },
      keywords: [
        options.framework,
        options.buildTool,
        options.language,
        options.styleFramework,
      ],
      author: 'fe-scaffold-mcp-server',
      license: 'MIT',
    };

    return {
      path: 'package.json',
      type: 'config',
      content: JSON.stringify(packageJson, null, 2),
    };
  }

  /**
   * 创建项目目录结构
   */
  private static async createProjectStructure(
    projectPath: string,
    options: ScaffoldOptions
  ): Promise<void> {
    const baseStructure = FileUtils.generateBaseStructure('');

    // 根据选项添加额外目录
    if (options.testing.mockSolution === 'msw') {
      baseStructure['src/mocks'] = null;
    }

    if (options.testing.framework) {
      baseStructure['src/test'] = null;
      baseStructure['src/components/__tests__'] = null;
    }

    // 添加框架特定目录
    if (options.framework.startsWith('vue')) {
      baseStructure['src/composables'] = null;
    } else if (options.framework === 'react') {
      baseStructure['src/hooks'] = null;
    }

    await FileUtils.createProjectStructure(projectPath, baseStructure);
  }

  /**
   * 生成额外的项目文件
   */
  private static generateExtraFiles(options: ScaffoldOptions): GeneratedFile[] {
    const files: GeneratedFile[] = [];

    // 生成favicon
    files.push({
      path: 'public/favicon.svg',
      type: 'template',
      content: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
  <path d="M12 2L2 7v10c0 5.55 3.84 10 9 10s9-4.45 9-10V7l-10-5z"/>
  <path d="M12 22s-8-4.5-8-10V7l8-5 8 5v5c0 5.5-8 10-8 10z"/>
</svg>`,
    });

    // 生成环境变量示例
    files.push({
      path: '.env.example',
      type: 'config',
      content: `# 环境变量示例
VITE_APP_TITLE=${options.framework.toUpperCase()} App
VITE_API_BASE_URL=http://localhost:3000/api

# 开发环境配置
NODE_ENV=development
`,
    });

    // 生成VSCode配置
    files.push({
      path: '.vscode/settings.json',
      type: 'config',
      content: JSON.stringify({
        'editor.formatOnSave': true,
        'editor.codeActionsOnSave': {
          'source.fixAll.eslint': true,
        },
        'editor.tabSize': 2,
        'files.eol': '\n',
        'typescript.preferences.importModuleSpecifier': 'relative',
        ...(options.framework.startsWith('vue') && {
          'vetur.validation.script': false,
          'vetur.validation.style': false,
          'vetur.validation.template': false,
        }),
      }, null, 2),
    });

    files.push({
      path: '.vscode/extensions.json',
      type: 'config',
      content: JSON.stringify({
        recommendations: [
          'esbenp.prettier-vscode',
          'dbaeumer.vscode-eslint',
          ...(options.framework.startsWith('vue') 
            ? ['Vue.volar']
            : options.framework === 'react'
              ? ['ms-vscode.vscode-typescript-next']
              : []
          ),
          ...(options.styleFramework === 'tailwind' ? ['bradlc.vscode-tailwindcss'] : []),
          ...(options.testing.framework === 'vitest' ? ['ZixuanChen.vitest-explorer'] : []),
        ],
      }, null, 2),
    });

    // 生成部署配置
    if (options.buildTool === 'vite') {
      files.push({
        path: 'deploy.yml',
        type: 'config',
        content: `# GitHub Actions 部署配置示例
name: Deploy to GitHub Pages

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
          
      - name: Install dependencies
        run: npm ci
        
      - name: Build
        run: npm run build
        
      - name: Deploy to GitHub Pages
        uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: \${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./dist
`,
      });
    }

    return files;
  }

  /**
   * 生成项目统计信息
   */
  static generateProjectStats(files: GeneratedFile[]): {
    totalFiles: number;
    fileTypes: Record<string, number>;
    totalLines: number;
  } {
    const fileTypes: Record<string, number> = {};
    let totalLines = 0;

    files.forEach(file => {
      // 统计文件类型
      fileTypes[file.type] = (fileTypes[file.type] || 0) + 1;

      // 统计总行数
      totalLines += file.content.split('\n').length;
    });

    return {
      totalFiles: files.length,
      fileTypes,
      totalLines,
    };
  }

  /**
   * 验证项目生成结果
   */
  static async validateProject(
    projectPath: string,
    options: ScaffoldOptions
  ): Promise<{
    isValid: boolean;
    missingFiles: string[];
    errors: string[];
  }> {
    const errors: string[] = [];
    const missingFiles: string[] = [];

    // 检查必要文件
    const requiredFiles = [
      'package.json',
      'src/main.' + (options.language === 'typescript' ? 'ts' : 'js'),
      'src/App.' + (options.framework.startsWith('vue') ? 'vue' : options.language === 'typescript' ? 'tsx' : 'jsx'),
      'index.html',
    ];

    for (const file of requiredFiles) {
      const filePath = `${projectPath}/${file}`;
      const exists = await FileUtils.fileExists(filePath);
      
      if (!exists) {
        missingFiles.push(file);
      }
    }

    // 检查配置文件
    if (options.qualityTools.eslint) {
      const eslintConfig = `${projectPath}/.eslintrc.cjs`;
      if (!(await FileUtils.fileExists(eslintConfig))) {
        missingFiles.push('.eslintrc.cjs');
      }
    }

    if (options.styleFramework === 'tailwind') {
      const tailwindConfig = `${projectPath}/tailwind.config.cjs`;
      if (!(await FileUtils.fileExists(tailwindConfig))) {
        missingFiles.push('tailwind.config.cjs');
      }
    }

    const isValid = missingFiles.length === 0 && errors.length === 0;

    return {
      isValid,
      missingFiles,
      errors,
    };
  }
}