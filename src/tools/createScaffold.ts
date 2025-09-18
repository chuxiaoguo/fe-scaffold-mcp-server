import { Tool } from "@modelcontextprotocol/sdk/types.js";
import { ScaffoldOptions, CreateScaffoldParams } from "../types.js";
import { StackValidator } from "../utils/stackValidator.js";
import { ProjectGenerator } from "../generators/projectGenerator.js";
import { resolve } from "path";

/**
 * 创建脚手架工具
 */
export const createScaffoldTool: Tool = {
  name: "create-scaffold",
  description: "根据指定的技术栈创建前端项目脚手架",
  inputSchema: {
    type: "object",
    properties: {
      projectName: {
        type: "string",
        description: "项目名称",
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
    },
    required: ["projectName", "framework"],
  },
};

/**
 * 创建脚手架处理函数
 */
export async function handleCreateScaffold(
  params: CreateScaffoldParams
): Promise<string> {
  try {
    // 构建选项
    const options = buildScaffoldOptions(params);

    // 验证技术栈兼容性
    const validation = StackValidator.validate(options);
    if (!validation.isValid) {
      return `❌ 技术栈配置错误:\n${validation.errors.join("\n")}`;
    }

    // 自动修复配置
    const fixedOptions = StackValidator.autoFix(options);

    // 生成项目
    const projectPath = resolve(process.cwd(), params.projectName);

    // 确保项目路径不是根目录或系统目录
    if (
      projectPath === "/" ||
      projectPath.startsWith("/usr") ||
      projectPath.startsWith("/System")
    ) {
      throw new Error(`不能在系统目录创建项目: ${projectPath}`);
    }
    const result = await ProjectGenerator.generateProject(
      fixedOptions,
      params.projectName,
      projectPath
    );

    // 验证生成结果
    const projectValidation = await ProjectGenerator.validateProject(
      result.projectPath,
      fixedOptions
    );

    // 生成项目统计信息
    const stats = ProjectGenerator.generateProjectStats(result.success);

    // 构建响应消息
    let response = `✅ 成功创建 ${params.projectName} 脚手架\n\n`;
    response += `📁 **项目路径**: ${result.projectPath}\n\n`;

    response += `📋 **技术栈配置**\n`;
    response += `- 框架: ${fixedOptions.framework}\n`;
    response += `- 语言: ${fixedOptions.language}\n`;
    response += `- 构建工具: ${fixedOptions.buildTool}\n`;
    response += `- 样式方案: ${fixedOptions.styleFramework}\n`;
    response += `- UI组件库: ${fixedOptions.uiLibrary}\n`;
    response += `- 测试框架: ${fixedOptions.testing.framework}\n`;
    response += `- Mock方案: ${fixedOptions.testing.mockSolution}\n\n`;

    if (validation.warnings.length > 0) {
      response += `⚠️ **警告信息**\n`;
      response += validation.warnings.map((w) => `- ${w}`).join("\n") + "\n\n";
    }

    response += `📊 **项目统计**\n`;
    response += `- 总文件数: ${stats.totalFiles}\n`;
    response += `- 总行数: ${stats.totalLines}\n`;
    response += `- 文件类型分布:\n`;
    Object.entries(stats.fileTypes).forEach(([type, count]) => {
      response += `  - ${type}: ${count}个\n`;
    });
    response += "\n";

    // 文件写入结果
    if (result.success.length > 0) {
      response += `✅ **成功创建的文件** (${result.success.length}个)\n`;
      result.success.slice(0, 10).forEach((file) => {
        response += `- ${file}\n`;
      });
      if (result.success.length > 10) {
        response += `- ... 还有 ${result.success.length - 10} 个文件\n`;
      }
      response += "\n";
    }

    if (result.failed.length > 0) {
      response += `❌ **创建失败的文件** (${result.failed.length}个)\n`;
      result.failed.forEach((item) => {
        response += `- ${item.file}: ${item.error}\n`;
      });
      response += "\n";
    }

    // 项目验证结果
    if (!projectValidation.isValid) {
      response += `⚠️ **项目验证**\n`;
      if (projectValidation.missingFiles.length > 0) {
        response += `缺少文件: ${projectValidation.missingFiles.join(", ")}\n`;
      }
      if (projectValidation.errors.length > 0) {
        response += `错误: ${projectValidation.errors.join(", ")}\n`;
      }
      response += "\n";
    }

    response += `🚀 **快速开始**\n`;
    response += `\`\`\`bash\n`;
    response += `cd ${params.projectName}\n`;
    response += `npm install\n`;
    response += `npm run dev\n`;
    response += `\`\`\``;

    return response;
  } catch (error) {
    return `❌ 创建脚手架失败: ${
      error instanceof Error ? error.message : String(error)
    }`;
  }
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

  // 获取推荐配置
  const recommendations = StackValidator.getRecommendations(params.framework);

  const options: ScaffoldOptions = {
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

  return options;
}
