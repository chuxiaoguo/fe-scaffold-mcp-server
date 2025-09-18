import { ScaffoldOptions, GeneratedFile } from "../types.js";
import { Result } from "../core/error-handling-v2.js";

/**
 * 生成器基础接口
 */
export interface IGenerator {
  /**
   * 生成器名称
   */
  readonly name: string;

  /**
   * 生成器版本
   */
  readonly version: string;

  /**
   * 支持的框架
   */
  readonly supportedFrameworks: readonly string[];

  /**
   * 生成文件
   */
  generate(
    options: ScaffoldOptions,
    context: GeneratorContext
  ): Promise<Result<GeneratedFile[]>>;

  /**
   * 验证输入选项
   */
  validate(options: ScaffoldOptions): Result<boolean>;
}

/**
 * 生成器上下文
 */
export interface GeneratorContext {
  projectName: string;
  outputPath: string;
  templateVars: Record<string, string>;
  customOptions?: Record<string, unknown>;
}

/**
 * 配置生成器接口
 */
export interface IConfigGenerator extends IGenerator {
  /**
   * 生成特定类型的配置文件
   */
  generateConfig(
    type: ConfigType,
    options: ScaffoldOptions,
    context: GeneratorContext
  ): Promise<Result<GeneratedFile>>;

  /**
   * 获取支持的配置类型
   */
  getSupportedConfigTypes(): readonly ConfigType[];
}

/**
 * 模板生成器接口
 */
export interface ITemplateGenerator extends IGenerator {
  /**
   * 生成特定类型的模板文件
   */
  generateTemplate(
    type: TemplateType,
    options: ScaffoldOptions,
    context: GeneratorContext
  ): Promise<Result<GeneratedFile>>;

  /**
   * 获取支持的模板类型
   */
  getSupportedTemplateTypes(): readonly TemplateType[];
}

/**
 * 项目生成器接口
 */
export interface IProjectGenerator extends IGenerator {
  /**
   * 生成完整项目
   */
  generateProject(
    options: ScaffoldOptions,
    context: GeneratorContext
  ): Promise<Result<ProjectGenerationResult>>;

  /**
   * 验证生成的项目
   */
  validateProject(
    projectPath: string,
    options: ScaffoldOptions
  ): Promise<Result<ProjectValidationResult>>;
}

/**
 * 配置文件类型
 */
export type ConfigType =
  | "eslint"
  | "prettier"
  | "typescript"
  | "vite"
  | "webpack"
  | "tailwind"
  | "jest"
  | "vitest"
  | "package-json"
  | "gitignore"
  | "npmrc"
  | "readme";

/**
 * 模板文件类型
 */
export type TemplateType =
  | "main"
  | "app-component"
  | "example-component"
  | "style"
  | "html"
  | "types"
  | "test";

/**
 * 项目生成结果
 */
export interface ProjectGenerationResult {
  projectPath: string;
  files: GeneratedFile[];
  stats: ProjectStats;
  warnings: string[];
}

/**
 * 项目验证结果
 */
export interface ProjectValidationResult {
  isValid: boolean;
  missingFiles: string[];
  errors: string[];
  suggestions: string[];
}

/**
 * 项目统计信息
 */
export interface ProjectStats {
  totalFiles: number;
  totalLines: number;
  fileTypes: Record<string, number>;
  dependencies: {
    production: number;
    development: number;
  };
}

/**
 * 生成器工厂接口
 */
export interface IGeneratorFactory {
  /**
   * 创建配置生成器
   */
  createConfigGenerator(): IConfigGenerator;

  /**
   * 创建模板生成器
   */
  createTemplateGenerator(): ITemplateGenerator;

  /**
   * 创建项目生成器
   */
  createProjectGenerator(): IProjectGenerator;

  /**
   * 注册自定义生成器
   */
  registerGenerator<T extends IGenerator>(name: string, generator: T): void;

  /**
   * 获取已注册的生成器
   */
  getGenerator<T extends IGenerator>(name: string): T | undefined;
}

/**
 * 生成器注册表
 */
export class GeneratorRegistry {
  private generators = new Map<string, IGenerator>();

  /**
   * 注册生成器
   */
  register<T extends IGenerator>(name: string, generator: T): void {
    this.generators.set(name, generator);
  }

  /**
   * 获取生成器
   */
  get<T extends IGenerator>(name: string): T | undefined {
    return this.generators.get(name) as T;
  }

  /**
   * 检查生成器是否存在
   */
  has(name: string): boolean {
    return this.generators.has(name);
  }

  /**
   * 获取所有生成器名称
   */
  getNames(): string[] {
    return Array.from(this.generators.keys());
  }

  /**
   * 清空注册表
   */
  clear(): void {
    this.generators.clear();
  }
}
