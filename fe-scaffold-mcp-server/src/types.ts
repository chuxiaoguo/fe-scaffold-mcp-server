// ====================== 品牌类型 (Branded Types) ======================
export type ProjectName = string & { readonly __brand: 'ProjectName' };
export type FilePath = string & { readonly __brand: 'FilePath' };
export type PackageVersion = string & { readonly __brand: 'PackageVersion' };
export type GitUrl = string & { readonly __brand: 'GitUrl' };

// 工厂函数
export const ProjectName = (value: string): ProjectName => {
  if (!value || value.trim().length === 0) {
    throw new Error('Project name cannot be empty');
  }
  if (!/^[a-z0-9-_]+$/i.test(value)) {
    throw new Error('Project name must contain only alphanumeric characters, hyphens, and underscores');
  }
  return value as ProjectName;
};

export const FilePath = (value: string): FilePath => {
  if (!value || value.trim().length === 0) {
    throw new Error('File path cannot be empty');
  }
  return value as FilePath;
};

export const PackageVersion = (value: string): PackageVersion => {
  if (!value || value.trim().length === 0) {
    throw new Error('Package version cannot be empty');
  }
  return value as PackageVersion;
};

// ====================== 枚举和联合类型 ======================
export const Framework = {
  VUE3: 'vue3',
  VUE2: 'vue2', 
  REACT: 'react',
  ANGULAR: 'angular',
  SVELTE: 'svelte'
} as const;
export type Framework = typeof Framework[keyof typeof Framework];

export const Language = {
  TYPESCRIPT: 'typescript',
  JAVASCRIPT: 'javascript'
} as const;
export type Language = typeof Language[keyof typeof Language];

export const BuildTool = {
  VITE: 'vite',
  WEBPACK: 'webpack',
  ROLLUP: 'rollup',
  PARCEL: 'parcel'
} as const;
export type BuildTool = typeof BuildTool[keyof typeof BuildTool];

export const StyleFramework = {
  TAILWIND: 'tailwind',
  SASS: 'sass',
  LESS: 'less',
  STYLED_COMPONENTS: 'styled-components',
  EMOTION: 'emotion'
} as const;
export type StyleFramework = typeof StyleFramework[keyof typeof StyleFramework];

export const TestingFramework = {
  VITEST: 'vitest',
  JEST: 'jest',
  PLAYWRIGHT: 'playwright',
  CYPRESS: 'cypress'
} as const;
export type TestingFramework = typeof TestingFramework[keyof typeof TestingFramework];

export const MockSolution = {
  MSW: 'msw',
  VITE_PLUGIN_MOCK: 'vite-plugin-mock',
  WEBPACK_PROXY: 'webpack-proxy',
  MOCKER_API: 'mocker-api',
  JSON_SERVER: 'json-server'
} as const;
export type MockSolution = typeof MockSolution[keyof typeof MockSolution];

// ====================== 配置接口 ======================
/**
 * 脚手架配置选项 - 不可变且类型安全
 */
export interface ScaffoldOptions {
  readonly framework: Framework;
  readonly language: Language;
  readonly buildTool: BuildTool;
  readonly styleFramework: StyleFramework;
  readonly uiLibrary?: string;
  readonly qualityTools: QualityToolsConfig;
  readonly testing: TestingConfig;
  readonly bundleAnalyzer: BundleAnalyzerTool;
  readonly customizations?: readonly Customization[];
}

export interface QualityToolsConfig {
  readonly eslint: boolean;
  readonly prettier: boolean;
  readonly lintStaged: boolean;
  readonly commitlint: boolean;
  readonly lsLint: boolean;
  readonly husky: boolean;
  readonly editorconfig: boolean;
}

export interface TestingConfig {
  readonly framework: TestingFramework;
  readonly mockSolution: MockSolution;
  readonly e2e?: boolean;
  readonly coverage?: boolean;
  readonly watchMode?: boolean;
}

export type BundleAnalyzerTool = 'rollup-plugin-visualizer' | 'webpack-bundle-analyzer' | 'parcel-analyzer';

export interface Customization {
  readonly type: 'dependency' | 'script' | 'config' | 'file';
  readonly target: string;
  readonly value: unknown;
  readonly condition?: (options: ScaffoldOptions) => boolean;
}

// ====================== 文件和内容类型 ======================
export const FileType = {
  CONFIG: 'config',
  SOURCE: 'source', 
  TEMPLATE: 'template',
  ASSET: 'asset',
  DOCUMENTATION: 'documentation',
  TEST: 'test'
} as const;
export type FileType = typeof FileType[keyof typeof FileType];

/**
 * 生成的文件内容 - 不可变
 */
export interface GeneratedFile {
  readonly path: string; // 暂时使用string，后续可改为FilePath
  readonly content: string;
  readonly type: FileType;
  readonly encoding?: 'utf8' | 'base64';
  readonly metadata?: FileMetadata;
}

export interface FileMetadata {
  readonly size: number;
  readonly checksum?: string;
  readonly lastModified: Date;
  readonly author?: string;
  readonly description?: string;
  readonly tags?: readonly string[];
}

// ====================== 依赖管理 ======================
export const DependencyType = {
  PRODUCTION: 'production',
  DEVELOPMENT: 'development',
  PEER: 'peer',
  OPTIONAL: 'optional'
} as const;
export type DependencyType = typeof DependencyType[keyof typeof DependencyType];

/**
 * 依赖包信息 - 增强版
 */
export interface DependencyInfo {
  readonly name: string;
  readonly version: PackageVersion;
  readonly type: DependencyType;
  readonly description?: string;
  readonly repository?: GitUrl;
  readonly license?: string;
  readonly integrity?: string;
  readonly optional?: boolean;
  readonly bundledDependencies?: readonly string[];
}

export interface PackageJsonConfig {
  readonly name: ProjectName;
  readonly version: PackageVersion;
  readonly description: string;
  readonly type?: 'module' | 'commonjs';
  readonly main?: FilePath;
  readonly scripts: Record<string, string>;
  readonly dependencies: Record<string, PackageVersion>;
  readonly devDependencies: Record<string, PackageVersion>;
  readonly peerDependencies?: Record<string, PackageVersion>;
  readonly engines: Record<string, string>;
  readonly keywords: readonly string[];
  readonly author: string;
  readonly license: string;
  readonly repository?: {
    readonly type: 'git';
    readonly url: GitUrl;
  };
  readonly bugs?: {
    readonly url: string;
  };
  readonly homepage?: string;
}

// ====================== 模板系统 ======================
export const TemplateCategory = {
  OFFICIAL: 'official',
  COMMUNITY: 'community',
  ENTERPRISE: 'enterprise',
  EXPERIMENTAL: 'experimental'
} as const;
export type TemplateCategory = typeof TemplateCategory[keyof typeof TemplateCategory];

export const TemplateComplexity = {
  MINIMAL: 'minimal',
  STANDARD: 'standard',
  FULL: 'full',
  ENTERPRISE: 'enterprise'
} as const;
export type TemplateComplexity = typeof TemplateComplexity[keyof typeof TemplateComplexity];

/**
 * 技术栈模板 - 增强版
 */
export interface StackTemplate {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly category: TemplateCategory;
  readonly complexity: TemplateComplexity;
  readonly framework: Framework;
  readonly buildTool: BuildTool;
  readonly defaultOptions: Readonly<Partial<ScaffoldOptions>>;
  readonly supportedFeatures: readonly string[];
  readonly requiredFeatures: readonly string[];
  readonly incompatibleFeatures: readonly string[];
  readonly tags: readonly string[];
  readonly version: PackageVersion;
  readonly author: string;
  readonly createdAt: Date;
  readonly updatedAt: Date;
  readonly downloadCount?: number;
  readonly rating?: number;
  readonly documentation?: FilePath;
  readonly example?: FilePath;
  readonly preview?: {
    readonly images: readonly string[];
    readonly demo?: string;
  };
}

// ====================== 生成器上下文 ======================
export interface GeneratorContext {
  readonly options: ScaffoldOptions;
  readonly projectName: ProjectName;
  readonly outputPath: FilePath;
  readonly dependencies: readonly DependencyInfo[];
  readonly metadata: ProjectMetadata;
  readonly environment: EnvironmentInfo;
  readonly performance: PerformanceMetrics;
}

export interface ProjectMetadata {
  readonly id: string;
  readonly createdAt: Date;
  readonly template?: StackTemplate;
  readonly generator: {
    readonly name: string;
    readonly version: PackageVersion;
  };
  readonly customizations: readonly Customization[];
}

export interface EnvironmentInfo {
  readonly nodeVersion: string;
  readonly npmVersion: string;
  readonly platform: string;
  readonly arch: string;
  readonly cwd: FilePath;
  readonly user?: string;
}

export interface PerformanceMetrics {
  readonly startTime: Date;
  readonly fileGenerationTime?: number;
  readonly dependencyResolutionTime?: number;
  readonly validationTime?: number;
  readonly totalFiles: number;
  readonly totalSize: number;
}

// ====================== MCP工具参数 ======================
export interface CreateScaffoldParams {
  readonly projectName: string;
  readonly framework: string;
  readonly language?: string;
  readonly buildTool?: string;
  readonly styleFramework?: string;
  readonly features?: readonly string[];
  readonly uiLibrary?: string;
  readonly template?: string;
  readonly outputPath?: string;
  readonly gitInit?: boolean;
  readonly installDependencies?: boolean;
  readonly customizations?: readonly Record<string, unknown>[];
}

export interface ValidateStackParams {
  readonly framework: string;
  readonly buildTool: string;
  readonly language?: string;
  readonly features?: readonly string[];
  readonly strictMode?: boolean;
}

export interface PreviewConfigParams extends CreateScaffoldParams {
  readonly showFileContent?: boolean;
  readonly includeStats?: boolean;
  readonly format?: 'markdown' | 'json' | 'yaml';
}

export interface ListTemplatesParams {
  readonly framework?: string;
  readonly buildTool?: string;
  readonly category?: TemplateCategory;
  readonly complexity?: TemplateComplexity;
  readonly tags?: readonly string[];
  readonly sortBy?: 'name' | 'rating' | 'downloads' | 'created' | 'updated';
  readonly sortOrder?: 'asc' | 'desc';
  readonly limit?: number;
  readonly offset?: number;
}

// ====================== 结果类型 ======================
export interface CreateScaffoldResult {
  readonly success: boolean;
  readonly projectPath?: FilePath;
  readonly files: readonly GeneratedFile[];
  readonly createdFiles: readonly FilePath[];
  readonly failedFiles: readonly { path: FilePath; error: string }[];
  readonly metadata: ProjectMetadata;
  readonly performance: PerformanceMetrics;
  readonly warnings: readonly string[];
}

export interface ValidationResult {
  readonly isValid: boolean;
  readonly score: number; // 0-100
  readonly errors: readonly ValidationError[];
  readonly warnings: readonly ValidationWarning[];
  readonly suggestions: readonly ValidationSuggestion[];
  readonly compatibility: CompatibilityMatrix;
}

export interface ValidationError {
  readonly code: string;
  readonly message: string;
  readonly field?: string;
  readonly severity: 'error' | 'warning' | 'info';
  readonly fixable?: boolean;
  readonly documentation?: string;
}

export interface ValidationWarning {
  readonly code: string;
  readonly message: string;
  readonly suggestion?: string;
  readonly impact: 'low' | 'medium' | 'high';
}

export interface ValidationSuggestion {
  readonly type: 'upgrade' | 'alternative' | 'optimization' | 'best-practice';
  readonly message: string;
  readonly action?: string;
  readonly benefit?: string;
}

export interface CompatibilityMatrix {
  readonly framework: Record<string, boolean>;
  readonly buildTool: Record<string, boolean>;
  readonly features: Record<string, boolean>;
  readonly overall: number; // 0-100
}

// ====================== 错误类型 ======================
export class ScaffoldError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly details?: Record<string, unknown>
  ) {
    super(message);
    this.name = 'ScaffoldError';
  }
}

export class ValidationError extends ScaffoldError {
  constructor(message: string, public readonly field?: string) {
    super(message, 'VALIDATION_ERROR', { field });
    this.name = 'ValidationError';
  }
}

export class ConfigurationError extends ScaffoldError {
  constructor(message: string, public readonly config?: string) {
    super(message, 'CONFIGURATION_ERROR', { config });
    this.name = 'ConfigurationError';
  }
}

export class FileSystemError extends ScaffoldError {
  constructor(message: string, public readonly path?: FilePath) {
    super(message, 'FILESYSTEM_ERROR', { path });
    this.name = 'FileSystemError';
  }
}

// ====================== 架构支持类型 ======================
// 为architecture.ts提供必要的类型定义

export interface DeploymentTarget {
  readonly type: 'local' | 'remote' | 'cloud';
  readonly path?: string;
  readonly url?: string;
  readonly credentials?: Record<string, string>;
}

export interface DeploymentResult {
  readonly success: boolean;
  readonly url?: string;
  readonly logs: readonly string[];
  readonly duration: number;
}

export type Feature = string;

export interface ProjectStatistics {
  readonly totalFiles: number;
  readonly totalSize: number;
  readonly dependencies: number;
  readonly devDependencies: number;
}

export interface CreateProjectOptions {
  readonly force?: boolean;
  readonly gitInit?: boolean;
  readonly installDependencies?: boolean;
  readonly skipValidation?: boolean;
}

export interface TemplateFilter {
  readonly framework?: Framework;
  readonly buildTool?: BuildTool;
  readonly category?: TemplateCategory;
  readonly tags?: readonly string[];
}

export interface TemplateList {
  readonly templates: readonly StackTemplate[];
  readonly total: number;
  readonly page: number;
  readonly limit: number;
}

export interface Configuration {
  readonly name: string;
  readonly value: unknown;
  readonly type: 'string' | 'number' | 'boolean' | 'object' | 'array';
}

export interface Package {
  readonly name: string;
  readonly version: string;
  readonly type: DependencyType;
}

export interface Schema<T = unknown> {
  readonly type: string;
  readonly properties?: Record<string, unknown>;
  readonly required?: readonly string[];
  validate(data: unknown): ValidationResult;
}

export interface MCPSchema {
  readonly type: string;
  readonly properties: Record<string, unknown>;
  readonly required?: readonly string[];
}

export interface MCPResponse {
  readonly content: readonly {
    readonly type: string;
    readonly text: string;
  }[];
}

export interface TechStack {
  readonly framework: Framework;
  readonly buildTool: BuildTool;
  readonly language: Language;
  readonly styleFramework: StyleFramework;
}

// 别名定义，为了兼容architecture.ts
export type CreateProjectRequest = CreateProjectCommand;
export type CreateProjectResponse = CreateProjectResult;
export type PreviewProjectRequest = PreviewProjectQuery;
export type PreviewProjectResponse = PreviewProjectResult;

// 补充架构需要的类型
export interface Template {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly framework: Framework;
  readonly buildTool: BuildTool;
}

// 命令和查询类型
export interface CreateProjectCommand {
  readonly projectName: string;
  readonly configuration: ScaffoldOptions;
  readonly outputPath?: string;
  readonly options: CreateProjectOptions;
}

export interface CreateProjectResult {
  readonly success: boolean;
  readonly projectPath?: string;
  readonly files: readonly GeneratedFile[];
  readonly metadata: ProjectMetadata;
  readonly performance: PerformanceMetrics;
}

export interface PreviewProjectQuery {
  readonly configuration: ScaffoldOptions;
  readonly includeFileContent: boolean;
  readonly includeStats: boolean;
}

export interface PreviewProjectResult {
  readonly structure: Record<string, string | null>;
  readonly files: readonly GeneratedFile[];
  readonly statistics: ProjectStatistics;
}