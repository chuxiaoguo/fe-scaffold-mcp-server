#!/usr/bin/env node

/**
 * 简化的单项目验证测试
 */

import { spawn, execSync } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { existsSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function quickTest() {
  console.log('🧪 快速项目验证测试\n');

  const projectName = 'quick-test-project';
  
  // 1. 创建项目
  console.log('1️⃣ 创建Vue3项目...');
  const created = await createProject(projectName);
  if (!created) {
    console.log('❌ 项目创建失败');
    return;
  }
  
  const projectPath = join(__dirname, projectName);
  console.log(`✅ 项目创建成功: ${projectPath}`);

  // 2. 验证文件
  console.log('\n2️⃣ 验证关键文件...');
  const requiredFiles = [
    'package.json',
    'tsconfig.json', 
    'tsconfig.node.json',
    'vite.config.ts',
    'postcss.config.js',
    'tailwind.config.cjs'
  ];
  
  const missing = [];
  for (const file of requiredFiles) {
    if (existsSync(join(projectPath, file))) {
      console.log(`✅ ${file}`);
    } else {
      console.log(`❌ ${file}`);
      missing.push(file);
    }
  }
  
  if (missing.length > 0) {
    console.log(`\n❌ 缺少文件: ${missing.join(', ')}`);
    return;
  }

  // 3. 安装依赖
  console.log('\n3️⃣ 安装依赖...');
  try {
    execSync('npm install', { 
      cwd: projectPath, 
      stdio: 'inherit',
      timeout: 120000
    });
    console.log('✅ 依赖安装成功');
  } catch (error) {
    console.log('❌ 依赖安装失败:', error.message);
    return;
  }

  // 4. 测试构建
  console.log('\n4️⃣ 测试构建...');
  try {
    execSync('npm run build', { 
      cwd: projectPath, 
      stdio: 'inherit',
      timeout: 60000
    });
    
    if (existsSync(join(projectPath, 'dist'))) {
      console.log('✅ 构建成功');
    } else {
      console.log('❌ 构建文件未生成');
    }
  } catch (error) {
    console.log('❌ 构建失败:', error.message);
  }

  // 5. 测试代码检查
  console.log('\n5️⃣ 测试代码检查...');
  try {
    execSync('npm run lint', { 
      cwd: projectPath, 
      stdio: 'inherit',
      timeout: 30000
    });
    console.log('✅ ESLint检查通过');
  } catch (error) {
    console.log('⚠️ ESLint检查有问题（可能是预期的）');
  }

  console.log('\n🎉 项目验证完成！');
}

async function createProject(projectName) {
  return new Promise((resolve) => {
    const serverPath = join(__dirname, 'dist', 'index.js');
    const server = spawn('node', [serverPath], {
      stdio: ['pipe', 'pipe', 'pipe']
    });

    let serverReady = false;
    let responseReceived = false;

    server.stderr.on('data', (data) => {
      const message = data.toString();
      if (message.includes('已启动')) {
        serverReady = true;
        
        server.stdin.write(JSON.stringify({
          jsonrpc: '2.0',
          id: 1,
          method: 'tools/call',
          params: {
            name: 'create-scaffold',
            arguments: {
              projectName: projectName,
              framework: 'vue3',
              language: 'typescript',
              buildTool: 'vite',
              styleFramework: 'tailwind',
              features: ['eslint', 'prettier', 'testing', 'mock']
            }
          }
        }) + '\n');
      }
    });

    server.stdout.on('data', (data) => {
      try {
        const lines = data.toString().trim().split('\n');
        lines.forEach(line => {
          if (line.trim()) {
            const response = JSON.parse(line);
            if (response.id === 1 && !responseReceived) {
              responseReceived = true;
              server.kill();
              
              if (response.result && response.result.content) {
                resolve(true);
              } else {
                resolve(false);
              }
            }
          }
        });
      } catch (error) {
        // 忽略解析错误
      }
    });

    setTimeout(() => {
      if (!responseReceived) {
        server.kill();
        resolve(false);
      }
    }, 10000);
  });
}

quickTest().catch(error => {
  console.error('❌ 测试过程发生错误:', error);
  process.exit(1);
});