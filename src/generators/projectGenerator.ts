import { ScaffoldOptions } from "../types.js";
import { TemplateCopier } from "./templateCopier.js";
import { TemplateCustomizer } from "./templateCustomizer.js";
import { FileUtils } from "../utils/fileUtils.js";
import { resolve } from "path";

/**
 * 项目生成器 - 使用新的模板复制+定制架构
 */
export class ProjectGenerator {
  /**
   * 生成完整项目
   */
  static async generateProject(
    options: ScaffoldOptions,
    projectName: string,
    outputPath?: string
  ): Promise<{
    projectPath: string;
    success: string[];
    failed: { file: string; error: string }[];
  }> {
    // 确定输出路径
    const projectPath = outputPath || resolve(process.cwd(), projectName);

    // 确保项目路径不是根目录或系统目录
    if (
      projectPath === "/" ||
      projectPath.startsWith("/usr") ||
      projectPath.startsWith("/System")
    ) {
      throw new Error(`不能在系统目录创建项目: ${projectPath}`);
    }

    const allSuccess: string[] = [];
    const allFailed: { file: string; error: string }[] = [];

    try {
      // 1. 复制基础模板
      console.log("复制基础模板...");
      const copyResult = await TemplateCopier.copyTemplate(
        options,
        projectPath
      );
      allSuccess.push(...copyResult.success);
      allFailed.push(...copyResult.failed);

      // 2. 复制共享配置文件
      console.log("复制共享配置...");
      const sharedResult = await TemplateCopier.copySharedConfigs(
        options,
        projectPath
      );
      allSuccess.push(...sharedResult.success);
      allFailed.push(...sharedResult.failed);

      // 3. 定制模板
      console.log("定制模板...");
      const customizeResult = await TemplateCustomizer.customizeTemplate(
        projectPath,
        options,
        projectName
      );
      allSuccess.push(...customizeResult.success);
      allFailed.push(...customizeResult.failed);

      return {
        projectPath,
        success: allSuccess,
        failed: allFailed,
      };
    } catch (error) {
      allFailed.push({
        file: "project",
        error: `项目生成失败: ${
          error instanceof Error ? error.message : String(error)
        }`,
      });

      return {
        projectPath,
        success: allSuccess,
        failed: allFailed,
      };
    }
  }

  /**
   * 生成项目统计信息
   */
  static generateProjectStats(successFiles: string[]): {
    totalFiles: number;
    fileTypes: Record<string, number>;
    totalLines: number;
  } {
    const fileTypes: Record<string, number> = {};

    successFiles.forEach((file) => {
      const extension = file.split(".").pop() || "unknown";
      fileTypes[extension] = (fileTypes[extension] || 0) + 1;
    });

    return {
      totalFiles: successFiles.length,
      fileTypes,
      totalLines: 0, // 实际项目中可以通过读取文件计算
    };
  }

  /**
   * 验证项目生成结果
   */
  static async validateProject(
    projectPath: string,
    options: ScaffoldOptions
  ): Promise<{
    isValid: boolean;
    missingFiles: string[];
    errors: string[];
  }> {
    const errors: string[] = [];
    const missingFiles: string[] = [];

    // 检查必要文件
    const requiredFiles = [
      "package.json",
      `src/main.${options.language === "typescript" ? "ts" : "js"}`,
      "index.html",
    ];

    // 根据框架添加必要文件
    if (options.framework.startsWith("vue")) {
      requiredFiles.push("src/App.vue");
    } else if (options.framework === "react") {
      const ext = options.language === "typescript" ? "tsx" : "jsx";
      requiredFiles.push(`src/App.${ext}`);
    }

    for (const file of requiredFiles) {
      const filePath = `${projectPath}/${file}`;
      const exists = await FileUtils.fileExists(filePath);

      if (!exists) {
        missingFiles.push(file);
      }
    }

    // 检查配置文件
    if (options.qualityTools.eslint) {
      const eslintConfig = `${projectPath}/.eslintrc.cjs`;
      if (!(await FileUtils.fileExists(eslintConfig))) {
        missingFiles.push(".eslintrc.cjs");
      }
    }

    if (options.styleFramework === "tailwind") {
      const tailwindConfig = `${projectPath}/tailwind.config.cjs`;
      if (!(await FileUtils.fileExists(tailwindConfig))) {
        missingFiles.push("tailwind.config.cjs");
      }
    }

    const isValid = missingFiles.length === 0 && errors.length === 0;

    return {
      isValid,
      missingFiles,
      errors,
    };
  }
}
