import { ScaffoldOptions, GeneratedFile } from '../types.js';

/**
 * 配置文件生成器
 */
export class ConfigGenerator {
  /**
   * 生成所有配置文件
   */
  static generateAll(options: ScaffoldOptions, projectName: string): GeneratedFile[] {
    const files: GeneratedFile[] = [];

    // 基础配置文件
    files.push(...this.generateBaseConfigs(options, projectName));

    // 构建工具配置
    files.push(...this.generateBuildConfigs(options));

    // 代码质量工具配置
    files.push(...this.generateQualityConfigs(options));

    // 测试配置
    files.push(...this.generateTestConfigs(options));

    // 样式配置
    files.push(...this.generateStyleConfigs(options));

    return files;
  }

  /**
   * 生成基础配置文件
   */
  private static generateBaseConfigs(options: ScaffoldOptions, projectName: string): GeneratedFile[] {
    const files: GeneratedFile[] = [];

    // .gitignore
    files.push({
      path: '.gitignore',
      type: 'config',
      content: this.generateGitignore(options),
    });

    // .npmrc
    files.push({
      path: '.npmrc',
      type: 'config',
      content: this.generateNpmrc(),
    });

    // README.md
    files.push({
      path: 'README.md',
      type: 'template',
      content: this.generateReadme(options, projectName),
    });

    // TypeScript配置
    if (options.language === 'typescript') {
      files.push({
        path: 'tsconfig.json',
        type: 'config',
        content: this.generateTsConfig(options),
      });
      
      // 为Vite项目生成tsconfig.node.json
      if (options.buildTool === 'vite') {
        files.push({
          path: 'tsconfig.node.json',
          type: 'config',
          content: this.generateTsConfigNode(),
        });
      }
    }

    return files;
  }

  /**
   * 生成构建工具配置
   */
  private static generateBuildConfigs(options: ScaffoldOptions): GeneratedFile[] {
    const files: GeneratedFile[] = [];

    if (options.buildTool === 'vite') {
      files.push({
        path: 'vite.config.ts',
        type: 'config',
        content: this.generateViteConfig(options),
      });
    } else {
      files.push({
        path: 'webpack.config.js',
        type: 'config',
        content: this.generateWebpackConfig(options),
      });
    }

    return files;
  }

  /**
   * 生成代码质量工具配置
   */
  private static generateQualityConfigs(options: ScaffoldOptions): GeneratedFile[] {
    const files: GeneratedFile[] = [];

    if (options.qualityTools.eslint) {
      files.push({
        path: '.eslintrc.cjs',
        type: 'config',
        content: this.generateEslintConfig(options),
      });
    }

    if (options.qualityTools.prettier) {
      files.push({
        path: '.prettierrc',
        type: 'config',
        content: this.generatePrettierConfig(),
      });
      files.push({
        path: '.prettierignore',
        type: 'config',
        content: this.generatePrettierIgnore(),
      });
    }

    if (options.qualityTools.commitlint) {
      files.push({
        path: 'commitlint.config.cjs',
        type: 'config',
        content: this.generateCommitlintConfig(),
      });
    }

    if (options.qualityTools.lsLint) {
      files.push({
        path: '.ls-lint.yml',
        type: 'config',
        content: this.generateLsLintConfig(),
      });
    }

    if (options.qualityTools.lintStaged) {
      files.push({
        path: '.lintstagedrc.json',
        type: 'config',
        content: this.generateLintStagedConfig(options),
      });
    }

    return files;
  }

  /**
   * 生成测试配置
   */
  private static generateTestConfigs(options: ScaffoldOptions): GeneratedFile[] {
    const files: GeneratedFile[] = [];

    if (options.testing.framework === 'vitest') {
      files.push({
        path: 'vitest.config.ts',
        type: 'config',
        content: this.generateVitestConfig(options),
      });
    } else {
      files.push({
        path: 'jest.config.js',
        type: 'config',
        content: this.generateJestConfig(options),
      });
    }

    // Mock配置
    if (options.testing.mockSolution === 'msw') {
      files.push({
        path: 'src/mocks/handlers.ts',
        type: 'source',
        content: this.generateMswHandlers(options),
      });
      files.push({
        path: 'src/mocks/browser.ts',
        type: 'source',
        content: this.generateMswBrowser(),
      });
      files.push({
        path: 'src/mocks/server.ts',
        type: 'source',
        content: this.generateMswServer(),
      });
    }

    return files;
  }

  /**
   * 生成样式配置
   */
  private static generateStyleConfigs(options: ScaffoldOptions): GeneratedFile[] {
    const files: GeneratedFile[] = [];

    if (options.styleFramework === 'tailwind') {
      files.push({
        path: 'tailwind.config.cjs',
        type: 'config',
        content: this.generateTailwindConfig(options),
      });
      files.push({
        path: 'postcss.config.js',
        type: 'config',
        content: this.generatePostcssConfig(),
      });
    }

    return files;
  }

  // 具体的配置文件生成方法
  private static generateGitignore(options: ScaffoldOptions): string {
    return `# Dependencies
node_modules/
npm-debug.log*
yarn-debug.log*
yarn-error.log*
pnpm-debug.log*

# Build outputs
dist/
build/
.tmp/
.cache/

# Environment variables
.env
.env.local
.env.*.local

# IDE
.vscode/
.idea/
*.swp
*.swo

# OS
.DS_Store
Thumbs.db

# Logs
logs/
*.log

# Coverage
coverage/
.nyc_output/

${options.buildTool === 'vite' ? '# Vite\n.vite/\nvite.config.*.timestamp-*' : ''}
${options.testing.framework === 'vitest' ? '# Vitest\n.vitest/' : ''}
${options.testing.mockSolution === 'msw' ? '# MSW\npublic/mockServiceWorker.js' : ''}
`;
  }

  private static generateNpmrc(): string {
    return `registry=https://registry.npmjs.org/
save-exact=true
engine-strict=true`;
  }

  private static generateReadme(options: ScaffoldOptions, projectName: string): string {
    return `# ${projectName}

基于 ${options.framework.toUpperCase()} + ${options.buildTool.toUpperCase()} + ${options.language.toUpperCase()} 的前端项目脚手架

## 技术栈

- **框架**: ${options.framework}
- **语言**: ${options.language}
- **构建工具**: ${options.buildTool}
- **样式方案**: ${options.styleFramework}
- **UI组件库**: ${options.uiLibrary}
- **测试框架**: ${options.testing.framework}
- **Mock方案**: ${options.testing.mockSolution}

## 快速开始

\`\`\`bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建生产版本
npm run build

# 运行测试
npm run test
\`\`\`

## 项目结构

\`\`\`
src/
├── components/     # 组件
├── views/         # 页面
├── utils/         # 工具函数
├── types/         # 类型定义
${options.testing.mockSolution === 'msw' ? '├── mocks/         # Mock数据' : ''}
└── main.${options.language === 'typescript' ? 'ts' : 'js'}        # 入口文件
\`\`\`

## 开发规范

- 代码规范: ESLint + Prettier
- 提交规范: Conventional Commits
- 文件命名: ls-lint
- 预提交检查: lint-staged + husky
`;
  }

  private static generateTsConfig(options: ScaffoldOptions): string {
    const baseConfig: any = {
      compilerOptions: {
        target: 'ES2020',
        useDefineForClassFields: true,
        lib: ['ES2020', 'DOM', 'DOM.Iterable'],
        module: 'ESNext',
        skipLibCheck: true,
        moduleResolution: 'bundler',
        allowImportingTsExtensions: true,
        resolveJsonModule: true,
        isolatedModules: true,
        noEmit: true,
        strict: true,
        noUnusedLocals: true,
        noUnusedParameters: true,
        noFallthroughCasesInSwitch: true,
        baseUrl: '.',
        paths: {
          '@/*': ['src/*'],
        },
      },
      include: ['src/**/*.ts', 'src/**/*.tsx', 'src/**/*.vue'],
      references: [{ path: './tsconfig.node.json' }],
    };

    if (options.framework.startsWith('vue')) {
      baseConfig.compilerOptions.jsx = 'preserve';
    } else if (options.framework === 'react') {
      baseConfig.compilerOptions.jsx = 'react-jsx';
    }

    return JSON.stringify(baseConfig, null, 2);
  }

  private static generateTsConfigNode(): string {
    const nodeConfig = {
      compilerOptions: {
        composite: true,
        tsBuildInfoFile: './node_modules/.tmp/tsconfig.node.tsbuildinfo',
        target: 'ES2022',
        lib: ['ES2022'],
        module: 'ESNext',
        skipLibCheck: true,
        moduleResolution: 'bundler',
        allowImportingTsExtensions: true,
        verbatimModuleSyntax: true,
        moduleDetection: 'force',
        strict: true,
        noUnusedLocals: true,
        noUnusedParameters: true,
        noFallthroughCasesInSwitch: true
      },
      include: ['vite.config.ts']
    };

    return JSON.stringify(nodeConfig, null, 2);
  }

  private static generateViteConfig(options: ScaffoldOptions): string {
    let plugins = '';
    let imports = "import { defineConfig } from 'vite';\n";

    if (options.framework === 'vue3') {
      imports += "import vue from '@vitejs/plugin-vue';\n";
      plugins = 'vue()';
    } else if (options.framework === 'vue2') {
      imports += "import { createVuePlugin } from 'vite-plugin-vue2';\n";
      plugins = 'createVuePlugin()';
    } else if (options.framework === 'react') {
      imports += "import react from '@vitejs/plugin-react';\n";
      plugins = 'react()';
    }

    if (options.bundleAnalyzer === 'rollup-plugin-visualizer') {
      imports += "import { visualizer } from 'rollup-plugin-visualizer';\n";
      plugins += `, visualizer({ filename: 'dist/stats.html', open: true })`;
    }

    return `${imports}
export default defineConfig({
  plugins: [${plugins}],
  resolve: {
    alias: {
      '@': '/src',
    },
  },
  server: {
    port: 3000,
    open: true,
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
  },
});`;
  }

  private static generateEslintConfig(options: ScaffoldOptions): string {
    const config: any = {
      env: {
        browser: true,
        es2021: true,
        node: true,
      },
      extends: ['eslint:recommended'],
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
      },
      rules: {},
    };

    if (options.language === 'typescript') {
      config.parser = '@typescript-eslint/parser';
      config.plugins = ['@typescript-eslint'];
      config.extends.push('@typescript-eslint/recommended');
    }

    if (options.framework.startsWith('vue')) {
      config.extends.push('plugin:vue/vue3-recommended');
      config.parser = 'vue-eslint-parser';
      if (options.language === 'typescript') {
        config.parserOptions.parser = '@typescript-eslint/parser';
      }
    } else if (options.framework === 'react') {
      config.extends.push('plugin:react/recommended', 'plugin:react-hooks/recommended');
      config.plugins = config.plugins || [];
      config.plugins.push('react', 'react-hooks');
      config.settings = {
        react: {
          version: 'detect',
        },
      };
    }

    if (options.qualityTools.prettier) {
      config.extends.push('prettier');
    }

    return `module.exports = ${JSON.stringify(config, null, 2)};`;
  }

  private static generatePrettierConfig(): string {
    return JSON.stringify({
      semi: true,
      trailingComma: 'es5',
      singleQuote: true,
      printWidth: 100,
      tabWidth: 2,
      useTabs: false,
    }, null, 2);
  }

  private static generatePrettierIgnore(): string {
    return `dist/
node_modules/
coverage/
*.min.js
*.min.css`;
  }

  private static generateCommitlintConfig(): string {
    return `module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'type-enum': [
      2,
      'always',
      ['feat', 'fix', 'docs', 'style', 'refactor', 'test', 'chore', 'revert'],
    ],
    'subject-max-length': [2, 'always', 50],
  },
};`;
  }

  private static generateLsLintConfig(): string {
    return `ls:
  .dir: kebab-case
  .js: kebab-case
  .ts: kebab-case
  .vue: PascalCase
  .jsx: PascalCase
  .tsx: PascalCase

ignore:
  - node_modules
  - dist
  - .git`;
  }

  private static generateLintStagedConfig(options: ScaffoldOptions): string {
    const config: Record<string, string[]> = {};

    if (options.qualityTools.eslint) {
      config['*.{js,jsx,ts,tsx,vue}'] = ['eslint --fix'];
    }

    if (options.qualityTools.prettier) {
      config['*.{js,jsx,ts,tsx,vue,json,css,scss,md}'] = ['prettier --write'];
    }

    return JSON.stringify(config, null, 2);
  }

  private static generateVitestConfig(options: ScaffoldOptions): string {
    return `import { defineConfig } from 'vitest/config';
import { resolve } from 'path';

export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
});`;
  }

  private static generateJestConfig(options: ScaffoldOptions): string {
    const config: any = {
      preset: options.language === 'typescript' ? 'ts-jest' : undefined,
      testEnvironment: 'jsdom',
      setupFilesAfterEnv: ['<rootDir>/src/test/setup.ts'],
      moduleNameMapping: {
        '^@/(.*)$': '<rootDir>/src/$1',
      },
      collectCoverageFrom: [
        'src/**/*.{js,jsx,ts,tsx,vue}',
        '!src/**/*.d.ts',
        '!src/test/**',
      ],
    };

    if (options.framework.startsWith('vue')) {
      config.transform = {
        '^.+\\.vue$': '@vue/vue3-jest',
        '^.+\\.(js|jsx|ts|tsx)$': options.language === 'typescript' ? 'ts-jest' : 'babel-jest',
      };
    }

    return `module.exports = ${JSON.stringify(config, null, 2)};`;
  }

  private static generateMswHandlers(options: ScaffoldOptions): string {
    // 使用options参数避免ESLint警告
    void options;
    return `import { http, HttpResponse } from 'msw';

export const handlers = [
  // 示例API处理器
  http.get('/api/users', () => {
    return HttpResponse.json([
      { id: 1, name: 'John Doe' },
      { id: 2, name: 'Jane Smith' },
    ]);
  }),

  http.post('/api/users', async ({ request }) => {
    const newUser = await request.json() as Record<string, unknown>;
    return HttpResponse.json({ id: 3, ...newUser }, { status: 201 });
  }),
];`;
  }

  private static generateMswBrowser(): string {
    return `import { setupWorker } from 'msw/browser';
import { handlers } from './handlers';

export const worker = setupWorker(...handlers);`;
  }

  private static generateMswServer(): string {
    return `import { setupServer } from 'msw/node';
import { handlers } from './handlers';

export const server = setupServer(...handlers);`;
  }

  private static generateTailwindConfig(options: ScaffoldOptions): string {
    return `/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './index.html',
    './src/**/*.{${options.framework.startsWith('vue') ? 'vue' : 'jsx,tsx'},js,ts}',
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};`;
  }

  private static generatePostcssConfig(): string {
    return `export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};`;
  }

  private static generateWebpackConfig(options: ScaffoldOptions): string {
    return `const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
${options.bundleAnalyzer === 'webpack-bundle-analyzer' ? "const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;" : ''}

module.exports = {
  entry: './src/main.${options.language === 'typescript' ? 'ts' : 'js'}',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].[contenthash].js',
    clean: true,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
    extensions: ['.js', '.ts', '.jsx', '.tsx', '.vue'],
  },
  module: {
    rules: [
      ${options.language === 'typescript' ? `{
        test: /\\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },` : ''}
      {
        test: /\\.css$/i,
        use: ['style-loader', 'css-loader', 'postcss-loader'],
      },
      ${options.styleFramework === 'sass' ? `{
        test: /\\.s[ac]ss$/i,
        use: ['style-loader', 'css-loader', 'sass-loader'],
      },` : ''}
      ${options.styleFramework === 'less' ? `{
        test: /\\.less$/i,
        use: ['style-loader', 'css-loader', 'less-loader'],
      },` : ''}
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './index.html',
    }),
    ${options.bundleAnalyzer === 'webpack-bundle-analyzer' ? 'process.env.ANALYZE && new BundleAnalyzerPlugin(),' : ''}
  ].filter(Boolean),
  devServer: {
    port: 3000,
    open: true,
    hot: true,
  },
};`;
  }
}