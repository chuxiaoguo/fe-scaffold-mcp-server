import { ScaffoldOptions, CreateScaffoldParams } from "../types.js";
import {
  ErrorHandler,
  ErrorCode,
  Result,
  ScaffoldError,
} from "../core/error-handling-v2.js";

/**
 * 验证规则接口
 */
export interface ValidationRule<T = any> {
  name: string;
  description: string;
  validate(value: T, context?: any): ValidationResult;
}

/**
 * 验证结果接口
 */
export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
}

/**
 * 验证错误接口
 */
export interface ValidationError {
  field: string;
  message: string;
  code: string;
  value?: unknown;
}

/**
 * 验证警告接口
 */
export interface ValidationWarning {
  field: string;
  message: string;
  suggestion?: string;
}

/**
 * 兼容性检查结果
 */
export interface CompatibilityResult {
  isCompatible: boolean;
  score: number; // 0-100
  issues: CompatibilityIssue[];
  suggestions: string[];
}

export interface CompatibilityIssue {
  severity: "error" | "warning" | "info";
  message: string;
  field?: string;
}

/**
 * 验证服务
 */
export class ValidationService {
  private rules = new Map<string, ValidationRule>();

  constructor() {
    this.initializeRules();
  }

  /**
   * 验证创建脚手架参数
   */
  validateCreateScaffoldParams(
    params: CreateScaffoldParams
  ): Result<CreateScaffoldParams> {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];

    // 验证项目名称
    const projectNameResult = this.validateProjectName(params.projectName);
    errors.push(...projectNameResult.errors);
    warnings.push(...projectNameResult.warnings);

    // 验证框架
    const frameworkResult = this.validateFramework(params.framework);
    errors.push(...frameworkResult.errors);

    // 验证构建工具
    const buildToolResult = this.validateBuildTool(params.buildTool);
    errors.push(...buildToolResult.errors);

    // 验证语言
    const languageResult = this.validateLanguage(params.language);
    errors.push(...languageResult.errors);

    // 验证样式框架
    const styleResult = this.validateStyleFramework(params.styleFramework);
    errors.push(...styleResult.errors);

    // 验证功能特性
    const featuresResult = this.validateFeatures(params.features);
    errors.push(...featuresResult.errors);
    warnings.push(...featuresResult.warnings);

    if (errors.length > 0) {
      const error = new ScaffoldError(
        ErrorCode.VALIDATION_FAILED,
        "Parameter validation failed",
        { errors, warnings }
      );
      return { success: false, error };
    }

    return { success: true, data: params };
  }

  /**
   * 验证技术栈兼容性
   */
  validateStackCompatibility(options: ScaffoldOptions): CompatibilityResult {
    const issues: CompatibilityIssue[] = [];
    const suggestions: string[] = [];

    // 验证框架和构建工具兼容性
    this.checkFrameworkBuildToolCompatibility(options, issues, suggestions);

    // 验证UI组件库兼容性
    this.checkUILibraryCompatibility(options, issues, suggestions);

    // 验证测试框架兼容性
    this.checkTestingFrameworkCompatibility(options, issues, suggestions);

    // 验证Mock方案兼容性
    this.checkMockSolutionCompatibility(options, issues, suggestions);

    // 计算兼容性评分
    const score = this.calculateCompatibilityScore(issues);
    const isCompatible =
      issues.filter((i) => i.severity === "error").length === 0;

    return {
      isCompatible,
      score,
      issues,
      suggestions,
    };
  }

  /**
   * 验证项目名称
   */
  private validateProjectName(projectName: string): ValidationResult {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];

    if (!projectName || projectName.trim().length === 0) {
      errors.push({
        field: "projectName",
        message: "Project name is required",
        code: "REQUIRED",
      });
    } else {
      // 检查项目名称格式
      if (!/^[a-z0-9-_]+$/i.test(projectName)) {
        errors.push({
          field: "projectName",
          message:
            "Project name must contain only alphanumeric characters, hyphens, and underscores",
          code: "INVALID_FORMAT",
          value: projectName,
        });
      }

      // 检查长度
      if (projectName.length > 214) {
        errors.push({
          field: "projectName",
          message: "Project name must be less than 214 characters",
          code: "TOO_LONG",
          value: projectName,
        });
      }

      // 检查是否以点或下划线开头
      if (/^[._]/.test(projectName)) {
        warnings.push({
          field: "projectName",
          message: "Project name should not start with a dot or underscore",
          suggestion: "Consider removing the leading dot or underscore",
        });
      }

      // 检查保留名称
      const reservedNames = ["node_modules", "favicon.ico", "npm", "node"];
      if (reservedNames.includes(projectName.toLowerCase())) {
        errors.push({
          field: "projectName",
          message: `Project name "${projectName}" is reserved`,
          code: "RESERVED_NAME",
          value: projectName,
        });
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    };
  }

  /**
   * 验证框架
   */
  private validateFramework(framework: string): ValidationResult {
    const supportedFrameworks = ["vue3", "vue2", "react"];
    const errors: ValidationError[] = [];

    if (!framework) {
      errors.push({
        field: "framework",
        message: "Framework is required",
        code: "REQUIRED",
      });
    } else if (!supportedFrameworks.includes(framework)) {
      errors.push({
        field: "framework",
        message: `Unsupported framework: ${framework}`,
        code: "UNSUPPORTED",
        value: framework,
      });
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings: [],
    };
  }

  /**
   * 验证构建工具
   */
  private validateBuildTool(buildTool?: string): ValidationResult {
    const supportedBuildTools = ["vite", "webpack"];
    const errors: ValidationError[] = [];

    if (buildTool && !supportedBuildTools.includes(buildTool)) {
      errors.push({
        field: "buildTool",
        message: `Unsupported build tool: ${buildTool}`,
        code: "UNSUPPORTED",
        value: buildTool,
      });
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings: [],
    };
  }

  /**
   * 验证语言
   */
  private validateLanguage(language?: string): ValidationResult {
    const supportedLanguages = ["typescript", "javascript"];
    const errors: ValidationError[] = [];

    if (language && !supportedLanguages.includes(language)) {
      errors.push({
        field: "language",
        message: `Unsupported language: ${language}`,
        code: "UNSUPPORTED",
        value: language,
      });
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings: [],
    };
  }

  /**
   * 验证样式框架
   */
  private validateStyleFramework(styleFramework?: string): ValidationResult {
    const supportedStyleFrameworks = ["tailwind", "sass", "less"];
    const errors: ValidationError[] = [];

    if (styleFramework && !supportedStyleFrameworks.includes(styleFramework)) {
      errors.push({
        field: "styleFramework",
        message: `Unsupported style framework: ${styleFramework}`,
        code: "UNSUPPORTED",
        value: styleFramework,
      });
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings: [],
    };
  }

  /**
   * 验证功能特性
   */
  private validateFeatures(features?: readonly string[]): ValidationResult {
    const supportedFeatures = [
      "eslint",
      "prettier",
      "lint-staged",
      "commitlint",
      "ls-lint",
      "testing",
      "mock",
      "bundle-analyzer",
    ];
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];

    if (features) {
      const unsupportedFeatures = features.filter(
        (f) => !supportedFeatures.includes(f)
      );
      if (unsupportedFeatures.length > 0) {
        errors.push({
          field: "features",
          message: `Unsupported features: ${unsupportedFeatures.join(", ")}`,
          code: "UNSUPPORTED",
          value: unsupportedFeatures,
        });
      }

      // 推荐基本的代码质量工具
      const recommendedFeatures = ["eslint", "prettier"];
      const missingRecommended = recommendedFeatures.filter(
        (f) => !features.includes(f)
      );
      if (missingRecommended.length > 0) {
        warnings.push({
          field: "features",
          message: `Recommended features not included: ${missingRecommended.join(
            ", "
          )}`,
          suggestion: "Consider adding these features for better code quality",
        });
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    };
  }

  /**
   * 检查框架和构建工具兼容性
   */
  private checkFrameworkBuildToolCompatibility(
    options: ScaffoldOptions,
    issues: CompatibilityIssue[],
    suggestions: string[]
  ): void {
    // Vue2 + Webpack 组合警告
    if (options.framework === "vue2" && options.buildTool === "webpack") {
      issues.push({
        severity: "warning",
        message:
          "Vue2 + Webpack combination may require additional loader configuration",
        field: "buildTool",
      });
      suggestions.push(
        "Consider using Vite for better Vue2 development experience"
      );
    }

    // React + TypeScript 推荐
    if (options.framework === "react" && options.language === "javascript") {
      issues.push({
        severity: "info",
        message: "TypeScript is recommended for React projects",
        field: "language",
      });
      suggestions.push(
        "Consider using TypeScript for better type safety and developer experience"
      );
    }
  }

  /**
   * 检查UI组件库兼容性
   */
  private checkUILibraryCompatibility(
    options: ScaffoldOptions,
    issues: CompatibilityIssue[],
    suggestions: string[]
  ): void {
    if (!options.uiLibrary) return;

    const compatibilityMap = {
      "element-ui": ["vue2"],
      "element-plus": ["vue3"],
      antd: ["react"],
    };

    const supportedFrameworks =
      compatibilityMap[options.uiLibrary as keyof typeof compatibilityMap];
    if (
      supportedFrameworks &&
      !supportedFrameworks.includes(options.framework)
    ) {
      issues.push({
        severity: "error",
        message: `UI library ${options.uiLibrary} is not compatible with framework ${options.framework}`,
        field: "uiLibrary",
      });
    }
  }

  /**
   * 检查测试框架兼容性
   */
  private checkTestingFrameworkCompatibility(
    options: ScaffoldOptions,
    issues: CompatibilityIssue[],
    suggestions: string[]
  ): void {
    // Vitest 主要为 Vite 项目设计
    if (
      options.testing.framework === "vitest" &&
      options.buildTool === "webpack"
    ) {
      issues.push({
        severity: "warning",
        message: "Vitest is primarily designed for Vite projects",
        field: "testing.framework",
      });
      suggestions.push("Consider using Jest for Webpack projects");
    }

    // Jest 在 Vite 项目中需要额外配置
    if (options.testing.framework === "jest" && options.buildTool === "vite") {
      issues.push({
        severity: "warning",
        message: "Jest requires additional configuration in Vite projects",
        field: "testing.framework",
      });
      suggestions.push("Consider using Vitest for Vite projects");
    }
  }

  /**
   * 检查Mock方案兼容性
   */
  private checkMockSolutionCompatibility(
    options: ScaffoldOptions,
    issues: CompatibilityIssue[],
    suggestions: string[]
  ): void {
    const { buildTool, testing } = options;

    // Vite项目的Mock方案检查
    if (buildTool === "vite") {
      if (!["msw", "vite-plugin-mock"].includes(testing.mockSolution)) {
        issues.push({
          severity: "warning",
          message: `Mock solution ${testing.mockSolution} is not optimal for Vite projects`,
          field: "testing.mockSolution",
        });
        suggestions.push(
          "Consider using MSW or vite-plugin-mock for Vite projects"
        );
      }
    }

    // Webpack项目的Mock方案检查
    if (buildTool === "webpack") {
      if (
        !["webpack-proxy", "mocker-api", "msw"].includes(testing.mockSolution)
      ) {
        issues.push({
          severity: "warning",
          message: `Mock solution ${testing.mockSolution} is not optimal for Webpack projects`,
          field: "testing.mockSolution",
        });
        suggestions.push(
          "Consider using webpack-proxy or mocker-api for Webpack projects"
        );
      }
    }
  }

  /**
   * 计算兼容性评分
   */
  private calculateCompatibilityScore(issues: CompatibilityIssue[]): number {
    let score = 100;

    issues.forEach((issue) => {
      switch (issue.severity) {
        case "error":
          score -= 20;
          break;
        case "warning":
          score -= 10;
          break;
        case "info":
          score -= 5;
          break;
      }
    });

    return Math.max(0, score);
  }

  /**
   * 初始化验证规则
   */
  private initializeRules(): void {
    // 这里可以添加更多自定义验证规则
  }

  /**
   * 添加自定义验证规则
   */
  addRule(rule: ValidationRule): void {
    this.rules.set(rule.name, rule);
  }

  /**
   * 移除验证规则
   */
  removeRule(name: string): void {
    this.rules.delete(name);
  }
}
