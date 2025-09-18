import { DependencyInfo, ScaffoldOptions, DependencyType, PackageVersion } from '../types.js';

/**
 * 依赖包版本管理
 */
export class DependencyManager {
  // 便利函数来创建依赖项
  private static dep(name: string, version: string, type: DependencyType): DependencyInfo {
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
          this.dep('vue', '^3.4.0', DependencyType.PRODUCTION),
        ],
        devDependencies: [
          this.dep('@vitejs/plugin-vue', '^5.0.0', DependencyType.DEVELOPMENT),
          this.dep('@vue/tsconfig', '^0.5.0', DependencyType.DEVELOPMENT),
        ],
      },
      vue2: {
        dependencies: [
          this.dep('vue', '^2.7.0', DependencyType.PRODUCTION),
        ],
        devDependencies: [
          this.dep('@vitejs/plugin-vue2', '^2.3.0', DependencyType.DEVELOPMENT),
        ],
      },
      react: {
        dependencies: [
          this.dep('react', '^18.2.0', DependencyType.PRODUCTION),
          this.dep('react-dom', '^18.2.0', DependencyType.PRODUCTION),
        ],
        devDependencies: [
          this.dep('@vitejs/plugin-react', '^4.2.0', DependencyType.DEVELOPMENT),
          this.dep('@types/react', '^18.2.0', DependencyType.DEVELOPMENT),
          this.dep('@types/react-dom', '^18.2.0', DependencyType.DEVELOPMENT),
        ],
      },
      angular: {
        dependencies: [
          this.dep('@angular/core', '^17.0.0', DependencyType.PRODUCTION),
          this.dep('@angular/common', '^17.0.0', DependencyType.PRODUCTION),
          this.dep('@angular/platform-browser', '^17.0.0', DependencyType.PRODUCTION),
        ],
        devDependencies: [
          this.dep('@angular/cli', '^17.0.0', DependencyType.DEVELOPMENT),
          this.dep('@angular/compiler-cli', '^17.0.0', DependencyType.DEVELOPMENT),
        ],
      },
      svelte: {
        dependencies: [
          this.dep('svelte', '^4.2.0', DependencyType.PRODUCTION),
        ],
        devDependencies: [
          this.dep('@sveltejs/vite-plugin-svelte', '^3.0.0', DependencyType.DEVELOPMENT),
        ],
      },
    },

    // 构建工具
    buildTools: {
      vite: {
        devDependencies: [
          this.dep('vite', '^5.0.0', DependencyType.DEVELOPMENT),
        ],
      },
      webpack: {
        devDependencies: [
          this.dep('webpack', '^5.89.0', DependencyType.DEVELOPMENT),
          this.dep('webpack-cli', '^5.1.0', DependencyType.DEVELOPMENT),
          this.dep('webpack-dev-server', '^4.15.0', DependencyType.DEVELOPMENT),
          this.dep('html-webpack-plugin', '^5.5.0', DependencyType.DEVELOPMENT),
        ],
      },
      rollup: {
        devDependencies: [
          this.dep('rollup', '^4.6.0', DependencyType.DEVELOPMENT),
          this.dep('@rollup/plugin-node-resolve', '^15.2.0', DependencyType.DEVELOPMENT),
        ],
      },
      parcel: {
        devDependencies: [
          this.dep('parcel', '^2.10.0', DependencyType.DEVELOPMENT),
        ],
      },
    },

    // 代码质量工具
    qualityTools: {
      eslint: [
        this.dep('eslint', '^8.55.0', DependencyType.DEVELOPMENT),
        this.dep('@typescript-eslint/parser', '^6.14.0', DependencyType.DEVELOPMENT),
        this.dep('@typescript-eslint/eslint-plugin', '^6.14.0', DependencyType.DEVELOPMENT),
      ],
      prettier: [
        this.dep('prettier', '^3.1.0', DependencyType.DEVELOPMENT),
        this.dep('eslint-config-prettier', '^9.1.0', DependencyType.DEVELOPMENT),
      ],
      lintStaged: [
        this.dep('lint-staged', '^15.2.0', DependencyType.DEVELOPMENT),
        this.dep('husky', '^8.0.3', DependencyType.DEVELOPMENT),
      ],
      commitlint: [
        this.dep('@commitlint/cli', '^18.4.0', DependencyType.DEVELOPMENT),
        this.dep('@commitlint/config-conventional', '^18.4.0', DependencyType.DEVELOPMENT),
      ],
      lsLint: [
        this.dep('ls-lint', '^2.2.3', DependencyType.DEVELOPMENT),
      ],
      husky: [
        this.dep('husky', '^8.0.3', DependencyType.DEVELOPMENT),
      ],
      editorconfig: [
        // EditorConfig 本身不需要 npm 包，只需要 .editorconfig 文件
      ],
    },

    // 样式框架
    styleFrameworks: {
      tailwind: [
        this.dep('tailwindcss', '^3.3.0', DependencyType.DEVELOPMENT),
        this.dep('autoprefixer', '^10.4.0', DependencyType.DEVELOPMENT),
        this.dep('postcss', '^8.4.0', DependencyType.DEVELOPMENT),
      ],
      sass: [
        this.dep('sass', '^1.69.0', DependencyType.DEVELOPMENT),
      ],
      less: [
        this.dep('less', '^4.2.0', DependencyType.DEVELOPMENT),
      ],
      'styled-components': [
        this.dep('styled-components', '^6.1.0', DependencyType.PRODUCTION),
        this.dep('@types/styled-components', '^5.1.0', DependencyType.DEVELOPMENT),
      ],
      emotion: [
        this.dep('@emotion/react', '^11.11.0', DependencyType.PRODUCTION),
        this.dep('@emotion/styled', '^11.11.0', DependencyType.PRODUCTION),
      ],
    },

    // UI组件库
    uiLibraries: {
      'element-ui': [
        this.dep('element-ui', '^2.15.0', DependencyType.PRODUCTION),
      ],
      'element-plus': [
        this.dep('element-plus', '^2.4.0', DependencyType.PRODUCTION),
        this.dep('@element-plus/icons-vue', '^2.1.0', DependencyType.PRODUCTION),
      ],
      antd: [
        this.dep('antd', '^5.12.0', DependencyType.PRODUCTION),
        this.dep('@ant-design/icons', '^5.2.0', DependencyType.PRODUCTION),
      ],
    },

    // 测试框架
    testing: {
      vitest: [
        this.dep('vitest', '^1.0.0', DependencyType.DEVELOPMENT),
        this.dep('@vitest/ui', '^1.0.0', DependencyType.DEVELOPMENT),
        this.dep('jsdom', '^23.0.0', DependencyType.DEVELOPMENT),
        this.dep('@vue/test-utils', '^2.4.0', DependencyType.DEVELOPMENT),
        this.dep('@testing-library/react', '^14.0.0', DependencyType.DEVELOPMENT),
        this.dep('@testing-library/jest-dom', '^6.1.0', DependencyType.DEVELOPMENT),
      ],
      jest: [
        this.dep('jest', '^29.7.0', DependencyType.DEVELOPMENT),
        this.dep('@types/jest', '^29.5.0', DependencyType.DEVELOPMENT),
        this.dep('ts-jest', '^29.1.0', DependencyType.DEVELOPMENT),
        this.dep('@vue/test-utils', '^2.4.0', DependencyType.DEVELOPMENT),
        this.dep('@testing-library/react', '^14.0.0', DependencyType.DEVELOPMENT),
        this.dep('@testing-library/jest-dom', '^6.1.0', DependencyType.DEVELOPMENT),
      ],
      playwright: [
        this.dep('@playwright/test', '^1.40.0', DependencyType.DEVELOPMENT),
      ],
      cypress: [
        this.dep('cypress', '^13.6.0', DependencyType.DEVELOPMENT),
      ],
    },

    // Mock方案
    mock: {
      msw: [
        this.dep('msw', '^2.0.0', DependencyType.DEVELOPMENT),
      ],
      'vite-plugin-mock': [
        this.dep('vite-plugin-mock', '^3.0.0', DependencyType.DEVELOPMENT),
      ],
      'mocker-api': [
        this.dep('mocker-api', '^2.9.0', DependencyType.DEVELOPMENT),
      ],
      'webpack-proxy': [
        // webpack-dev-server 内置代理功能，不需要额外包
      ],
      'json-server': [
        this.dep('json-server', '^0.17.4', DependencyType.DEVELOPMENT),
      ],
    },

    // 打包分析
    bundleAnalyzer: {
      'rollup-plugin-visualizer': [
        this.dep('rollup-plugin-visualizer', '^5.10.0', DependencyType.DEVELOPMENT),
      ],
      'webpack-bundle-analyzer': [
        this.dep('webpack-bundle-analyzer', '^4.10.0', DependencyType.DEVELOPMENT),
      ],
      'parcel-analyzer': [
        this.dep('@parcel/reporter-bundle-analyzer', '^2.10.0', DependencyType.DEVELOPMENT),
      ],
    },

    // TypeScript
    typescript: [
      this.dep('typescript', '^5.3.0', DependencyType.DEVELOPMENT),
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
    if (options.language === 'typescript') {
      devDependencies.push(...this.DEPENDENCY_MATRIX.typescript);
    }

    // 代码质量工具
    Object.entries(options.qualityTools).forEach(([tool, enabled]) => {
      if (enabled && tool in this.DEPENDENCY_MATRIX.qualityTools) {
        devDependencies.push(
          ...this.DEPENDENCY_MATRIX.qualityTools[tool as keyof typeof this.DEPENDENCY_MATRIX.qualityTools]
        );
      }
    });

    // 样式框架
    devDependencies.push(...this.DEPENDENCY_MATRIX.styleFrameworks[options.styleFramework]);

    // UI组件库
    if (options.uiLibrary && options.uiLibrary in this.DEPENDENCY_MATRIX.uiLibraries) {
      dependencies.push(
        ...this.DEPENDENCY_MATRIX.uiLibraries[options.uiLibrary as keyof typeof this.DEPENDENCY_MATRIX.uiLibraries]
      );
    }

    // 测试框架
    devDependencies.push(...this.DEPENDENCY_MATRIX.testing[options.testing.framework]);

    // Mock方案
    if (options.testing.mockSolution in this.DEPENDENCY_MATRIX.mock) {
      devDependencies.push(
        ...this.DEPENDENCY_MATRIX.mock[options.testing.mockSolution as keyof typeof this.DEPENDENCY_MATRIX.mock]
      );
    }

    // 打包分析
    devDependencies.push(...this.DEPENDENCY_MATRIX.bundleAnalyzer[options.bundleAnalyzer]);

    return { dependencies, devDependencies };
  }

  /**
   * 生成package.json的scripts
   */
  static generateScripts(options: ScaffoldOptions): Record<string, string> {
    const scripts: Record<string, string> = {};

    if (options.buildTool === 'vite') {
      scripts.dev = 'vite';
      scripts.build = options.language === 'typescript' ? 'vue-tsc && vite build' : 'vite build';
      scripts.preview = 'vite preview';
    } else {
      scripts.dev = 'webpack serve --mode development';
      scripts.build = 'webpack --mode production';
    }

    // 测试脚本
    if (options.testing.framework === 'vitest') {
      scripts.test = 'vitest';
      scripts['test:ui'] = 'vitest --ui';
    } else {
      scripts.test = 'jest';
      scripts['test:watch'] = 'jest --watch';
    }

    // 代码质量脚本
    if (options.qualityTools.eslint) {
      scripts.lint = 'eslint . --ext .ts,.tsx,.js,.jsx,.vue';
      scripts['lint:fix'] = 'eslint . --ext .ts,.tsx,.js,.jsx,.vue --fix';
    }

    if (options.qualityTools.prettier) {
      scripts.format = 'prettier --write .';
    }

    if (options.qualityTools.lsLint) {
      scripts['lint:ls'] = 'ls-lint';
    }

    // 打包分析脚本
    if (options.bundleAnalyzer === 'rollup-plugin-visualizer') {
      scripts.analyze = 'vite build --mode analyze';
    } else {
      scripts.analyze = 'webpack-bundle-analyzer dist/stats.json';
    }

    // TypeScript类型检查
    if (options.language === 'typescript') {
      scripts['type-check'] = 'vue-tsc --noEmit';
    }

    return scripts;
  }
}