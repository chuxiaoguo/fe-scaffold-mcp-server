/**
 * 配置文件生成器
 */

import { ScaffoldOptions } from '../types.js';
import { configManager } from '../config/index.js';

export interface GeneratedConfig {
  filename: string;
  content: string;
  description: string;
}

/**
 * 配置文件生成器
 */
export class ConfigGenerator {
  /**
   * 生成所有配置文件
   */
  static generateConfigs(
    options: ScaffoldOptions,
    projectName: string
  ): GeneratedConfig[] {
    const configs: GeneratedConfig[] = [];

    // 生成 .npmrc
    configs.push(this.generateNpmrc());

    // 生成 .editorconfig
    configs.push(this.generateEditorConfig());

    // 生成 .gitignore
    configs.push(this.generateGitignore(options));

    // 根据选项生成其他配置
    if (options.qualityTools.prettier) {
      configs.push(this.generatePrettierConfig());
    }

    if (options.qualityTools.eslint) {
      configs.push(this.generateEslintConfig(options));
    }

    if (options.styleFramework === 'tailwind') {
      configs.push(this.generateTailwindConfig());
      configs.push(this.generatePostcssConfig());
    }

    if (options.testing.framework === 'vitest') {
      configs.push(this.generateVitestConfig(options));
    }

    if (options.qualityTools.commitlint) {
      configs.push(this.generateCommitlintConfig());
    }

    if (options.qualityTools.lintStaged) {
      configs.push(this.generateLintStagedConfig());
    }

    if (options.qualityTools.lsLint) {
      configs.push(this.generateLsLintConfig());
    }

    return configs;
  }

  /**
   * 生成 .npmrc 配置
   */
  private static generateNpmrc(): GeneratedConfig {
    const registryConfig = configManager.getRegistryConfig();
    
    let content = `# 淘宝镜像源配置\n`;
    content += `registry=${registryConfig.npm}\n\n`;
    content += `# 类型定义包镜像\n`;
    content += `@types:registry=${registryConfig.npm}\n\n`;
    content += `# 二进制文件镜像配置\n`;
    
    Object.entries(registryConfig.mirrors).forEach(([key, value]) => {
      content += `${key}=${value}\n`;
    });
    
    content += `\n# 安装配置\n`;
    content += `package-lock=true\n`;
    content += `save-exact=false\n`;
    content += `save-prefix=^\n\n`;
    content += `# 缓存配置\n`;
    content += `cache-max=1073741824\n\n`;
    content += `# 网络配置\n`;
    content += `fetch-retries=3\n`;
    content += `fetch-retry-factor=10\n`;
    content += `fetch-retry-mintimeout=10000\n`;
    content += `fetch-retry-maxtimeout=60000\n\n`;
    content += `# 日志级别\n`;
    content += `loglevel=warn\n\n`;
    content += `# 进度条\n`;
    content += `progress=true`;

    return {
      filename: '.npmrc',
      content,
      description: 'npm 配置文件，包含淘宝镜像源和优化设置',
    };
  }

  /**
   * 生成 .editorconfig 配置
   */
  private static generateEditorConfig(): GeneratedConfig {
    const content = `# EditorConfig is awesome: https://EditorConfig.org

# top-most EditorConfig file
root = true

# Unix-style newlines with a newline ending every file
[*]
charset = utf-8
end_of_line = lf
insert_final_newline = true
trim_trailing_whitespace = true
indent_style = space
indent_size = 2

# Tab indentation (no size specified)
[Makefile]
indent_style = tab

# Markdown files
[*.md]
trim_trailing_whitespace = false

# Python files
[*.py]
indent_size = 4

# YAML files
[*.{yml,yaml}]
indent_size = 2

# JSON files
[*.json]
indent_size = 2

# CSS, SCSS, LESS files
[*.{css,scss,less}]
indent_size = 2

# JavaScript, TypeScript files
[*.{js,jsx,ts,tsx}]
indent_size = 2

# Vue files
[*.vue]
indent_size = 2`;

    return {
      filename: '.editorconfig',
      content,
      description: 'EditorConfig 配置文件，统一代码格式',
    };
  }

  /**
   * 生成 .gitignore 配置
   */
  private static generateGitignore(options: ScaffoldOptions): GeneratedConfig {
    let content = `# Dependencies
node_modules
npm-debug.log*
yarn-debug.log*
yarn-error.log*
pnpm-debug.log*

# Build outputs
dist
dist-ssr
*.local

# IDE
.vscode/*
!.vscode/extensions.json
.idea
*.swp
*.swo

# OS
.DS_Store
Thumbs.db

# Logs
logs
*.log

# Runtime data
pids
*.pid
*.seed
*.pid.lock

# Coverage directory used by tools like istanbul
coverage
*.lcov

# nyc test coverage
.nyc_output

# Dependency directories
jspm_packages/

# Optional npm cache directory
.npm

# Optional eslint cache
.eslintcache

# Optional REPL history
.node_repl_history

# Output of 'npm pack'
*.tgz

# Yarn Integrity file
.yarn-integrity

# dotenv environment variables file
.env
.env.local
.env.development.local
.env.test.local
.env.production.local

# Stores VSCode versions used for testing VSCode extensions
.vscode-test

# Temporary folders
tmp/
temp/

# Testing
/coverage

# Misc
*.tsbuildinfo
.DS_Store
.vscode
.history
.suo
*.user
_ReSharper*
*[Cc]ache
obj
[Bb]in`;

    // 根据框架添加特定忽略项
    if (options.framework.startsWith('vue')) {
      content += `\n\n# Vue specific
.nuxt
.output`;
    } else if (options.framework === 'react') {
      content += `\n\n# React specific
build/`;
    }

    // 根据测试框架添加忽略项
    if (options.testing.mockSolution === 'msw') {
      content += `\n\n# Mock service worker
public/mockServiceWorker.js`;
    }

    return {
      filename: '.gitignore',
      content,
      description: 'Git 忽略文件配置',
    };
  }

  /**
   * 生成 Prettier 配置
   */
  private static generatePrettierConfig(): GeneratedConfig {
    const content = `{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 80,
  "tabWidth": 2,
  "useTabs": false,
  "bracketSpacing": true,
  "arrowParens": "avoid",
  "endOfLine": "lf",
  "quoteProps": "as-needed",
  "jsxSingleQuote": true,
  "bracketSameLine": false
}`;

    return {
      filename: '.prettierrc.json',
      content,
      description: 'Prettier 代码格式化配置',
    };
  }

  /**
   * 生成 ESLint 配置
   */
  private static generateEslintConfig(options: ScaffoldOptions): GeneratedConfig {
    let content = '';

    if (options.framework.startsWith('vue')) {
      content = `/* eslint-env node */
require('@rushstack/eslint-patch/modern-module-resolution')

module.exports = {
  root: true,
  extends: [
    'plugin:vue/vue3-essential',
    'eslint:recommended',
    '@vue/eslint-config-typescript',
    '@vue/eslint-config-prettier/skip-formatting'
  ],
  parserOptions: {
    ecmaVersion: 'latest'
  },
  rules: {
    'vue/multi-word-component-names': 'off',
    '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    'no-console': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
    'no-debugger': process.env.NODE_ENV === 'production' ? 'warn' : 'off'
  }
}`;
    } else if (options.framework === 'react') {
      content = `module.exports = {
  root: true,
  env: { browser: true, es2020: true },
  extends: [
    'eslint:recommended',
    '@typescript-eslint/recommended',
    'plugin:react-hooks/recommended',
    'plugin:react/recommended',
    'plugin:react/jsx-runtime',
    'prettier'
  ],
  ignorePatterns: ['dist', '.eslintrc.cjs'],
  parser: '@typescript-eslint/parser',
  plugins: ['react-refresh'],
  rules: {
    'react-refresh/only-export-components': [
      'warn',
      { allowConstantExport: true },
    ],
    '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    'no-console': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
    'no-debugger': process.env.NODE_ENV === 'production' ? 'warn' : 'off'
  },
  settings: {
    react: {
      version: 'detect'
    }
  }
}`;
    }

    return {
      filename: '.eslintrc.cjs',
      content,
      description: 'ESLint 代码检查配置',
    };
  }

  /**
   * 生成 Tailwind 配置
   */
  private static generateTailwindConfig(): GeneratedConfig {
    const content = `/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}`;

    return {
      filename: 'tailwind.config.cjs',
      content,
      description: 'Tailwind CSS 配置文件',
    };
  }

  /**
   * 生成 PostCSS 配置
   */
  private static generatePostcssConfig(): GeneratedConfig {
    const content = `module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}`;

    return {
      filename: 'postcss.config.js',
      content,
      description: 'PostCSS 配置文件',
    };
  }

  /**
   * 生成 Vitest 配置
   */
  private static generateVitestConfig(options: ScaffoldOptions): GeneratedConfig {
    let content = `import { defineConfig } from 'vitest/config'
import { resolve } from 'path'`;

    if (options.framework.startsWith('vue')) {
      content += `
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.ts']
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src')
    }
  }
})`;
    } else if (options.framework === 'react') {
      content += `
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.ts']
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src')
    }
  }
})`;
    }

    return {
      filename: 'vitest.config.ts',
      content,
      description: 'Vitest 测试配置文件',
    };
  }

  /**
   * 生成 Commitlint 配置
   */
  private static generateCommitlintConfig(): GeneratedConfig {
    const content = `module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'type-enum': [
      2,
      'always',
      [
        'feat',     // 新功能
        'fix',      // 修复
        'docs',     // 文档变更
        'style',    // 代码格式（不影响代码运行的变动）
        'refactor', // 重构（既不是新增功能，也不是修改bug的代码变动）
        'perf',     // 性能优化
        'test',     // 增加测试
        'chore',    // 构建过程或辅助工具的变动
        'revert',   // 回滚
        'build',    // 构建系统或外部依赖项的更改
        'ci'        // CI配置文件和脚本的更改
      ]
    ],
    'subject-case': [0]
  }
}`;

    return {
      filename: 'commitlint.config.js',
      content,
      description: 'Commitlint 提交信息规范配置',
    };
  }

  /**
   * 生成 lint-staged 配置
   */
  private static generateLintStagedConfig(): GeneratedConfig {
    const content = `module.exports = {
  '*.{js,jsx,ts,tsx,vue}': [
    'eslint --fix',
    'prettier --write'
  ],
  '*.{css,scss,less,html,json,md}': [
    'prettier --write'
  ]
}`;

    return {
      filename: 'lint-staged.config.js',
      content,
      description: 'lint-staged 预提交检查配置',
    };
  }

  /**
   * 生成 ls-lint 配置
   */
  private static generateLsLintConfig(): GeneratedConfig {
    const content = `ls:
  .dir: kebab-case
  .js: kebab-case
  .ts: kebab-case
  .jsx: PascalCase | kebab-case
  .tsx: PascalCase | kebab-case
  .vue: PascalCase | kebab-case
  .css: kebab-case
  .scss: kebab-case
  .less: kebab-case
  .json: kebab-case
  .md: kebab-case

ignore:
  - node_modules
  - dist
  - .git
  - .vscode
  - .idea
  - coverage
  - .nyc_output`;

    return {
      filename: '.ls-lint.yml',
      content,
      description: 'ls-lint 文件命名规范配置',
    };
  }
}