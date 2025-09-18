#!/usr/bin/env node

/**
 * 完整功能测试脚本
 */

import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function testCompleteFeatures() {
  console.log('🧪 测试前端脚手架MCP服务器完整功能...\n');

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

  console.log('✅ MCP服务器启动成功！\n');

  // 测试1: 列出工具
  console.log('📋 测试1: 列出工具...');
  server.stdin.write(JSON.stringify({
    jsonrpc: '2.0',
    id: 1,
    method: 'tools/list',
    params: {}
  }) + '\n');

  await delay(1000);

  // 测试2: 预览配置
  console.log('\n🔍 测试2: 预览Vue3项目配置...');
  server.stdin.write(JSON.stringify({
    jsonrpc: '2.0',
    id: 2,
    method: 'tools/call',
    params: {
      name: 'preview-config',
      arguments: {
        projectName: 'test-vue3-preview',
        framework: 'vue3',
        language: 'typescript',
        buildTool: 'vite',
        styleFramework: 'tailwind',
        showFileContent: true
      }
    }
  }) + '\n');

  await delay(2000);

  // 测试3: 验证技术栈
  console.log('\n⚖️ 测试3: 验证技术栈兼容性...');
  server.stdin.write(JSON.stringify({
    jsonrpc: '2.0',
    id: 3,
    method: 'tools/call',
    params: {
      name: 'validate-stack',
      arguments: {
        framework: 'react',
        buildTool: 'webpack',
        language: 'javascript',
        styleFramework: 'sass'
      }
    }
  }) + '\n');

  await delay(1500);

  // 测试4: 创建实际项目
  console.log('\n🏗️ 测试4: 创建实际项目...');
  server.stdin.write(JSON.stringify({
    jsonrpc: '2.0',
    id: 4,
    method: 'tools/call',
    params: {
      name: 'create-scaffold',
      arguments: {
        projectName: 'test-real-project',
        framework: 'vue3',
        language: 'typescript',
        buildTool: 'vite',
        styleFramework: 'tailwind',
        features: ['eslint', 'prettier', 'testing', 'mock']
      }
    }
  }) + '\n');

  await delay(3000);

  // 测试5: 列出模板
  console.log('\n📜 测试5: 列出可用模板...');
  server.stdin.write(JSON.stringify({
    jsonrpc: '2.0',
    id: 5,
    method: 'tools/call',
    params: {
      name: 'list-templates',
      arguments: {
        framework: 'vue3'
      }
    }
  }) + '\n');

  // 监听响应
  server.stdout.on('data', (data) => {
    try {
      const lines = data.toString().trim().split('\n');
      lines.forEach(line => {
        if (line.trim()) {
          const response = JSON.parse(line);
          console.log(`📥 [ID:${response.id}] 服务器响应:`, JSON.stringify(response, null, 2));
        }
      });
    } catch (error) {
      console.log('📥 服务器输出:', data.toString().trim());
    }
  });

  // 等待一段时间后关闭服务器
  setTimeout(() => {
    console.log('\n🔚 关闭测试服务器...');
    server.kill();
    console.log('✅ 完整功能测试完成！');
    process.exit(0);
  }, 10000);
}

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

testCompleteFeatures().catch((error) => {
  console.error('❌ 测试失败:', error);
  process.exit(1);
});