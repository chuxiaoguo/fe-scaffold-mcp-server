/**
 * 项目配置管理
 */

export interface ProjectConfig {
  dependencies: DependencyConfig;
  templates: TemplateConfig;
  frameworks: FrameworkConfig;
  registry: RegistryConfig;
  paths: PathConfig;
}

export interface DependencyConfig {
  versions: Record<string, string>;
  updatePolicy: 'latest' | 'stable' | 'fixed';
  registries: Record<string, string>;
}

export interface TemplateConfig {
  basePath: string;
  mapping: Record<string, string>;
  sharedConfigs: string[];
  optionalConfigs: Record<string, string[]>;
}

export interface FrameworkConfig {
  [framework: string]: {
    defaultBuildTool: string;
    defaultLanguage: string;
    defaultStyleFramework: string;
    defaultUILibrary: string;
    supportedBuildTools: string[];
    supportedUILibraries: string[];
    requiredDependencies: string[];
    recommendedFeatures: string[];
  };
}

export interface RegistryConfig {
  npm: string;
  yarn: string;
  pnpm: string;
  default: 'npm' | 'yarn' | 'pnpm';
  mirrors: Record<string, string>;
}

export interface PathConfig {
  templates: string;
  shared: string;
  configs: string;
  output: string;
}

/**
 * 默认项目配置
 */
export const DEFAULT_CONFIG: ProjectConfig = {
  dependencies: {
    updatePolicy: 'stable',
    versions: {
      // 基础框架
      'vue': '^3.4.0',
      'vue2': '^2.7.0',
      'react': '^18.2.0',
      'react-dom': '^18.2.0',
      
      // 构建工具
      'vite': '^5.0.0',
      'webpack': '^5.89.0',
      'webpack-cli': '^5.1.0',
      'webpack-dev-server': '^4.15.0',
      'html-webpack-plugin': '^5.5.0',
      
      // TypeScript
      'typescript': '^5.3.0',
      '@types/node': '^20.0.0',
      '@types/react': '^18.2.0',
      '@types/react-dom': '^18.2.0',
      
      // Vue 相关
      '@vitejs/plugin-vue': '^5.0.0',
      '@vitejs/plugin-vue2': '^2.3.0',
      '@vue/tsconfig': '^0.5.0',
      '@vue/test-utils': '^2.4.0',
      '@vue/eslint-config-prettier': '^9.0.0',
      '@vue/eslint-config-typescript': '^12.0.0',
      'vue-tsc': '^2.0.0',
      
      // React 相关
      '@vitejs/plugin-react': '^4.2.0',
      
      // 代码质量工具
      'eslint': '^8.55.0',
      '@typescript-eslint/parser': '^6.14.0',
      '@typescript-eslint/eslint-plugin': '^6.14.0',
      'eslint-plugin-vue': '^9.22.0',
      'prettier': '^3.1.0',
      'eslint-config-prettier': '^9.1.0',
      'lint-staged': '^15.2.0',
      'husky': '^8.0.3',
      '@commitlint/cli': '^18.4.0',
      '@commitlint/config-conventional': '^18.4.0',
      'ls-lint': '^0.1.2',
      
      // 样式框架
      'tailwindcss': '^3.3.0',
      'autoprefixer': '^10.4.0',
      'postcss': '^8.4.0',
      'sass': '^1.69.0',
      'less': '^4.2.0',
      
      // UI组件库
      'element-ui': '^2.15.0',
      'element-plus': '^2.4.0',
      '@element-plus/icons-vue': '^2.1.0',
      'antd': '^5.12.0',
      '@ant-design/icons': '^5.2.0',
      
      // 测试框架
      'vitest': '^1.0.0',
      '@vitest/ui': '^1.0.0',
      '@vitest/coverage-v8': '^1.4.0',
      'jsdom': '^23.0.0',
      'jest': '^29.7.0',
      '@types/jest': '^29.5.0',
      'ts-jest': '^29.1.0',
      '@testing-library/react': '^14.0.0',
      '@testing-library/jest-dom': '^6.1.0',
      
      // Mock方案
      'msw': '^2.0.0',
      'vite-plugin-mock': '^3.0.0',
      'mocker-api': '^2.9.0',
      
      // 打包分析
      'rollup-plugin-visualizer': '^5.10.0',
      'webpack-bundle-analyzer': '^4.10.0',
    },
    registries: {
      npm: 'https://registry.npmmirror.com/',
      yarn: 'https://registry.npmmirror.com/',
      pnpm: 'https://registry.npmmirror.com/',
    },
  },
  
  templates: {
    basePath: 'templates',
    mapping: {
      'vue3-vite': 'vue3-vite',
      'vue3-webpack': 'vue3-webpack',
      'vue2-vite': 'vue2-vite',
      'vue2-webpack': 'vue2-webpack',
      'react-vite': 'react-vite',
      'react-webpack': 'react-webpack',
    },
    sharedConfigs: [
      '_prettierrc.json',
      '_gitignore',
      '_npmrc',
      '_editorconfig',
    ],
    optionalConfigs: {
      eslint: ['_eslintrc.vue.cjs', '_eslintrc.react.cjs'],
      tailwind: ['_tailwind.config.cjs', '_postcss.config.js'],
      vitest: ['_vitest.config.ts'],
      commitlint: ['_commitlint.config.js'],
      lintStaged: ['_lint-staged.config.js'],
      lsLint: ['_ls-lint.yml'],
      husky: ['_husky/pre-commit', '_husky/commit-msg'],
    },
  },
  
  frameworks: {
    vue3: {
      defaultBuildTool: 'vite',
      defaultLanguage: 'typescript',
      defaultStyleFramework: 'tailwind',
      defaultUILibrary: 'element-plus',
      supportedBuildTools: ['vite', 'webpack'],
      supportedUILibraries: ['element-plus', 'antd'],
      requiredDependencies: ['vue', '@vitejs/plugin-vue'],
      recommendedFeatures: ['eslint', 'prettier', 'testing', 'typescript'],
    },
    vue2: {
      defaultBuildTool: 'vite',
      defaultLanguage: 'typescript',
      defaultStyleFramework: 'tailwind',
      defaultUILibrary: 'element-ui',
      supportedBuildTools: ['vite', 'webpack'],
      supportedUILibraries: ['element-ui'],
      requiredDependencies: ['vue', '@vitejs/plugin-vue2'],
      recommendedFeatures: ['eslint', 'prettier', 'testing'],
    },
    react: {
      defaultBuildTool: 'vite',
      defaultLanguage: 'typescript',
      defaultStyleFramework: 'tailwind',
      defaultUILibrary: 'antd',
      supportedBuildTools: ['vite', 'webpack'],
      supportedUILibraries: ['antd'],
      requiredDependencies: ['react', 'react-dom', '@vitejs/plugin-react'],
      recommendedFeatures: ['eslint', 'prettier', 'testing', 'typescript'],
    },
  },
  
  registry: {
    npm: 'https://registry.npmmirror.com/',
    yarn: 'https://registry.npmmirror.com/',
    pnpm: 'https://registry.npmmirror.com/',
    default: 'npm',
    mirrors: {
      'sass_binary_site': 'https://npmmirror.com/mirrors/node-sass/',
      'phantomjs_cdnurl': 'https://npmmirror.com/mirrors/phantomjs/',
      'electron_mirror': 'https://npmmirror.com/mirrors/electron/',
      'sqlite3_binary_host_mirror': 'https://npmmirror.com/mirrors/',
      'profiler_binary_host_mirror': 'https://npmmirror.com/mirrors/node-inspector/',
      'chromedriver_cdnurl': 'https://npmmirror.com/mirrors/chromedriver/',
    },
  },
  
  paths: {
    templates: 'templates',
    shared: 'templates/shared',
    configs: 'templates/shared/configs',
    output: 'dist',
  },
};

/**
 * 配置管理器
 */
export class ConfigManager {
  private static instance: ConfigManager;
  private config: ProjectConfig;

  private constructor() {
    this.config = { ...DEFAULT_CONFIG };
  }

  static getInstance(): ConfigManager {
    if (!ConfigManager.instance) {
      ConfigManager.instance = new ConfigManager();
    }
    return ConfigManager.instance;
  }

  /**
   * 获取完整配置
   */
  getConfig(): ProjectConfig {
    return this.config;
  }

  /**
   * 获取依赖版本
   */
  getDependencyVersion(packageName: string): string {
    return this.config.dependencies.versions[packageName] || 'latest';
  }

  /**
   * 获取框架配置
   */
  getFrameworkConfig(framework: string) {
    return this.config.frameworks[framework];
  }

  /**
   * 获取模板映射
   */
  getTemplateMapping(key: string): string {
    return this.config.templates.mapping[key] || 'vue3-vite';
  }

  /**
   * 获取注册表配置
   */
  getRegistryConfig(): RegistryConfig {
    return this.config.registry;
  }

  /**
   * 更新配置
   */
  updateConfig(partialConfig: Partial<ProjectConfig>): void {
    this.config = { ...this.config, ...partialConfig };
  }

  /**
   * 重置为默认配置
   */
  resetConfig(): void {
    this.config = { ...DEFAULT_CONFIG };
  }
}

// 导出单例实例
export const configManager = ConfigManager.getInstance();