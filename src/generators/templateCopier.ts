import { promises as fs } from "fs";
import { join, dirname, resolve } from "path";
import { fileURLToPath } from "url";
import { ScaffoldOptions } from "../types.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * 模板复制器 - 负责复制基础模板文件
 */
export class TemplateCopier {
  private static getTemplateBasePath(): string {
    // 在开发环境中，从src/generators指向templates
    // 在npm包中，从dist/generators指向templates
    const currentDir = __dirname;

    // 检查是否在dist目录中（npm包环境）
    if (currentDir.includes("/dist/")) {
      // 在npm包中，从dist/generators回到包根目录下的templates
      // dist/generators -> fe-scaffold-mcp-server/templates
      return resolve(currentDir, "../../templates");
    } else {
      // 在开发环境中，从src/generators回到项目根目录下的templates
      // src/generators -> fe-scaffold-mcp-server/templates
      return resolve(currentDir, "../../templates");
    }
  }

  private static readonly TEMPLATE_BASE_PATH = this.getTemplateBasePath();

  /**
   * 复制基础模板到目标目录
   */
  static async copyTemplate(
    options: ScaffoldOptions,
    targetPath: string
  ): Promise<{ success: string[]; failed: { file: string; error: string }[] }> {
    const templateName = this.getTemplateName(options);
    const templateBasePath = this.getTemplateBasePath();
    const templatePath = join(templateBasePath, templateName);

    const result = {
      success: [] as string[],
      failed: [] as { file: string; error: string }[],
    };

    try {
      // 添加调试信息
      console.debug("Template resolution debug:");
      console.debug("  __dirname:", __dirname);
      console.debug("  templateBasePath:", templateBasePath);
      console.debug("  templateName:", templateName);
      console.debug("  templatePath:", templatePath);

      // 检查模板是否存在
      await fs.access(templatePath);

      // 递归复制模板文件
      await this.copyDirectory(templatePath, targetPath, result);

      return result;
    } catch (error) {
      // 添加更详细的错误信息
      const errorMsg = `模板不存在: ${
        error instanceof Error ? error.message : String(error)
      }
调试信息:
  模板基础路径: ${templateBasePath}
  模板名称: ${templateName}
  完整模板路径: ${templatePath}`;

      result.failed.push({
        file: templatePath,
        error: errorMsg,
      });
      return result;
    }
  }

  /**
   * 获取模板名称
   */
  private static getTemplateName(options: ScaffoldOptions): string {
    const { framework, buildTool } = options;

    // 映射到模板文件夹名称
    const templateMap: Record<string, string> = {
      "vue3-vite": "vue3-vite",
      "vue3-webpack": "vue3-webpack",
      "vue2-vite": "vue2-vite",
      "vue2-webpack": "vue2-webpack",
      "react-vite": "react-vite",
      "react-webpack": "react-webpack",
    };

    const key = `${framework}-${buildTool}`;
    return templateMap[key] || "vue3-vite";
  }

  /**
   * 递归复制目录
   */
  private static async copyDirectory(
    sourcePath: string,
    targetPath: string,
    result: { success: string[]; failed: { file: string; error: string }[] }
  ): Promise<void> {
    try {
      // 确保目标目录存在
      await fs.mkdir(targetPath, { recursive: true });

      const entries = await fs.readdir(sourcePath, { withFileTypes: true });

      for (const entry of entries) {
        const sourceFile = join(sourcePath, entry.name);
        const targetFile = join(targetPath, this.processFileName(entry.name));

        try {
          if (entry.isDirectory()) {
            // 递归复制子目录
            await this.copyDirectory(sourceFile, targetFile, result);
          } else {
            // 复制文件
            await this.copyFile(sourceFile, targetFile);
            result.success.push(this.getRelativePath(targetFile));
          }
        } catch (error) {
          result.failed.push({
            file: this.getRelativePath(targetFile),
            error: error instanceof Error ? error.message : String(error),
          });
        }
      }
    } catch (error) {
      result.failed.push({
        file: this.getRelativePath(targetPath),
        error: `复制目录失败: ${
          error instanceof Error ? error.message : String(error)
        }`,
      });
    }
  }

  /**
   * 复制单个文件
   */
  private static async copyFile(
    sourcePath: string,
    targetPath: string
  ): Promise<void> {
    // 确保目标目录存在
    await fs.mkdir(dirname(targetPath), { recursive: true });

    // 复制文件
    await fs.copyFile(sourcePath, targetPath);
  }

  /**
   * 处理文件名（移除模板前缀）
   */
  private static processFileName(fileName: string): string {
    // 移除 _ 前缀（模板文件标识）
    if (fileName.startsWith("_")) {
      return fileName.substring(1);
    }
    return fileName;
  }

  /**
   * 获取相对路径
   */
  private static getRelativePath(fullPath: string): string {
    const cwd = process.cwd();
    return fullPath.startsWith(cwd)
      ? fullPath.substring(cwd.length + 1)
      : fullPath;
  }

  /**
   * 复制共享配置文件
   */
  static async copySharedConfigs(
    options: ScaffoldOptions,
    targetPath: string
  ): Promise<{ success: string[]; failed: { file: string; error: string }[] }> {
    const templateBasePath = this.getTemplateBasePath();
    const sharedPath = join(templateBasePath, "shared");
    const result = {
      success: [] as string[],
      failed: [] as { file: string; error: string }[],
    };

    try {
      // 复制配置文件
      await this.copyConfigFiles(sharedPath, targetPath, options, result);

      return result;
    } catch (error) {
      result.failed.push({
        file: "shared",
        error: `复制共享配置失败: ${
          error instanceof Error ? error.message : String(error)
        }`,
      });
      return result;
    }
  }

  /**
   * 复制配置文件
   */
  private static async copyConfigFiles(
    sharedPath: string,
    targetPath: string,
    options: ScaffoldOptions,
    result: { success: string[]; failed: { file: string; error: string }[] }
  ): Promise<void> {
    const configsPath = join(sharedPath, "configs");

    try {
      // 根据框架选择合适的配置文件
      const configFiles = this.getConfigFilesForFramework(options);

      for (const configFile of configFiles) {
        const sourcePath = join(configsPath, configFile.source);
        const targetFile = join(targetPath, configFile.target);

        try {
          await this.copyFile(sourcePath, targetFile);
          result.success.push(this.getRelativePath(targetFile));
        } catch (error) {
          // 如果文件不存在，不算错误（可能是可选配置）
          if ((error as any)?.code !== "ENOENT") {
            result.failed.push({
              file: configFile.target,
              error: error instanceof Error ? error.message : String(error),
            });
          }
        }
      }
    } catch (error) {
      result.failed.push({
        file: "configs",
        error: `处理配置文件失败: ${
          error instanceof Error ? error.message : String(error)
        }`,
      });
    }
  }

  /**
   * 获取框架对应的配置文件
   */
  private static getConfigFilesForFramework(
    options: ScaffoldOptions
  ): Array<{ source: string; target: string }> {
    const files: Array<{ source: string; target: string }> = [];

    // 公共配置文件
    files.push({ source: "_prettierrc.json", target: ".prettierrc.json" });
    files.push({ source: "_gitignore", target: ".gitignore" });

    // 根据框架选择ESLint配置
    if (options.framework.startsWith("vue")) {
      files.push({ source: "_eslintrc.vue.cjs", target: ".eslintrc.cjs" });
    } else if (options.framework === "react") {
      files.push({ source: "_eslintrc.react.cjs", target: ".eslintrc.cjs" });
    }

    // 测试配置
    if (options.testing.framework === "vitest") {
      files.push({ source: "_vitest.config.ts", target: "vitest.config.ts" });
    }

    return files;
  }
}
