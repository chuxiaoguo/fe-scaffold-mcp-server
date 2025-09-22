import {
  DependencyInfo,
  ScaffoldOptions,
  DependencyType,
  DependencyTypeEnum,
  PackageVersion,
} from "../types.js";
import { configManager } from "../config/index.js";

/**
 * 依赖包版本管理
 */
export class DependencyManager {
  // 便利函数来创建依赖项
  private static dep(
    name: string,
    type: DependencyType,
    customVersion?: string
  ): DependencyInfo {
    const version = customVersion || configManager.getDependencyVersion(name);
    return {
      name,
      version: version as PackageVersion,
      type,
    };
  }

  private static readonly DEPENDENCY_MATRIX = {
    // 基础框架依赖
    frameworks: {
      vue3: {
        dependencies: [
          this.dep("vue", DependencyTypeEnum.PRODUCTION),
        ],
        devDependencies: [
          this.dep("@vitejs/plugin-vue", DependencyTypeEnum.DEVELOPMENT),
          this.dep("@vue/tsconfig", DependencyTypeEnum.DEVELOPMENT),
        ],
      },
      vue2: {
        dependencies: [
          this.dep("vue", DependencyTypeEnum.PRODUCTION, "^2.7.0"),
        ],
        devDependencies: [
          this.dep("@vitejs/plugin-vue2", DependencyTypeEnum.DEVELOPMENT),
        ],
      },
      react: {
        dependencies: [
          this.dep("react", DependencyTypeEnum.PRODUCTION),
          this.dep("react-dom", DependencyTypeEnum.PRODUCTION),
        ],
        devDependencies: [
          this.dep("@vitejs/plugin-react", DependencyTypeEnum.DEVELOPMENT),
          this.dep("@types/react", DependencyTypeEnum.DEVELOPMENT),
          this.dep("@types/react-dom", DependencyTypeEnum.DEVELOPMENT),
        ],
      },
    },

    // 构建工具
    buildTools: {
      vite: {
        devDependencies: [
          this.dep("vite", DependencyTypeEnum.DEVELOPMENT),
        ],
      },
      webpack: {
        devDependencies: [
          this.dep("webpack", DependencyTypeEnum.DEVELOPMENT),
          this.dep("webpack-cli", DependencyTypeEnum.DEVELOPMENT),
          this.dep("webpack-dev-server", DependencyTypeEnum.DEVELOPMENT),
          this.dep("html-webpack-plugin", DependencyTypeEnum.DEVELOPMENT),
        ],
      },
    },

    // 代码质量工具
    qualityTools: {
      eslint: [
        this.dep("eslint", DependencyTypeEnum.DEVELOPMENT),
        this.dep("@typescript-eslint/parser", DependencyTypeEnum.DEVELOPMENT),
        this.dep("@typescript-eslint/eslint-plugin", DependencyTypeEnum.DEVELOPMENT),
      ],
      prettier: [
        this.dep("prettier", DependencyTypeEnum.DEVELOPMENT),
        this.dep("eslint-config-prettier", DependencyTypeEnum.DEVELOPMENT),
      ],
      lintStaged: [
        this.dep("lint-staged", DependencyTypeEnum.DEVELOPMENT),
        this.dep("husky", DependencyTypeEnum.DEVELOPMENT),
      ],
      commitlint: [
        this.dep("@commitlint/cli", DependencyTypeEnum.DEVELOPMENT),
        this.dep("@commitlint/config-conventional", DependencyTypeEnum.DEVELOPMENT),
      ],
      lsLint: [this.dep("ls-lint", DependencyTypeEnum.DEVELOPMENT)],
      husky: [this.dep("husky", DependencyTypeEnum.DEVELOPMENT)],
      editorconfig: [
        // EditorConfig 本身不需要 npm 包，只需要 .editorconfig 文件
      ],
    },

    // 样式框架
    styleFrameworks: {
      tailwind: [
        this.dep("tailwindcss", DependencyTypeEnum.DEVELOPMENT),
        this.dep("autoprefixer", DependencyTypeEnum.DEVELOPMENT),
        this.dep("postcss", DependencyTypeEnum.DEVELOPMENT),
      ],
      sass: [this.dep("sass", DependencyTypeEnum.DEVELOPMENT)],
      less: [this.dep("less", DependencyTypeEnum.DEVELOPMENT)],
    },

    // UI组件库
    uiLibraries: {
      "element-ui": [
        this.dep("element-ui", DependencyTypeEnum.PRODUCTION),
      ],
      "element-plus": [
        this.dep("element-plus", DependencyTypeEnum.PRODUCTION),
        this.dep("@element-plus/icons-vue", DependencyTypeEnum.PRODUCTION),
      ],
      antd: [
        this.dep("antd", DependencyTypeEnum.PRODUCTION),
        this.dep("@ant-design/icons", DependencyTypeEnum.PRODUCTION),
      ],
    },

    // 测试框架
    testing: {
      vitest: [
        this.dep("vitest", DependencyTypeEnum.DEVELOPMENT),
        this.dep("@vitest/ui", DependencyTypeEnum.DEVELOPMENT),
        this.dep("jsdom", DependencyTypeEnum.DEVELOPMENT),
        this.dep("@vue/test-utils", DependencyTypeEnum.DEVELOPMENT),
        this.dep("@testing-library/react", DependencyTypeEnum.DEVELOPMENT),
        this.dep("@testing-library/jest-dom", DependencyTypeEnum.DEVELOPMENT),
      ],
      jest: [
        this.dep("jest", DependencyTypeEnum.DEVELOPMENT),
        this.dep("@types/jest", DependencyTypeEnum.DEVELOPMENT),
        this.dep("ts-jest", DependencyTypeEnum.DEVELOPMENT),
        this.dep("@vue/test-utils", DependencyTypeEnum.DEVELOPMENT),
        this.dep("@testing-library/react", DependencyTypeEnum.DEVELOPMENT),
        this.dep("@testing-library/jest-dom", DependencyTypeEnum.DEVELOPMENT),
      ],
    },

    // Mock方案
    mock: {
      msw: [this.dep("msw", DependencyTypeEnum.DEVELOPMENT)],
      "vite-plugin-mock": [
        this.dep("vite-plugin-mock", DependencyTypeEnum.DEVELOPMENT),
      ],
      "mocker-api": [
        this.dep("mocker-api", DependencyTypeEnum.DEVELOPMENT),
      ],
      "webpack-proxy": [
        // webpack-dev-server 内置代理功能，不需要额外包
      ],
    },

    // 打包分析
    bundleAnalyzer: {
      "rollup-plugin-visualizer": [
        this.dep("rollup-plugin-visualizer", DependencyTypeEnum.DEVELOPMENT),
      ],
      "webpack-bundle-analyzer": [
        this.dep("webpack-bundle-analyzer", DependencyTypeEnum.DEVELOPMENT),
      ],
    },

    // TypeScript
    typescript: [
      this.dep("typescript", DependencyTypeEnum.DEVELOPMENT),
    ],
  } as const;

  /**
   * 获取项目依赖
   */
  static getDependencies(options: ScaffoldOptions): {
    dependencies: DependencyInfo[];
    devDependencies: DependencyInfo[];
  } {
    const dependencies: DependencyInfo[] = [];
    const devDependencies: DependencyInfo[] = [];

    // 基础框架
    const frameworkDeps = this.DEPENDENCY_MATRIX.frameworks[options.framework];
    dependencies.push(...frameworkDeps.dependencies);
    devDependencies.push(...frameworkDeps.devDependencies);

    // 构建工具
    const buildToolDeps = this.DEPENDENCY_MATRIX.buildTools[options.buildTool];
    devDependencies.push(...buildToolDeps.devDependencies);

    // TypeScript
    if (options.language === "typescript") {
      devDependencies.push(...this.DEPENDENCY_MATRIX.typescript);
    }

    // 代码质量工具
    Object.entries(options.qualityTools).forEach(([tool, enabled]) => {
      if (enabled && tool in this.DEPENDENCY_MATRIX.qualityTools) {
        devDependencies.push(
          ...this.DEPENDENCY_MATRIX.qualityTools[
            tool as keyof typeof this.DEPENDENCY_MATRIX.qualityTools
          ]
        );
      }
    });

    // 样式框架
    devDependencies.push(
      ...this.DEPENDENCY_MATRIX.styleFrameworks[options.styleFramework]
    );

    // UI组件库
    if (
      options.uiLibrary &&
      options.uiLibrary in this.DEPENDENCY_MATRIX.uiLibraries
    ) {
      dependencies.push(
        ...this.DEPENDENCY_MATRIX.uiLibraries[
          options.uiLibrary as keyof typeof this.DEPENDENCY_MATRIX.uiLibraries
        ]
      );
    }

    // 测试框架
    devDependencies.push(
      ...this.DEPENDENCY_MATRIX.testing[options.testing.framework]
    );

    // Mock方案
    if (options.testing.mockSolution in this.DEPENDENCY_MATRIX.mock) {
      devDependencies.push(
        ...this.DEPENDENCY_MATRIX.mock[
          options.testing
            .mockSolution as keyof typeof this.DEPENDENCY_MATRIX.mock
        ]
      );
    }

    // 打包分析
    devDependencies.push(
      ...this.DEPENDENCY_MATRIX.bundleAnalyzer[options.bundleAnalyzer]
    );

    return { dependencies, devDependencies };
  }

  /**
   * 生成package.json的scripts
   */
  static generateScripts(options: ScaffoldOptions): Record<string, string> {
    const scripts: Record<string, string> = {};

    if (options.buildTool === "vite") {
      scripts.dev = "vite";
      scripts.build =
        options.language === "typescript"
          ? "vue-tsc && vite build"
          : "vite build";
      scripts.preview = "vite preview";
    } else {
      scripts.dev = "webpack serve --mode development";
      scripts.build = "webpack --mode production";
    }

    // 测试脚本
    if (options.testing.framework === "vitest") {
      scripts.test = "vitest";
      scripts["test:ui"] = "vitest --ui";
    } else {
      scripts.test = "jest";
      scripts["test:watch"] = "jest --watch";
    }

    // 代码质量脚本
    if (options.qualityTools.eslint) {
      scripts.lint = "eslint . --ext .ts,.tsx,.js,.jsx,.vue";
      scripts["lint:fix"] = "eslint . --ext .ts,.tsx,.js,.jsx,.vue --fix";
    }

    if (options.qualityTools.prettier) {
      scripts.format = "prettier --write .";
    }

    if (options.qualityTools.lsLint) {
      scripts["lint:ls"] = "ls-lint";
    }

    // 打包分析脚本
    if (options.bundleAnalyzer === "rollup-plugin-visualizer") {
      scripts.analyze = "vite build --mode analyze";
    } else {
      scripts.analyze = "webpack-bundle-analyzer dist/stats.json";
    }

    // TypeScript类型检查
    if (options.language === "typescript") {
      scripts["type-check"] = "vue-tsc --noEmit";
    }

    return scripts;
  }
}
