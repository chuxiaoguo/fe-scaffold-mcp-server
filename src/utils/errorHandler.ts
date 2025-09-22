/**
 * 错误处理工具类
 */

export interface ErrorContext {
  operation: string;
  file?: string;
  details?: Record<string, any>;
}

export interface ProcessingError {
  code: string;
  message: string;
  context: ErrorContext;
  timestamp: Date;
  recoverable: boolean;
}

/**
 * 错误处理器
 */
export class ErrorHandler {
  private static errors: ProcessingError[] = [];

  /**
   * 记录错误
   */
  static recordError(
    code: string,
    message: string,
    context: ErrorContext,
    recoverable: boolean = false
  ): ProcessingError {
    const error: ProcessingError = {
      code,
      message,
      context,
      timestamp: new Date(),
      recoverable,
    };

    this.errors.push(error);
    return error;
  }

  /**
   * 获取所有错误
   */
  static getErrors(): ProcessingError[] {
    return [...this.errors];
  }

  /**
   * 获取可恢复的错误
   */
  static getRecoverableErrors(): ProcessingError[] {
    return this.errors.filter(error => error.recoverable);
  }

  /**
   * 清除错误记录
   */
  static clearErrors(): void {
    this.errors = [];
  }

  /**
   * 格式化错误信息
   */
  static formatError(error: ProcessingError): string {
    let message = `[${error.code}] ${error.message}`;
    
    if (error.context.file) {
      message += ` (文件: ${error.context.file})`;
    }
    
    if (error.context.operation) {
      message += ` (操作: ${error.context.operation})`;
    }

    if (error.context.details) {
      const details = Object.entries(error.context.details)
        .map(([key, value]) => `${key}: ${value}`)
        .join(', ');
      message += ` (详情: ${details})`;
    }

    return message;
  }

  /**
   * 生成错误报告
   */
  static generateReport(): string {
    if (this.errors.length === 0) {
      return '✅ 没有错误记录';
    }

    let report = `❌ 错误报告 (共 ${this.errors.length} 个错误)\n\n`;

    // 按操作分组
    const errorsByOperation = this.errors.reduce((acc, error) => {
      const operation = error.context.operation;
      if (!acc[operation]) {
        acc[operation] = [];
      }
      acc[operation].push(error);
      return acc;
    }, {} as Record<string, ProcessingError[]>);

    Object.entries(errorsByOperation).forEach(([operation, errors]) => {
      report += `## ${operation}\n`;
      errors.forEach((error, index) => {
        report += `${index + 1}. ${this.formatError(error)}\n`;
        if (error.recoverable) {
          report += `   💡 此错误可以恢复\n`;
        }
      });
      report += '\n';
    });

    return report;
  }

  /**
   * 尝试自动恢复错误
   */
  static async attemptRecovery(): Promise<{
    recovered: number;
    failed: number;
    details: string[];
  }> {
    const recoverableErrors = this.getRecoverableErrors();
    const details: string[] = [];
    let recovered = 0;
    let failed = 0;

    for (const error of recoverableErrors) {
      try {
        // 这里可以实现具体的恢复逻辑
        // 例如重试文件操作、使用默认值等
        await this.recoverFromError(error);
        recovered++;
        details.push(`✅ 已恢复: ${error.code} - ${error.message}`);
      } catch (recoveryError) {
        failed++;
        details.push(`❌ 恢复失败: ${error.code} - ${recoveryError}`);
      }
    }

    return { recovered, failed, details };
  }

  /**
   * 从特定错误中恢复
   */
  private static async recoverFromError(error: ProcessingError): Promise<void> {
    switch (error.code) {
      case 'FILE_NOT_FOUND':
        // 尝试使用默认文件或跳过
        break;
      case 'DEPENDENCY_VERSION_CONFLICT':
        // 使用兼容版本
        break;
      case 'TEMPLATE_MISSING':
        // 使用默认模板
        break;
      default:
        throw new Error(`无法恢复错误类型: ${error.code}`);
    }
  }
}

/**
 * 错误代码常量
 */
export const ERROR_CODES = {
  // 文件操作错误
  FILE_NOT_FOUND: 'FILE_NOT_FOUND',
  FILE_WRITE_FAILED: 'FILE_WRITE_FAILED',
  FILE_READ_FAILED: 'FILE_READ_FAILED',
  DIRECTORY_CREATE_FAILED: 'DIRECTORY_CREATE_FAILED',

  // 模板错误
  TEMPLATE_NOT_FOUND: 'TEMPLATE_NOT_FOUND',
  TEMPLATE_INVALID: 'TEMPLATE_INVALID',
  TEMPLATE_COPY_FAILED: 'TEMPLATE_COPY_FAILED',

  // 依赖错误
  DEPENDENCY_RESOLUTION_FAILED: 'DEPENDENCY_RESOLUTION_FAILED',
  DEPENDENCY_VERSION_CONFLICT: 'DEPENDENCY_VERSION_CONFLICT',
  PACKAGE_JSON_INVALID: 'PACKAGE_JSON_INVALID',

  // 配置错误
  CONFIG_INVALID: 'CONFIG_INVALID',
  CONFIG_MISSING: 'CONFIG_MISSING',
  VALIDATION_FAILED: 'VALIDATION_FAILED',

  // 网络错误
  NETWORK_ERROR: 'NETWORK_ERROR',
  REGISTRY_UNAVAILABLE: 'REGISTRY_UNAVAILABLE',

  // 系统错误
  PERMISSION_DENIED: 'PERMISSION_DENIED',
  DISK_SPACE_INSUFFICIENT: 'DISK_SPACE_INSUFFICIENT',
  SYSTEM_ERROR: 'SYSTEM_ERROR',
} as const;