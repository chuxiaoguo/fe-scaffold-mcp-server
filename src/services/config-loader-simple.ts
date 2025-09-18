import {
  DependencyInfo,
  StackTemplate,
  ScaffoldOptions,
  PackageVersion,
} from "../types.js";
import { ErrorHandler, ErrorCode, Result } from "../core/error-handling-v2.js";

/**
 * 简化的配置文件加载服务
 * 避免直接依赖Node.js模块，使用内联配置
 */
export class ConfigLoader {
  private cache = new Map<string, unknown>();

  constructor() {
    // 预加载配置数据
    this.preloadConfigurations();
  }

  /**
   * 加载依赖配置
   */
  async loadDependencies(): Promise<Result<DependencyConfig>> {
    return this.getFromCache<DependencyConfig>("dependencies");
  }

  /**
   * 加载模板配置
   */
  async loadTemplates(): Promise<Result<StackTemplate[]>> {
    return this.getFromCache<StackTemplate[]>("templates");
  }

  /**
   * 加载脚本配置
   */
  async loadScripts(): Promise<Result<ScriptConfig>> {
    return this.getFromCache<ScriptConfig>("scripts");
  }

  /**
   * 加载推荐配置
   */
  async loadRecommendations(): Promise<
    Result<Record<string, Partial<ScaffoldOptions>>>
  > {
    return this.getFromCache<Record<string, Partial<ScaffoldOptions>>>(
      "recommendations"
    );
  }

  /**
   * 从缓存获取配置
   */
  private getFromCache<T>(key: string): Result<T> {
    return ErrorHandler.wrapSync(
      () => {
        const data = this.cache.get(key);
        if (!data) {
          throw new Error(`Configuration '${key}' not found`);
        }
        return data as T;
      },
      ErrorCode.CONFIG_NOT_FOUND,
      { key }
    );
  }

  /**
   * 预加载所有配置
   */
  private preloadConfigurations(): void {
    // 依赖配置
    this.cache.set("dependencies", this.createDependencyConfig());

    // 模板配置
    this.cache.set("templates", this.createTemplateConfig());

    // 脚本配置
    this.cache.set("scripts", this.createScriptConfig());

    // 推荐配置
    this.cache.set("recommendations", this.createRecommendationConfig());
  }

  /**
   * 创建依赖配置
   */
  private createDependencyConfig(): DependencyConfig {
    return {
      frameworks: {
        vue3: {
          dependencies: [
            {
              name: "vue",
              version: PackageVersion("^3.4.0"),
              type: "production",
            },
          ],
          devDependencies: [
            {
              name: "@vitejs/plugin-vue",
              version: PackageVersion("^5.0.0"),
              type: "development",
            },
          ],
        },
        react: {
          dependencies: [
            {
              name: "react",
              version: PackageVersion("^18.2.0"),
              type: "production",
            },
            {
              name: "react-dom",
              version: PackageVersion("^18.2.0"),
              type: "production",
            },
          ],
          devDependencies: [
            {
              name: "@vitejs/plugin-react",
              version: PackageVersion("^4.2.0"),
              type: "development",
            },
          ],
        },
      },
      buildTools: {
        vite: {
          devDependencies: [
            {
              name: "vite",
              version: PackageVersion("^5.0.0"),
              type: "development",
            },
          ],
        },
        webpack: {
          devDependencies: [
            {
              name: "webpack",
              version: PackageVersion("^5.89.0"),
              type: "development",
            },
          ],
        },
      },
      qualityTools: {
        eslint: [
          {
            name: "eslint",
            version: PackageVersion("^8.55.0"),
            type: "development",
          },
        ],
        prettier: [
          {
            name: "prettier",
            version: PackageVersion("^3.1.0"),
            type: "development",
          },
        ],
      },
      styleFrameworks: {
        tailwind: [
          {
            name: "tailwindcss",
            version: PackageVersion("^3.3.0"),
            type: "development",
          },
        ],
      },
      uiLibraries: {
        "element-plus": [
          {
            name: "element-plus",
            version: PackageVersion("^2.4.0"),
            type: "production",
          },
        ],
        antd: [
          {
            name: "antd",
            version: PackageVersion("^5.12.0"),
            type: "production",
          },
        ],
      },
      testing: {
        vitest: [
          {
            name: "vitest",
            version: PackageVersion("^1.0.0"),
            type: "development",
          },
        ],
        jest: [
          {
            name: "jest",
            version: PackageVersion("^29.7.0"),
            type: "development",
          },
        ],
      },
      mockSolutions: {
        msw: [
          {
            name: "msw",
            version: PackageVersion("^2.0.0"),
            type: "development",
          },
        ],
      },
      bundleAnalyzer: {
        "rollup-plugin-visualizer": [
          {
            name: "rollup-plugin-visualizer",
            version: PackageVersion("^5.10.0"),
            type: "development",
          },
        ],
      },
      typescript: [
        {
          name: "typescript",
          version: PackageVersion("^5.3.0"),
          type: "development",
        },
      ],
    };
  }

  /**
   * 创建模板配置
   */
  private createTemplateConfig(): StackTemplate[] {
    return [
      {
        id: "vue3-vite-modern",
        name: "Vue3 + Vite + TypeScript (现代化)",
        description: "使用Vue3、Vite、TypeScript的现代化Vue开发栈",
        category: "official",
        complexity: "standard",
        framework: "vue3",
        buildTool: "vite",
        defaultOptions: {
          language: "typescript",
          styleFramework: "tailwind",
          uiLibrary: "element-plus",
        },
        supportedFeatures: ["TypeScript支持", "Element Plus UI组件库"],
        requiredFeatures: ["eslint", "prettier"],
        incompatibleFeatures: [],
        tags: ["vue3", "vite", "typescript"],
        version: "1.0.0" as any,
        author: "FE Scaffold Generator",
        createdAt: new Date("2024-01-01"),
        updatedAt: new Date("2024-01-01"),
      },
    ];
  }

  /**
   * 创建脚本配置
   */
  private createScriptConfig(): ScriptConfig {
    return {
      vite: {
        dev: "vite",
        build: "vite build",
        preview: "vite preview",
      },
      webpack: {
        dev: "webpack serve --mode development",
        build: "webpack --mode production",
      },
      typescript: {
        "type-check": "vue-tsc --noEmit",
      },
      testing: {
        vitest: {
          test: "vitest",
          "test:ui": "vitest --ui",
        },
        jest: {
          test: "jest",
          "test:watch": "jest --watch",
        },
      },
      qualityTools: {
        eslint: {
          lint: "eslint . --ext .ts,.tsx,.js,.jsx,.vue",
          "lint:fix": "eslint . --ext .ts,.tsx,.js,.jsx,.vue --fix",
        },
        prettier: {
          format: "prettier --write .",
        },
      },
    };
  }

  /**
   * 创建推荐配置
   */
  private createRecommendationConfig(): Record<
    string,
    Partial<ScaffoldOptions>
  > {
    return {
      vue3: {
        framework: "vue3",
        language: "typescript",
        buildTool: "vite",
        styleFramework: "tailwind",
        uiLibrary: "element-plus",
      },
      react: {
        framework: "react",
        language: "typescript",
        buildTool: "vite",
        styleFramework: "tailwind",
        uiLibrary: "antd",
      },
    };
  }

  /**
   * 清除缓存
   */
  clearCache(): void {
    this.cache.clear();
    this.preloadConfigurations();
  }
}

/**
 * 依赖配置接口
 */
export interface DependencyConfig {
  frameworks: Record<
    string,
    {
      dependencies: DependencyInfo[];
      devDependencies: DependencyInfo[];
    }
  >;
  buildTools: Record<
    string,
    {
      devDependencies: DependencyInfo[];
    }
  >;
  qualityTools: Record<string, DependencyInfo[]>;
  styleFrameworks: Record<string, DependencyInfo[]>;
  uiLibraries: Record<string, DependencyInfo[]>;
  testing: Record<string, DependencyInfo[]>;
  mockSolutions: Record<string, DependencyInfo[]>;
  bundleAnalyzer: Record<string, DependencyInfo[]>;
  typescript: DependencyInfo[];
}

/**
 * 脚本配置接口
 */
export interface ScriptConfig {
  vite: Record<string, string>;
  webpack: Record<string, string>;
  typescript: Record<string, string>;
  testing: Record<string, Record<string, string>>;
  qualityTools: Record<string, Record<string, string>>;
}
