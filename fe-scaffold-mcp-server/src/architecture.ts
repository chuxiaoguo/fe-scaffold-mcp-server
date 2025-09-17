/**
 * 前端脚手架MCP服务器架构层级
 * 
 * 采用分层架构模式，确保代码的可维护性和扩展性
 */

// 导入必要的类型
import { 
  ProjectMetadata, 
  GeneratedFile, 
  ValidationResult,
  ValidationError,
  ValidationWarning,
  ValidationSuggestion,
  CompatibilityMatrix,
  Customization,
  StackTemplate,
  CreateProjectCommand,
  CreateProjectResult,
  PreviewProjectQuery,
  PreviewProjectResult,
  TemplateFilter,
  TemplateList,
  Configuration,
  Package,
  Schema,
  MCPSchema,
  MCPResponse,
  Template,
  TechStack,
  CreateProjectOptions,
  DeploymentTarget,
  DeploymentResult
} from './types.js';

// 简化Feature类型
export type Feature = string;

// ====================== 领域层 (Domain Layer) ======================
export namespace Domain {
  // 核心业务实体
  export interface ScaffoldProject {
    readonly id: string;
    readonly name: string;
    readonly configuration: ProjectConfiguration;
    readonly metadata: ProjectMetadata;
    
    validate(): ValidationResult;
    generateFiles(): Promise<GeneratedFile[]>;
    deploy(target: DeploymentTarget): Promise<DeploymentResult>;
  }

  export interface ProjectConfiguration {
    readonly framework: Framework;
    readonly language: Language;
    readonly buildTool: BuildTool;
    readonly features: readonly Feature[];
    readonly customizations: readonly Customization[];
  }

  // 值对象
  export type Framework = 'vue3' | 'vue2' | 'react' | 'angular' | 'svelte';
  export type Language = 'typescript' | 'javascript';
  export type BuildTool = 'vite' | 'webpack' | 'rollup' | 'parcel';
  
  // 业务规则
  export interface ValidationRule {
    readonly name: string;
    readonly description: string;
    validate(config: ProjectConfiguration): ValidationResult;
  }
}

// ====================== 应用层 (Application Layer) ======================
export namespace Application {
  // 应用服务
  export interface ScaffoldService {
    createProject(request: CreateProjectCommand): Promise<CreateProjectResult>;
    previewProject(request: PreviewProjectQuery): Promise<PreviewProjectResult>;
    validateConfiguration(config: Domain.ProjectConfiguration): Promise<ValidationResult>;
    listTemplates(filter?: TemplateFilter): Promise<TemplateList>;
  }

  // 用例
  export interface CreateProjectUseCase {
    execute(command: CreateProjectCommand): Promise<CreateProjectResult>;
  }

  export interface PreviewProjectUseCase {
    execute(query: PreviewProjectQuery): Promise<PreviewProjectResult>;
  }

  // 命令和查询
  export interface CreateProjectCommand {
    readonly projectName: string;
    readonly configuration: Domain.ProjectConfiguration;
    readonly outputPath?: string;
    readonly options: CreateProjectOptions;
  }

  export interface PreviewProjectQuery {
    readonly configuration: Domain.ProjectConfiguration;
    readonly includeFileContent: boolean;
    readonly includeStats: boolean;
  }
}

// ====================== 基础设施层 (Infrastructure Layer) ======================
export namespace Infrastructure {
  // 仓储接口
  export interface TemplateRepository {
    findByFramework(framework: Domain.Framework): Promise<Template[]>;
    findById(id: string): Promise<Template | null>;
    save(template: Template): Promise<void>;
  }

  export interface ConfigurationRepository {
    findByStack(stack: TechStack): Promise<Configuration | null>;
    saveConfiguration(config: Configuration): Promise<void>;
  }

  // 外部服务接口
  export interface FileSystemService {
    createDirectory(path: string): Promise<void>;
    writeFile(path: string, content: string): Promise<void>;
    readFile(path: string): Promise<string>;
    exists(path: string): Promise<boolean>;
    copyFile(source: string, destination: string): Promise<void>;
  }

  export interface GitService {
    initRepository(path: string): Promise<void>;
    addRemote(path: string, url: string): Promise<void>;
    initialCommit(path: string, message: string): Promise<void>;
  }

  export interface PackageManagerService {
    install(path: string, packages: Package[]): Promise<void>;
    run(path: string, script: string): Promise<void>;
    addScript(path: string, name: string, command: string): Promise<void>;
  }
}

// ====================== 表现层 (Presentation Layer) ======================
export namespace Presentation {
  // MCP工具定义
  export interface MCPTool {
    readonly name: string;
    readonly description: string;
    readonly schema: MCPSchema;
    
    execute(params: unknown): Promise<MCPResponse>;
  }

  // 响应格式化器
  export interface ResponseFormatter {
    formatSuccess<T>(data: T): MCPResponse;
    formatError(error: Error): MCPResponse;
    formatValidation(result: ValidationResult): MCPResponse;
  }

  // 请求验证器
  export interface RequestValidator {
    validate<T>(data: unknown, schema: Schema<T>): ValidationResult;
  }
}

// ====================== 共享内核 (Shared Kernel) ======================
export namespace Shared {
  // 通用类型
  export interface ValidationResult<T = unknown> {
    readonly isValid: boolean;
    readonly data?: T;
    readonly errors: readonly ValidationError[];
    readonly warnings: readonly ValidationWarning[];
  }

  export interface ValidationError {
    readonly code: string;
    readonly message: string;
    readonly field?: string;
    readonly details?: Record<string, unknown>;
  }

  export interface ValidationWarning {
    readonly code: string;
    readonly message: string;
    readonly suggestion?: string;
  }

  export interface Result<T, E = Error> {
    readonly isSuccess: boolean;
    readonly value?: T;
    readonly error?: E;
  }

  // 工厂方法
  export class Results {
    static success<T>(value: T): Result<T> {
      return { isSuccess: true, value };
    }

    static failure<E>(error: E): Result<never, E> {
      return { isSuccess: false, error };
    }
  }

  // 事件
  export interface DomainEvent {
    readonly id: string;
    readonly type: string;
    readonly occurredAt: Date;
    readonly data: Record<string, unknown>;
  }

  export interface EventBus {
    publish(event: DomainEvent): Promise<void>;
    subscribe<T extends DomainEvent>(eventType: string, handler: (event: T) => Promise<void>): void;
  }
}

// ====================== 配置与常量 ======================
export namespace Config {
  export const SUPPORTED_FRAMEWORKS: readonly Domain.Framework[] = [
    'vue3', 'vue2', 'react', 'angular', 'svelte'
  ] as const;

  export const SUPPORTED_BUILD_TOOLS: readonly Domain.BuildTool[] = [
    'vite', 'webpack', 'rollup', 'parcel'
  ] as const;

  export const DEFAULT_FEATURES = [
    'eslint', 'prettier', 'lint-staged', 'commitlint', 'ls-lint',
    'testing', 'mock', 'bundle-analyzer'
  ] as const;

  export const COMPATIBILITY_MATRIX: Record<Domain.Framework, Domain.BuildTool[]> = {
    vue3: ['vite', 'webpack', 'rollup'],
    vue2: ['vite', 'webpack'],
    react: ['vite', 'webpack', 'parcel'],
    angular: ['webpack'],
    svelte: ['vite', 'rollup', 'webpack']
  };

  export const PERFORMANCE_THRESHOLDS = {
    FILE_GENERATION_MAX_TIME: 5000, // 5 seconds
    VALIDATION_MAX_TIME: 1000, // 1 second
    TEMPLATE_CACHE_TTL: 3600000, // 1 hour
  } as const;
}