import { Tool } from "@modelcontextprotocol/sdk/types.js";
import { ScaffoldOptions, CreateScaffoldParams } from "../types.js";
import { StackValidator } from "../utils/stackValidator.js";
import { DependencyManager } from "../utils/dependencyManager.js";

/**
 * 预览配置工具
 */
export const previewConfigTool: Tool = {
  name: "preview-config",
  description: "预览将要生成的项目配置文件和结构，不实际创建文件",
  inputSchema: {
    type: "object",
    properties: {
      projectName: {
        type: "string",
        description: "项目名称，如不指定则使用模板默认名称（如vue3-vite）",
      },
      framework: {
        type: "string",
        enum: ["vue3", "vue2", "react"],
        description: "前端框架",
      },
      language: {
        type: "string",
        enum: ["javascript", "typescript"],
        description: "开发语言，默认为typescript",
        default: "typescript",
      },
      buildTool: {
        type: "string",
        enum: ["vite", "webpack"],
        description: "构建工具，默认为vite",
        default: "vite",
      },
      styleFramework: {
        type: "string",
        enum: ["tailwind", "sass", "less"],
        description: "样式方案，默认为tailwind",
        default: "tailwind",
      },
      features: {
        type: "array",
        items: {
          type: "string",
          enum: [
            "eslint",
            "prettier",
            "lint-staged",
            "commitlint",
            "ls-lint",
            "testing",
            "mock",
            "bundle-analyzer",
          ],
        },
        description: "需要集成的功能特性",
        default: [
          "eslint",
          "prettier",
          "lint-staged",
          "commitlint",
          "ls-lint",
          "testing",
          "mock",
          "bundle-analyzer",
        ],
      },
      uiLibrary: {
        type: "string",
        description: "UI组件库，不指定则根据框架自动选择",
      },
      showFileContent: {
        type: "boolean",
        description: "是否显示主要配置文件的内容",
        default: false,
      },
    },
    required: ["framework"],
  },
};

/**
 * 预览配置处理函数
 */
export async function handlePreviewConfig(
  params: CreateScaffoldParams & {
    showFileContent?: boolean;
  }
): Promise<string> {
  try {
    const options = buildScaffoldOptions(params);
    const validation = StackValidator.validate(options);
    const fixedOptions = StackValidator.autoFix(options);
    const { dependencies, devDependencies } =
      DependencyManager.getDependencies(fixedOptions);

    // 确定项目名称
    const projectName = params.projectName || getDefaultProjectName(fixedOptions);

    let response = `🔍 **项目配置预览**: ${projectName}\n\n`;

    // 技术栈配置
    response += `📋 **技术栈配置**\n`;
    response += `- 框架: ${fixedOptions.framework}\n`;
    response += `- 语言: ${fixedOptions.language}\n`;
    response += `- 构建工具: ${fixedOptions.buildTool}\n`;
    response += `- 样式方案: ${fixedOptions.styleFramework}\n`;
    response += `- UI组件库: ${fixedOptions.uiLibrary}\n`;
    response += `- 测试框架: ${fixedOptions.testing.framework}\n\n`;

    // 验证结果
    if (!validation.isValid || validation.warnings.length > 0) {
      response += `⚠️ **配置验证**\n`;
      if (!validation.isValid) {
        response += validation.errors.map((e) => `- ❌ ${e}`).join("\n") + "\n";
      }
      if (validation.warnings.length > 0) {
        response +=
          validation.warnings.map((w) => `- ⚠️ ${w}`).join("\n") + "\n";
      }
      response += "\n";
    }

    // 项目结构预览
    response += `📁 **项目结构预览**\n`;
    response += generateProjectStructure(fixedOptions, projectName);

    // 依赖信息
    response += `\n📦 **依赖包信息**\n`;
    response += `生产依赖: ${dependencies.length}个，开发依赖: ${devDependencies.length}个\n`;

    return response;
  } catch (error) {
    return `❌ 预览配置失败: ${
      error instanceof Error ? error.message : String(error)
    }`;
  }
}

/**
 * 生成项目结构
 */
function generateProjectStructure(
  options: ScaffoldOptions,
  projectName: string
): string {
  const ext = options.framework.startsWith("vue")
    ? "vue"
    : options.language === "typescript"
    ? "tsx"
    : "jsx";
  const mainExt = options.language === "typescript" ? "ts" : "js";

  let structure = `${projectName}/\n`;
  structure += `├── src/\n`;
  structure += `│   ├── components/HelloWorld.${ext}\n`;
  structure += `│   ├── App.${ext}\n`;
  structure += `│   ├── main.${mainExt}\n`;
  structure += `│   └── style.css\n`;
  structure += `├── public/favicon.svg\n`;
  structure += `├── package.json\n`;
  structure += `├── ${
    options.buildTool === "vite" ? "vite.config.ts" : "webpack.config.js"
  }\n`;

  if (options.qualityTools.eslint) {
    structure += `├── .eslintrc.cjs\n`;
  }

  structure += `├── .gitignore\n`;
  structure += `└── README.md\n`;

  return structure;
}

/**
 * 构建脚手架选项
 */
function buildScaffoldOptions(params: CreateScaffoldParams): ScaffoldOptions {
  const features = params.features || [
    "eslint",
    "prettier",
    "lint-staged",
    "commitlint",
    "ls-lint",
    "testing",
    "mock",
    "bundle-analyzer",
  ];

  const recommendations = StackValidator.getRecommendations(params.framework);

  return {
    framework: params.framework as ScaffoldOptions["framework"],
    language: (params.language || "typescript") as ScaffoldOptions["language"],
    buildTool: (params.buildTool || "vite") as ScaffoldOptions["buildTool"],
    styleFramework: (params.styleFramework ||
      "tailwind") as ScaffoldOptions["styleFramework"],
    uiLibrary: params.uiLibrary || recommendations.uiLibrary,
    qualityTools: {
      eslint: features.includes("eslint"),
      prettier: features.includes("prettier"),
      lintStaged: features.includes("lint-staged"),
      commitlint: features.includes("commitlint"),
      lsLint: features.includes("ls-lint"),
      husky: features.includes("lint-staged"),
      editorconfig: true,
    },
    testing: {
      framework: (params.buildTool || "vite") === "vite" ? "vitest" : "jest",
      mockSolution: features.includes("mock")
        ? (params.buildTool || "vite") === "vite"
          ? "msw"
          : "webpack-proxy"
        : "msw",
    },
    bundleAnalyzer: features.includes("bundle-analyzer")
      ? (params.buildTool || "vite") === "vite"
        ? "rollup-plugin-visualizer"
        : "webpack-bundle-analyzer"
      : "rollup-plugin-visualizer",
  };
}

/**
 * 获取默认项目名称
 */
function getDefaultProjectName(options: ScaffoldOptions): string {
  const { framework, buildTool } = options;
  const templateNameMap: Record<string, string> = {
    'vue3-vite': 'vue3-vite',
    'vue3-webpack': 'vue3-webpack', 
    'vue2-vite': 'vue2-vite',
    'vue2-webpack': 'vue2-webpack',
    'react-vite': 'react-vite', 
    'react-webpack': 'react-webpack'
  };
  
  const key = `${framework}-${buildTool}`;
  return templateNameMap[key] || 'vue3-vite';
}
