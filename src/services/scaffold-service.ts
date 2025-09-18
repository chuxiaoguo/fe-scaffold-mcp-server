import {
  ScaffoldOptions,
  CreateScaffoldParams,
  GeneratedFile,
} from "../types.js";
import {
  ErrorHandler,
  ErrorCode,
  Result,
  ResultUtils,
} from "../core/error-handling-v2.js";
import { ValidationService } from "./validation-service.js";
import { OptionsBuilder } from "./options-builder.js";
import { FileService } from "./file-service.js";
import { DependencyService } from "./dependency-service.js";
import { ScriptService } from "./script-service.js";
import {
  IProjectGenerator,
  ProjectGenerationResult,
} from "../core/generator-interfaces.js";

/**
 * 重构后的脚手架服务
 * 统一管理项目创建流程
 */
export class ScaffoldService {
  constructor(
    private validationService: ValidationService,
    private optionsBuilder: OptionsBuilder,
    private fileService: FileService,
    private dependencyService: DependencyService,
    private scriptService: ScriptService,
    private projectGenerator: IProjectGenerator
  ) {}

  /**
   * 创建脚手架项目
   */
  async createProject(
    params: CreateScaffoldParams
  ): Promise<Result<CreateProjectResult>> {
    try {
      // 1. 验证输入参数
      const validationResult =
        this.validationService.validateCreateScaffoldParams(params);
      if (!validationResult.success) {
        return ResultUtils.failure(validationResult.error);
      }

      // 2. 构建配置选项
      const options = this.optionsBuilder.buildFromCreateParams(params);

      // 3. 验证技术栈兼容性
      const compatibilityResult =
        this.validationService.validateStackCompatibility(options);

      // 4. 自动修复配置
      const fixedOptions = this.optionsBuilder.autoFixOptions(options);

      // 5. 生成项目文件
      const generationResult = await this.generateProjectFiles(
        fixedOptions,
        params.projectName
      );
      if (!generationResult.success) {
        return ResultUtils.failure(generationResult.error);
      }

      // 6. 写入文件到磁盘
      const writeResult = await this.writeProjectFiles(
        params.projectName,
        generationResult.data.files
      );
      if (!writeResult.success) {
        return ResultUtils.failure(writeResult.error);
      }

      // 7. 验证生成的项目
      const projectValidation = await this.projectGenerator.validateProject(
        params.projectName,
        fixedOptions
      );

      // 8. 构建结果
      const result: CreateProjectResult = {
        success: true,
        projectPath: params.projectName,
        options: fixedOptions,
        files: generationResult.data.files,
        writeResult: writeResult.data,
        validation: projectValidation.success
          ? projectValidation.data
          : undefined,
        compatibility: compatibilityResult,
        stats: generationResult.data.stats,
        warnings: [
          ...compatibilityResult.suggestions,
          ...(projectValidation.success
            ? projectValidation.data.suggestions
            : []),
        ],
      };

      return ResultUtils.success(result);
    } catch (error) {
      return ResultUtils.failure(
        ErrorHandler.wrapSync(
          () => {
            throw error;
          },
          ErrorCode.PROJECT_GENERATION_FAILED,
          { params }
        ).error!
      );
    }
  }

  /**
   * 预览项目配置
   */
  async previewProject(
    params: CreateScaffoldParams
  ): Promise<Result<PreviewProjectResult>> {
    try {
      // 1. 验证输入参数
      const validationResult =
        this.validationService.validateCreateScaffoldParams(params);
      if (!validationResult.success) {
        return ResultUtils.failure(validationResult.error);
      }

      // 2. 构建配置选项
      const options = this.optionsBuilder.buildFromCreateParams(params);

      // 3. 验证技术栈兼容性
      const compatibilityResult =
        this.validationService.validateStackCompatibility(options);

      // 4. 自动修复配置
      const fixedOptions = this.optionsBuilder.autoFixOptions(options);

      // 5. 生成项目文件（仅内容，不写入磁盘）
      const generationResult = await this.generateProjectFiles(
        fixedOptions,
        params.projectName
      );
      if (!generationResult.success) {
        return ResultUtils.failure(generationResult.error);
      }

      // 6. 构建预览结果
      const result: PreviewProjectResult = {
        projectName: params.projectName,
        options: fixedOptions,
        files: generationResult.data.files,
        structure: this.generateProjectStructure(generationResult.data.files),
        compatibility: compatibilityResult,
        stats: generationResult.data.stats,
        dependencies: this.dependencyService.getDependencies(fixedOptions),
        scripts: this.scriptService.generateScripts(fixedOptions),
      };

      return ResultUtils.success(result);
    } catch (error) {
      return ResultUtils.failure(
        ErrorHandler.wrapSync(
          () => {
            throw error;
          },
          ErrorCode.PROJECT_GENERATION_FAILED,
          { params }
        ).error!
      );
    }
  }

  /**
   * 生成项目文件
   */
  private async generateProjectFiles(
    options: ScaffoldOptions,
    projectName: string
  ): Promise<Result<ProjectGenerationResult>> {
    const context = {
      projectName,
      outputPath: `./${projectName}`,
      templateVars: {
        PROJECT_NAME: projectName,
        FRAMEWORK: options.framework,
        LANGUAGE: options.language,
        BUILD_TOOL: options.buildTool,
      },
    };

    return this.projectGenerator.generateProject(options, context);
  }

  /**
   * 写入项目文件
   */
  private async writeProjectFiles(
    projectName: string,
    files: GeneratedFile[]
  ): Promise<
    Result<{ success: string[]; failed: { file: string; error: string }[] }>
  > {
    return this.fileService.writeFiles(`./${projectName}`, files);
  }

  /**
   * 生成项目结构预览
   */
  private generateProjectStructure(
    files: GeneratedFile[]
  ): Record<string, string | null> {
    const structure: Record<string, string | null> = {};

    files.forEach((file) => {
      const parts = file.path.split("/");
      let currentPath = "";

      parts.forEach((part, index) => {
        currentPath = currentPath ? `${currentPath}/${part}` : part;

        if (index === parts.length - 1) {
          // 文件
          structure[currentPath] = file.type;
        } else {
          // 目录
          structure[currentPath] = null;
        }
      });
    });

    return structure;
  }

  /**
   * 获取技术栈推荐
   */
  getRecommendations(framework: string): Partial<ScaffoldOptions> | undefined {
    // 这里可以从配置服务获取推荐
    return undefined;
  }
}

/**
 * 创建项目结果
 */
export interface CreateProjectResult {
  success: boolean;
  projectPath: string;
  options: ScaffoldOptions;
  files: GeneratedFile[];
  writeResult: { success: string[]; failed: { file: string; error: string }[] };
  validation?: {
    isValid: boolean;
    missingFiles: string[];
    errors: string[];
    suggestions: string[];
  };
  compatibility: {
    isCompatible: boolean;
    score: number;
    issues: any[];
    suggestions: string[];
  };
  stats: {
    totalFiles: number;
    totalLines: number;
    fileTypes: Record<string, number>;
    dependencies: {
      production: number;
      development: number;
    };
  };
  warnings: string[];
}

/**
 * 预览项目结果
 */
export interface PreviewProjectResult {
  projectName: string;
  options: ScaffoldOptions;
  files: GeneratedFile[];
  structure: Record<string, string | null>;
  compatibility: {
    isCompatible: boolean;
    score: number;
    issues: any[];
    suggestions: string[];
  };
  stats: {
    totalFiles: number;
    totalLines: number;
    fileTypes: Record<string, number>;
    dependencies: {
      production: number;
      development: number;
    };
  };
  dependencies: {
    dependencies: any[];
    devDependencies: any[];
  };
  scripts: Record<string, string>;
}
