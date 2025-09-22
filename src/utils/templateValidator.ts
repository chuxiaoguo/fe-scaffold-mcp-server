/**
 * 模板验证工具
 */

import { promises as fs } from 'fs';
import { join } from 'path';
import { ScaffoldOptions } from '../types.js';
import { configManager } from '../config/index.js';
import { ErrorHandler, ERROR_CODES } from './errorHandler.js';

export interface TemplateValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  missingFiles: string[];
  invalidFiles: string[];
}

export interface TemplateStructure {
  requiredFiles: string[];
  optionalFiles: string[];
  requiredDirectories: string[];
  configFiles: Record<string, string[]>;
}

/**
 * 模板验证器
 */
export class TemplateValidator {
  /**
   * 验证模板完整性
   */
  static async validateTemplate(
    templatePath: string,
    options: ScaffoldOptions
  ): Promise<TemplateValidationResult> {
    const result: TemplateValidationResult = {
      isValid: true,
      errors: [],
      warnings: [],
      missingFiles: [],
      invalidFiles: [],
    };

    try {
      // 获取模板结构定义
      const structure = this.getTemplateStructure(options);

      // 验证必需文件
      await this.validateRequiredFiles(templatePath, structure.requiredFiles, result);

      // 验证必需目录
      await this.validateRequiredDirectories(templatePath, structure.requiredDirectories, result);

      // 验证配置文件
      await this.validateConfigFiles(templatePath, structure.configFiles, result);

      // 验证文件内容
      await this.validateFileContents(templatePath, options, result);

      // 设置最终验证状态
      result.isValid = result.errors.length === 0;

    } catch (error) {
      ErrorHandler.recordError(
        ERROR_CODES.TEMPLATE_INVALID,
        `模板验证失败: ${error instanceof Error ? error.message : String(error)}`,
        { operation: 'validateTemplate', file: templatePath }
      );
      
      result.isValid = false;
      result.errors.push(`模板验证异常: ${error instanceof Error ? error.message : String(error)}`);
    }

    return result;
  }

  /**
   * 获取模板结构定义
   */
  private static getTemplateStructure(options: ScaffoldOptions): TemplateStructure {
    const { framework, buildTool, language } = options;
    
    const structure: TemplateStructure = {
      requiredFiles: [
        'package.json',
        'index.html',
        `src/main.${language === 'typescript' ? 'ts' : 'js'}`,
      ],
      optionalFiles: [
        'README.md',
        '.gitignore',
        '.npmrc',
        '.editorconfig',
      ],
      requiredDirectories: [
        'src',
        'public',
      ],
      configFiles: {},
    };

    // 根据框架添加特定文件
    if (framework.startsWith('vue')) {
      structure.requiredFiles.push('src/App.vue');
      if (language === 'typescript') {
        structure.requiredFiles.push('src/vite-env.d.ts');
      }
    } else if (framework === 'react') {
      const ext = language === 'typescript' ? 'tsx' : 'jsx';
      structure.requiredFiles.push(`src/App.${ext}`);
    }

    // 根据构建工具添加配置文件
    if (buildTool === 'vite') {
      structure.requiredFiles.push('vite.config.ts');
    } else if (buildTool === 'webpack') {
      structure.requiredFiles.push('webpack.config.js');
    }

    // 添加质量工具配置文件
    if (options.qualityTools.eslint) {
      structure.configFiles.eslint = ['.eslintrc.cjs', '.eslintrc.js'];
    }

    if (options.styleFramework === 'tailwind') {
      structure.configFiles.tailwind = ['tailwind.config.cjs', 'postcss.config.js'];
    }

    return structure;
  }

  /**
   * 验证必需文件
   */
  private static async validateRequiredFiles(
    templatePath: string,
    requiredFiles: string[],
    result: TemplateValidationResult
  ): Promise<void> {
    for (const file of requiredFiles) {
      const filePath = join(templatePath, file);
      
      try {
        await fs.access(filePath);
      } catch {
        result.missingFiles.push(file);
        result.errors.push(`缺少必需文件: ${file}`);
      }
    }
  }

  /**
   * 验证必需目录
   */
  private static async validateRequiredDirectories(
    templatePath: string,
    requiredDirectories: string[],
    result: TemplateValidationResult
  ): Promise<void> {
    for (const dir of requiredDirectories) {
      const dirPath = join(templatePath, dir);
      
      try {
        const stat = await fs.stat(dirPath);
        if (!stat.isDirectory()) {
          result.errors.push(`${dir} 不是一个目录`);
        }
      } catch {
        result.errors.push(`缺少必需目录: ${dir}`);
      }
    }
  }

  /**
   * 验证配置文件
   */
  private static async validateConfigFiles(
    templatePath: string,
    configFiles: Record<string, string[]>,
    result: TemplateValidationResult
  ): Promise<void> {
    for (const [category, files] of Object.entries(configFiles)) {
      let hasValidConfig = false;
      
      for (const file of files) {
        const filePath = join(templatePath, file);
        
        try {
          await fs.access(filePath);
          hasValidConfig = true;
          break;
        } catch {
          // 继续检查下一个文件
        }
      }
      
      if (!hasValidConfig) {
        result.warnings.push(`${category} 配置文件缺失，可能影响功能: ${files.join(', ')}`);
      }
    }
  }

  /**
   * 验证文件内容
   */
  private static async validateFileContents(
    templatePath: string,
    options: ScaffoldOptions,
    result: TemplateValidationResult
  ): Promise<void> {
    // 验证 package.json
    await this.validatePackageJson(templatePath, result);

    // 验证主入口文件
    await this.validateMainFile(templatePath, options, result);

    // 验证配置文件语法
    await this.validateConfigSyntax(templatePath, result);
  }

  /**
   * 验证 package.json
   */
  private static async validatePackageJson(
    templatePath: string,
    result: TemplateValidationResult
  ): Promise<void> {
    const packageJsonPath = join(templatePath, 'package.json');
    
    try {
      const content = await fs.readFile(packageJsonPath, 'utf-8');
      const packageJson = JSON.parse(content);
      
      // 检查必需字段
      const requiredFields = ['name', 'version', 'scripts'];
      for (const field of requiredFields) {
        if (!packageJson[field]) {
          result.errors.push(`package.json 缺少必需字段: ${field}`);
        }
      }
      
      // 检查脚本
      const requiredScripts = ['dev', 'build'];
      for (const script of requiredScripts) {
        if (!packageJson.scripts?.[script]) {
          result.warnings.push(`package.json 缺少推荐脚本: ${script}`);
        }
      }
      
    } catch (error) {
      result.errors.push(`package.json 格式错误: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * 验证主入口文件
   */
  private static async validateMainFile(
    templatePath: string,
    options: ScaffoldOptions,
    result: TemplateValidationResult
  ): Promise<void> {
    const { language } = options;
    const mainFile = `src/main.${language === 'typescript' ? 'ts' : 'js'}`;
    const mainFilePath = join(templatePath, mainFile);
    
    try {
      const content = await fs.readFile(mainFilePath, 'utf-8');
      
      // 检查基本导入
      if (options.framework.startsWith('vue')) {
        if (!content.includes('createApp')) {
          result.warnings.push('主文件可能缺少 Vue 应用创建代码');
        }
      } else if (options.framework === 'react') {
        if (!content.includes('ReactDOM') && !content.includes('createRoot')) {
          result.warnings.push('主文件可能缺少 React 渲染代码');
        }
      }
      
    } catch (error) {
      result.errors.push(`无法读取主入口文件 ${mainFile}: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * 验证配置文件语法
   */
  private static async validateConfigSyntax(
    templatePath: string,
    result: TemplateValidationResult
  ): Promise<void> {
    const configFiles = [
      { file: '.eslintrc.cjs', type: 'javascript' },
      { file: 'tailwind.config.cjs', type: 'javascript' },
      { file: 'vite.config.ts', type: 'typescript' },
      { file: 'tsconfig.json', type: 'json' },
    ];
    
    for (const { file, type } of configFiles) {
      const filePath = join(templatePath, file);
      
      try {
        await fs.access(filePath);
        const content = await fs.readFile(filePath, 'utf-8');
        
        if (type === 'json') {
          try {
            JSON.parse(content);
          } catch {
            result.errors.push(`${file} JSON 格式错误`);
          }
        }
        // 对于 JavaScript/TypeScript 文件，可以添加更复杂的语法检查
        
      } catch {
        // 文件不存在，跳过验证
      }
    }
  }

  /**
   * 验证生成的项目
   */
  static async validateGeneratedProject(
    projectPath: string,
    options: ScaffoldOptions
  ): Promise<TemplateValidationResult> {
    const result: TemplateValidationResult = {
      isValid: true,
      errors: [],
      warnings: [],
      missingFiles: [],
      invalidFiles: [],
    };

    try {
      // 验证项目结构
      await this.validateProjectStructure(projectPath, options, result);

      // 验证依赖安装
      await this.validateDependencies(projectPath, result);

      // 验证配置文件
      await this.validateProjectConfigs(projectPath, options, result);

      result.isValid = result.errors.length === 0;

    } catch (error) {
      result.isValid = false;
      result.errors.push(`项目验证失败: ${error instanceof Error ? error.message : String(error)}`);
    }

    return result;
  }

  /**
   * 验证项目结构
   */
  private static async validateProjectStructure(
    projectPath: string,
    options: ScaffoldOptions,
    result: TemplateValidationResult
  ): Promise<void> {
    const structure = this.getTemplateStructure(options);
    
    // 验证必需文件和目录
    await this.validateRequiredFiles(projectPath, structure.requiredFiles, result);
    await this.validateRequiredDirectories(projectPath, structure.requiredDirectories, result);
  }

  /**
   * 验证依赖
   */
  private static async validateDependencies(
    projectPath: string,
    result: TemplateValidationResult
  ): Promise<void> {
    const packageJsonPath = join(projectPath, 'package.json');
    
    try {
      const content = await fs.readFile(packageJsonPath, 'utf-8');
      const packageJson = JSON.parse(content);
      
      // 检查是否有依赖
      if (!packageJson.dependencies && !packageJson.devDependencies) {
        result.warnings.push('项目没有定义任何依赖');
      }
      
      // 检查 node_modules 是否存在（如果已安装）
      const nodeModulesPath = join(projectPath, 'node_modules');
      try {
        await fs.access(nodeModulesPath);
      } catch {
        result.warnings.push('依赖尚未安装，请运行 npm install');
      }
      
    } catch (error) {
      result.errors.push(`无法验证依赖: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * 验证项目配置
   */
  private static async validateProjectConfigs(
    projectPath: string,
    options: ScaffoldOptions,
    result: TemplateValidationResult
  ): Promise<void> {
    // 验证 .npmrc
    const npmrcPath = join(projectPath, '.npmrc');
    try {
      await fs.access(npmrcPath);
      const content = await fs.readFile(npmrcPath, 'utf-8');
      if (!content.includes('registry=')) {
        result.warnings.push('.npmrc 文件可能缺少注册表配置');
      }
    } catch {
      result.warnings.push('缺少 .npmrc 配置文件');
    }

    // 验证 .editorconfig
    const editorconfigPath = join(projectPath, '.editorconfig');
    try {
      await fs.access(editorconfigPath);
    } catch {
      result.warnings.push('缺少 .editorconfig 配置文件');
    }

    // 根据选项验证其他配置文件
    if (options.qualityTools.eslint) {
      const eslintConfigPath = join(projectPath, '.eslintrc.cjs');
      try {
        await fs.access(eslintConfigPath);
      } catch {
        result.errors.push('启用了 ESLint 但缺少配置文件');
      }
    }
  }
}