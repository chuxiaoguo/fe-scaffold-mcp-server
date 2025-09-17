import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';

import { createScaffoldTool, handleCreateScaffold } from './tools/createScaffold.js';
import { listTemplatesTool, handleListTemplates } from './tools/listTemplates.js';
import { validateStackTool, handleValidateStack } from './tools/validateStack.js';
import { previewConfigTool, handlePreviewConfig } from './tools/previewConfig.js';

/**
 * 前端脚手架MCP服务器
 */
class FeScaffoldServer {
  private server: Server;

  constructor() {
    this.server = new Server(
      {
        name: 'fe-scaffold-mcp-server',
        version: '1.0.0',
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    this.setupToolHandlers();
    this.setupErrorHandling();
  }

  /**
   * 设置工具处理器
   */
  private setupToolHandlers(): void {
    // 注册工具列表
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      return {
        tools: [
          createScaffoldTool,
          listTemplatesTool,
          validateStackTool,
          previewConfigTool,
        ],
      };
    });

    // 注册工具调用处理器
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      try {
        switch (name) {
          case 'create-scaffold':
            return {
              content: [
                {
                  type: 'text',
                  text: await handleCreateScaffold(args as any),
                },
              ],
            };

          case 'list-templates':
            return {
              content: [
                {
                  type: 'text',
                  text: await handleListTemplates(args as any),
                },
              ],
            };

          case 'validate-stack':
            return {
              content: [
                {
                  type: 'text',
                  text: await handleValidateStack(args as any),
                },
              ],
            };

          case 'preview-config':
            return {
              content: [
                {
                  type: 'text',
                  text: await handlePreviewConfig(args as any),
                },
              ],
            };

          default:
            throw new Error(`未知的工具: ${name}`);
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        return {
          content: [
            {
              type: 'text',
              text: `❌ 执行工具 "${name}" 时发生错误: ${errorMessage}`,
            },
          ],
        };
      }
    });
  }

  /**
   * 设置错误处理
   */
  private setupErrorHandling(): void {
    this.server.onerror = (error) => {
      console.error('[MCP Server Error]', error);
    };

    process.on('SIGINT', async () => {
      await this.server.close();
      process.exit(0);
    });

    process.on('SIGTERM', async () => {
      await this.server.close();
      process.exit(0);
    });
  }

  /**
   * 启动服务器
   */
  async start(): Promise<void> {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    
    console.error('前端脚手架MCP服务器已启动');
    console.error('支持的工具: create-scaffold, list-templates, validate-stack, preview-config');
  }
}

// 启动服务器
async function main() {
  const server = new FeScaffoldServer();
  await server.start();
}

// 错误处理
main().catch((error) => {
  console.error('启动MCP服务器失败:', error);
  process.exit(1);
});