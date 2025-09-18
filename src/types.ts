// ====================== 基础类型 ======================
export type PackageVersion = string;

// ====================== 枚举和联合类型 ======================
export const FrameworkEnum = {
  VUE3: "vue3",
  VUE2: "vue2",
  REACT: "react",
} as const;
export type Framework = (typeof FrameworkEnum)[keyof typeof FrameworkEnum];

export const LanguageEnum = {
  TYPESCRIPT: "typescript",
  JAVASCRIPT: "javascript",
} as const;
export type Language = (typeof LanguageEnum)[keyof typeof LanguageEnum];

export const BuildToolEnum = {
  VITE: "vite",
  WEBPACK: "webpack",
} as const;
export type BuildTool = (typeof BuildToolEnum)[keyof typeof BuildToolEnum];

export const StyleFrameworkEnum = {
  TAILWIND: "tailwind",
  SASS: "sass",
  LESS: "less",
} as const;
export type StyleFramework =
  (typeof StyleFrameworkEnum)[keyof typeof StyleFrameworkEnum];

export const TestingFrameworkEnum = {
  VITEST: "vitest",
  JEST: "jest",
} as const;
export type TestingFramework =
  (typeof TestingFrameworkEnum)[keyof typeof TestingFrameworkEnum];

export const MockSolutionEnum = {
  MSW: "msw",
  VITE_PLUGIN_MOCK: "vite-plugin-mock",
  WEBPACK_PROXY: "webpack-proxy",
  MOCKER_API: "mocker-api",
} as const;
export type MockSolution =
  (typeof MockSolutionEnum)[keyof typeof MockSolutionEnum];

export const DependencyTypeEnum = {
  PRODUCTION: "production",
  DEVELOPMENT: "development",
  PEER: "peer",
  OPTIONAL: "optional",
} as const;
export type DependencyType =
  (typeof DependencyTypeEnum)[keyof typeof DependencyTypeEnum];

// ====================== 配置接口 ======================
/**
 * 脚手架配置选项
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
}

export type BundleAnalyzerTool =
  | "rollup-plugin-visualizer"
  | "webpack-bundle-analyzer";

// ====================== 依赖管理 ======================
/**
 * 依赖包信息
 */
export interface DependencyInfo {
  readonly name: string;
  readonly version: PackageVersion;
  readonly type: DependencyType;
}

// ====================== 文件和内容类型 ======================
export const FileTypeEnum = {
  CONFIG: "config",
  SOURCE: "source",
  TEMPLATE: "template",
  ASSET: "asset",
  DOCUMENTATION: "documentation",
  TEST: "test",
} as const;
export type FileType = (typeof FileTypeEnum)[keyof typeof FileTypeEnum];

/**
 * 生成的文件内容
 */
export interface GeneratedFile {
  readonly path: string;
  readonly content: string;
  readonly type: FileType;
  readonly encoding?: "utf8" | "base64";
}

// ====================== 模板系统 ======================
export const TemplateCategoryEnum = {
  OFFICIAL: "official",
  COMMUNITY: "community",
  ENTERPRISE: "enterprise",
  EXPERIMENTAL: "experimental",
} as const;
export type TemplateCategory =
  (typeof TemplateCategoryEnum)[keyof typeof TemplateCategoryEnum];

export const TemplateComplexityEnum = {
  MINIMAL: "minimal",
  STANDARD: "standard",
  FULL: "full",
  ENTERPRISE: "enterprise",
} as const;
export type TemplateComplexity =
  (typeof TemplateComplexityEnum)[keyof typeof TemplateComplexityEnum];

/**
 * 技术栈模板
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
}

// ====================== MCP工具参数 ======================
export interface CreateScaffoldParams {
  readonly projectName?: string;
  readonly projectPath?: string;
  readonly framework: string;
  readonly language?: string;
  readonly buildTool?: string;
  readonly styleFramework?: string;
  readonly features?: readonly string[];
  readonly uiLibrary?: string;
}

export interface ValidateStackParams {
  readonly framework: string;
  readonly buildTool: string;
  readonly language?: string;
  readonly features?: readonly string[];
}
