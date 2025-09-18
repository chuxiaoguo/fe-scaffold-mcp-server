import { ScaffoldOptions, CreateScaffoldParams } from "../types.js";

/**
 * 配置选项构建器
 * 统一处理参数构建逻辑，避免重复代码
 */
export class OptionsBuilder {
  private recommendations: Record<string, Partial<ScaffoldOptions>>;

  constructor(recommendations: Record<string, Partial<ScaffoldOptions>>) {
    this.recommendations = recommendations;
  }

  /**
   * 从创建脚手架参数构建选项
   */
  buildFromCreateParams(params: CreateScaffoldParams): ScaffoldOptions {
    const features = params.features || this.getDefaultFeatures();
    const recommendation = this.recommendations[params.framework] || {};

    return {
      framework: params.framework as ScaffoldOptions["framework"],
      language: (params.language ||
        recommendation.language ||
        "typescript") as ScaffoldOptions["language"],
      buildTool: (params.buildTool ||
        recommendation.buildTool ||
        "vite") as ScaffoldOptions["buildTool"],
      styleFramework: (params.styleFramework ||
        recommendation.styleFramework ||
        "tailwind") as ScaffoldOptions["styleFramework"],
      uiLibrary: params.uiLibrary || recommendation.uiLibrary,
      qualityTools: this.buildQualityToolsConfig(features),
      testing: this.buildTestingConfig(params, recommendation),
      bundleAnalyzer: this.determineBundleAnalyzer(
        params.buildTool || recommendation.buildTool || "vite",
        features
      ),
    };
  }

  /**
   * 构建质量工具配置
   */
  private buildQualityToolsConfig(
    features: readonly string[]
  ): ScaffoldOptions["qualityTools"] {
    return {
      eslint: features.includes("eslint"),
      prettier: features.includes("prettier"),
      lintStaged: features.includes("lint-staged"),
      commitlint: features.includes("commitlint"),
      lsLint: features.includes("ls-lint"),
      husky: features.includes("lint-staged"), // husky 通常与 lint-staged 一起使用
      editorconfig: true, // EditorConfig 默认启用
    };
  }

  /**
   * 构建测试配置
   */
  private buildTestingConfig(
    params: CreateScaffoldParams,
    recommendation: Partial<ScaffoldOptions>
  ): ScaffoldOptions["testing"] {
    const buildTool = params.buildTool || recommendation.buildTool || "vite";
    const features = params.features || this.getDefaultFeatures();

    return {
      framework: buildTool === "vite" ? "vitest" : "jest",
      mockSolution: features.includes("mock")
        ? buildTool === "vite"
          ? "msw"
          : "webpack-proxy"
        : "msw",
    };
  }

  /**
   * 确定打包分析工具
   */
  private determineBundleAnalyzer(
    buildTool: string,
    features: readonly string[]
  ): ScaffoldOptions["bundleAnalyzer"] {
    if (!features.includes("bundle-analyzer")) {
      return buildTool === "vite"
        ? "rollup-plugin-visualizer"
        : "webpack-bundle-analyzer";
    }

    return buildTool === "vite"
      ? "rollup-plugin-visualizer"
      : "webpack-bundle-analyzer";
  }

  /**
   * 获取默认功能特性
   */
  private getDefaultFeatures(): readonly string[] {
    return [
      "eslint",
      "prettier",
      "lint-staged",
      "commitlint",
      "ls-lint",
      "testing",
      "mock",
      "bundle-analyzer",
    ] as const;
  }

  /**
   * 自动修复配置选项
   */
  autoFixOptions(options: ScaffoldOptions): ScaffoldOptions {
    let fixedTestingFramework = options.testing.framework;
    let fixedMockSolution = options.testing.mockSolution;
    let fixedBundleAnalyzer = options.bundleAnalyzer;
    let fixedUiLibrary = options.uiLibrary;

    // 自动修复测试框架
    if (options.buildTool === "vite" && options.testing.framework === "jest") {
      fixedTestingFramework = "vitest";
    } else if (
      options.buildTool === "webpack" &&
      options.testing.framework === "vitest"
    ) {
      fixedTestingFramework = "jest";
    }

    // 自动修复Mock方案
    if (
      options.buildTool === "vite" &&
      !["msw", "vite-plugin-mock"].includes(options.testing.mockSolution)
    ) {
      fixedMockSolution = "msw";
    } else if (
      options.buildTool === "webpack" &&
      !["webpack-proxy", "mocker-api", "msw"].includes(
        options.testing.mockSolution
      )
    ) {
      fixedMockSolution = "webpack-proxy";
    }

    // 自动修复打包分析工具
    if (options.buildTool === "vite") {
      fixedBundleAnalyzer = "rollup-plugin-visualizer";
    } else {
      fixedBundleAnalyzer = "webpack-bundle-analyzer";
    }

    // 自动修复UI组件库
    if (!options.uiLibrary) {
      const recommendation = this.recommendations[options.framework];
      if (recommendation?.uiLibrary) {
        fixedUiLibrary = recommendation.uiLibrary;
      }
    }

    // 返回新的不可变对象
    return {
      ...options,
      testing: {
        ...options.testing,
        framework: fixedTestingFramework,
        mockSolution: fixedMockSolution,
      },
      bundleAnalyzer: fixedBundleAnalyzer,
      uiLibrary: fixedUiLibrary,
    };
  }

  /**
   * 验证配置选项的完整性
   */
  validateOptions(options: ScaffoldOptions): {
    isValid: boolean;
    missingFields: string[];
  } {
    const requiredFields: (keyof ScaffoldOptions)[] = [
      "framework",
      "language",
      "buildTool",
      "styleFramework",
    ];

    const missingFields = requiredFields.filter((field) => !options[field]);

    return {
      isValid: missingFields.length === 0,
      missingFields,
    };
  }

  /**
   * 合并配置选项
   */
  mergeOptions(
    base: Partial<ScaffoldOptions>,
    overrides: Partial<ScaffoldOptions>
  ): Partial<ScaffoldOptions> {
    return {
      ...base,
      ...overrides,
      qualityTools: {
        eslint: false,
        prettier: false,
        lintStaged: false,
        commitlint: false,
        lsLint: false,
        husky: false,
        editorconfig: false,
        ...base.qualityTools,
        ...overrides.qualityTools,
      },
      testing: {
        framework: "vitest",
        mockSolution: "msw",
        ...base.testing,
        ...overrides.testing,
      },
    };
  }

  /**
   * 更新推荐配置
   */
  updateRecommendations(
    recommendations: Record<string, Partial<ScaffoldOptions>>
  ): void {
    this.recommendations = { ...this.recommendations, ...recommendations };
  }
}
