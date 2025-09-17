#!/usr/bin/env node

/**
 * MCP服务器测试脚本
 */

import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function testMCPServer() {
  console.log('🧪 测试前端脚手架MCP服务器...\n');

  const serverPath = join(__dirname, 'dist', 'index.js');
  
  // 启动MCP服务器
  const server = spawn('node', [serverPath], {
    stdio: ['pipe', 'pipe', 'pipe']
  });

  let serverReady = false;

  server.stderr.on('data', (data) => {
    const message = data.toString();
    console.log('📡 服务器消息:', message.trim());
    if (message.includes('已启动')) {
      serverReady = true;
    }
  });

  // 等待服务器启动
  await new Promise((resolve) => {
    const checkReady = () => {
      if (serverReady) {
        resolve();
      } else {
        setTimeout(checkReady, 100);
      }
    };
    checkReady();
  });

  console.log('✅ MCP服务器启动成功！');

  // 测试工具列表请求
  const listToolsRequest = {
    jsonrpc: '2.0',
    id: 1,
    method: 'tools/list',
    params: {}
  };

  console.log('\n📋 测试工具列表请求...');
  server.stdin.write(JSON.stringify(listToolsRequest) + '\n');

  // 测试创建脚手架
  const createScaffoldRequest = {
    jsonrpc: '2.0',
    id: 2,
    method: 'tools/call',
    params: {
      name: 'create-scaffold',
      arguments: {
        projectName: 'test-vue-app',
        framework: 'vue3',
        language: 'typescript',
        buildTool: 'vite',
        styleFramework: 'tailwind'
      }
    }
  };

  console.log('\n🏗️ 测试创建脚手架请求...');
  server.stdin.write(JSON.stringify(createScaffoldRequest) + '\n');

  // 监听响应
  server.stdout.on('data', (data) => {
    try {
      const response = JSON.parse(data.toString().trim());
      console.log('📥 服务器响应:', JSON.stringify(response, null, 2));
    } catch (error) {
      console.log('📥 服务器输出:', data.toString().trim());
    }
  });

  // 等待一段时间后关闭服务器
  setTimeout(() => {
    console.log('\n🔚 关闭测试服务器...');
    server.kill();
    console.log('✅ 测试完成！');
    process.exit(0);
  }, 5000);
}

testMCPServer().catch((error) => {
  console.error('❌ 测试失败:', error);
  process.exit(1);
});