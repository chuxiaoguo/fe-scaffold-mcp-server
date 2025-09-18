import { GeneratedFile } from "../types.js";
import { ErrorHandler, ErrorCode, Result } from "../core/error-handling-v2.js";
import { FileUtils } from "../utils/fileUtils.js";

/**
 * 文件服务 - 重构后的文件操作封装
 */
export class FileService {
  /**
   * 批量写入文件
   */
  async writeFiles(
    outputDir: string,
    files: GeneratedFile[]
  ): Promise<
    Result<{ success: string[]; failed: { file: string; error: string }[] }>
  > {
    return ErrorHandler.wrap(
      async () => {
        return await FileUtils.writeFiles(outputDir, files);
      },
      ErrorCode.FILE_WRITE_FAILED,
      { outputDir, fileCount: files.length }
    );
  }

  /**
   * 检查文件是否存在
   */
  async fileExists(filePath: string): Promise<Result<boolean>> {
    return ErrorHandler.wrap(
      async () => {
        return await FileUtils.fileExists(filePath);
      },
      ErrorCode.FILE_NOT_FOUND,
      { filePath }
    );
  }

  /**
   * 读取文件内容
   */
  async readFile(filePath: string): Promise<Result<string>> {
    return ErrorHandler.wrap(
      async () => {
        return await FileUtils.readFile(filePath);
      },
      ErrorCode.FILE_READ_FAILED,
      { filePath }
    );
  }

  /**
   * 创建项目目录结构
   */
  async createProjectStructure(
    projectPath: string,
    structure: Record<string, string | null>
  ): Promise<Result<boolean>> {
    return ErrorHandler.wrap(
      async () => {
        await FileUtils.createProjectStructure(projectPath, structure);
        return true;
      },
      ErrorCode.DIRECTORY_CREATE_FAILED,
      { projectPath }
    );
  }

  /**
   * 验证项目文件完整性
   */
  async validateProjectFiles(
    projectPath: string,
    requiredFiles: string[]
  ): Promise<Result<{ isValid: boolean; missingFiles: string[] }>> {
    return ErrorHandler.wrap(
      async () => {
        const missingFiles: string[] = [];

        for (const file of requiredFiles) {
          const exists = await FileUtils.fileExists(`${projectPath}/${file}`);
          if (!exists) {
            missingFiles.push(file);
          }
        }

        return {
          isValid: missingFiles.length === 0,
          missingFiles,
        };
      },
      ErrorCode.FILE_NOT_FOUND,
      { projectPath, requiredFiles }
    );
  }

  /**
   * 安全路径检查
   */
  isPathSafe(path: string): boolean {
    // 检查路径遍历攻击
    const normalizedPath = path.replace(/\\/g, "/");

    // 禁止的模式
    const dangerousPatterns = [
      "../",
      "..\\",
      "/etc/",
      "/usr/",
      "/root/",
      "C:/",
      "D:/",
    ];

    return !dangerousPatterns.some((pattern) =>
      normalizedPath.toLowerCase().includes(pattern.toLowerCase())
    );
  }

  /**
   * 清理路径
   */
  sanitizePath(path: string): string {
    // 移除危险字符
    return path
      .replace(/[<>:"|?*]/g, "")
      .replace(/\.\./g, "")
      .replace(/\/+/g, "/")
      .replace(/\\+/g, "\\");
  }
}
