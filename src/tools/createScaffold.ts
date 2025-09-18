import { Tool } from "@modelcontextprotocol/sdk/types.js";
import { ScaffoldOptions, CreateScaffoldParams } from "../types.js";
import { StackValidator } from "../utils/stackValidator.js";
import { ProjectGenerator } from "../generators/projectGenerator.js";
import { resolve, join, isAbsolute } from "path";
import { existsSync } from "fs";

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
        description: "项目名称，如不指定则使用模板默认名称（如vue3-vite）",
      },
      projectPath: {
        type: "string",
        description: "项目创建路径，支持绝对路径。如不指定则使用当前工作目录",
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
    required: ["framework"],
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

    // 确定项目路径和项目名称
    const { projectPath, projectName } = resolveProjectPathAndName(params, fixedOptions);

    const result = await ProjectGenerator.generateProject(
      fixedOptions,
      projectName,
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
    let response = `✅ 成功创建 ${projectName} 脚手架\n\n`;
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
    response += `cd ${projectName}\n`;
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

/**
 * 获取当前编辑器打开的工程根路径
 * 按优先级检查环境变量
 */
function getWorkspaceRoot(): string {
  // 优先使用环境变量中的工作目录（编辑器打开的工程路径）
  const workspaceRoot = process.env.WORKSPACE_ROOT || 
                       process.env.VSCODE_CWD || 
                       process.env.PWD ||
                       process.cwd();
  
  return workspaceRoot;
}

/**
 * 根据优先级确定项目路径和项目名称
 * 路径优先级：
 * 1. 用户指定的相对路径（相对当前编辑器打开工程路径）或指定的绝对路径（最高优先级）
 * 2. 用户当前编辑器打开工程的路径
 * 3. fe-scaffold的安装路径（最低优先级）
 * 
 * 项目名称：
 * 1. 用户指定的项目名称
 * 2. 模板默认名称（如vue3-vite）
 */
function resolveProjectPathAndName(
  params: CreateScaffoldParams,
  options: ScaffoldOptions
): { projectPath: string; projectName: string } {
  // 1. 确定基础路径
  let basePath: string;
  
  if (params.projectPath) {
    // 用户指定了路径（最高优先级）
    if (isAbsolute(params.projectPath)) {
      // 用户指定的绝对路径
      basePath = params.projectPath;
    } else {
      // 用户指定的相对路径，需要相对于当前编辑器打开的工程路径
      // 首先获取当前编辑器打开的工程路径
      const workspaceRoot = getWorkspaceRoot();
      basePath = resolve(workspaceRoot, params.projectPath);
    }
  } else {
    // 用户未指定路径，使用编辑器打开的工程路径（优先级2）
    const workspaceRoot = getWorkspaceRoot();
    
    // 检查是否在有效的工作空间中（包含package.json等）
    const potentialWorkspaces = [
      workspaceRoot,
      process.cwd() // fe-scaffold的安装路径（最低优先级）
    ];
    
    basePath = findValidWorkspace(potentialWorkspaces) || process.cwd();
  }
  
  // 2. 确定项目名称
  let projectName: string;
  
  if (params.projectName && params.projectName.trim()) {
    // 用户指定了项目名称
    projectName = params.projectName.trim();
  } else {
    // 使用模板默认名称
    projectName = getTemplateDefaultName(options);
  }
  
  // 3. 构建最终项目路径
  const finalProjectPath = join(basePath, projectName);
  
  return {
    projectPath: finalProjectPath,
    projectName
  };
}

/**
 * 查找有效的工作空间目录
 * 判断标准：包含package.json、.git目录、或其他项目标识文件
 */
function findValidWorkspace(candidates: string[]): string | null {
  for (const candidate of candidates) {
    if (!candidate) continue;
    
    try {
      // 检查是否包含常见的项目标识文件
      const indicators = [
        join(candidate, 'package.json'),
        join(candidate, '.git'),
        join(candidate, 'yarn.lock'),
        join(candidate, 'pnpm-lock.yaml'),
        join(candidate, 'tsconfig.json'),
        join(candidate, 'vite.config.ts'),
        join(candidate, 'vite.config.js'),
        join(candidate, 'webpack.config.js')
      ];
      
      // 如果存在任何一个指示文件/目录，认为这是一个有效的工作空间
      if (indicators.some(indicator => existsSync(indicator))) {
        return candidate;
      }
    } catch (error) {
      // 忽略访问错误，继续检查下一个候选路径
      continue;
    }
  }
  
  return null;
}

/**
 * 根据技术栈获取模板默认名称
 */
function getTemplateDefaultName(options: ScaffoldOptions): string {
  const { framework, buildTool } = options;
  
  // 构建模板名称映射
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
