import { ScaffoldOptions, GeneratedFile } from '../types.js';

/**
 * 项目模板生成器
 */
export class TemplateGenerator {
  /**
   * 生成项目源文件模板
   */
  static generateSourceFiles(options: ScaffoldOptions, projectName: string): GeneratedFile[] {
    const files: GeneratedFile[] = [];

    // 生成入口文件
    files.push(this.generateMainFile(options));

    // 生成App组件
    files.push(this.generateAppComponent(options));

    // 生成示例组件
    files.push(this.generateExampleComponent(options));

    // 生成样式文件
    files.push(...this.generateStyleFiles(options));

    // 生成HTML模板
    files.push(this.generateIndexHtml(options, projectName));

    // 生成类型定义文件
    if (options.language === 'typescript') {
      files.push(...this.generateTypeFiles(options));
    }

    // 生成测试文件
    files.push(...this.generateTestFiles(options));

    return files;
  }

  /**
   * 生成入口文件
   */
  private static generateMainFile(options: ScaffoldOptions): GeneratedFile {
    const ext = options.language === 'typescript' ? 'ts' : 'js';
    
    let content = '';
    
    if (options.framework === 'vue3') {
      content = `import { createApp } from 'vue'
import App from './App.vue'
import './style.css'

${options.uiLibrary === 'element-plus' ? `import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'` : ''}

const app = createApp(App)

${options.uiLibrary === 'element-plus' ? 'app.use(ElementPlus)' : ''}

app.mount('#app')
`;
    } else if (options.framework === 'vue2') {
      content = `import Vue from 'vue'
import App from './App.vue'
import './style.css'

${options.uiLibrary === 'element-ui' ? `import ElementUI from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'

Vue.use(ElementUI)` : ''}

Vue.config.productionTip = false

new Vue({
  render: h => h(App),
}).$mount('#app')
`;
    } else if (options.framework === 'react') {
      content = `import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.${ext === 'ts' ? 'tsx' : 'jsx'}'
import './style.css'

${options.uiLibrary === 'antd' ? `import 'antd/dist/reset.css'` : ''}

ReactDOM.createRoot(document.getElementById('root')${ext === 'ts' ? '!' : ''}).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
`;
    }

    return {
      path: `src/main.${ext}`,
      type: 'source',
      content: content.trim(),
    };
  }

  /**
   * 生成App组件
   */
  private static generateAppComponent(options: ScaffoldOptions): GeneratedFile {
    let content = '';
    let fileName = '';

    if (options.framework.startsWith('vue')) {
      fileName = 'src/App.vue';
      const componentName = options.framework === 'vue3' ? 'HelloWorld' : 'HelloWorld';
      
      content = `<template>
  <div id="app">
    <header class="header">
      <h1>欢迎使用 ${options.framework.toUpperCase()}</h1>
      <p>这是一个使用 ${options.buildTool} + ${options.language} + ${options.styleFramework} 构建的项目</p>
    </header>
    
    <main class="main">
      <${componentName} />
    </main>
  </div>
</template>

<script${options.language === 'typescript' ? ' lang="ts"' : ''}>
${options.framework === 'vue3' 
  ? `import HelloWorld from './components/HelloWorld.vue'

export default {
  name: 'App',
  components: {
    HelloWorld
  }
}`
  : `import HelloWorld from './components/HelloWorld.vue'

export default {
  name: 'App',
  components: {
    HelloWorld
  }
}`}
</script>

<style scoped>
.header {
  text-align: center;
  padding: 2rem;
  background: #f5f5f5;
  margin-bottom: 2rem;
}

.main {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
}
</style>
`;
    } else if (options.framework === 'react') {
      const ext = options.language === 'typescript' ? 'tsx' : 'jsx';
      fileName = `src/App.${ext}`;
      
      content = `import React from 'react'
${options.uiLibrary === 'antd' ? `import { Button, Card, Space } from 'antd'` : ''}
import HelloWorld from './components/HelloWorld'

${options.language === 'typescript' ? 'const App: React.FC = () => {' : 'function App() {'}
  return (
    <div className="app">
      <header className="header">
        <h1>欢迎使用 React</h1>
        <p>这是一个使用 ${options.buildTool} + ${options.language} + ${options.styleFramework} 构建的项目</p>
      </header>
      
      <main className="main">
        ${options.uiLibrary === 'antd' 
          ? `<Card title="示例组件" style={{ maxWidth: 600, margin: '0 auto' }}>
          <Space direction="vertical" size="middle" style={{ display: 'flex' }}>
            <HelloWorld />
            <Button type="primary">Ant Design 按钮</Button>
          </Space>
        </Card>`
          : '<HelloWorld />'
        }
      </main>
    </div>
  )
}

export default App
`;
    }

    return {
      path: fileName,
      type: 'source',
      content: content.trim(),
    };
  }

  /**
   * 生成示例组件
   */
  private static generateExampleComponent(options: ScaffoldOptions): GeneratedFile {
    let content = '';
    let fileName = '';

    if (options.framework.startsWith('vue')) {
      fileName = 'src/components/HelloWorld.vue';
      
      content = `<template>
  <div class="hello-world">
    <h2>Hello World 组件</h2>
    <div class="features">
      <h3>技术栈特性：</h3>
      <ul>
        <li>✅ ${options.framework.toUpperCase()} 框架</li>
        <li>✅ ${options.language.toUpperCase()} 语言支持</li>
        <li>✅ ${options.buildTool.toUpperCase()} 构建工具</li>
        <li>✅ ${options.styleFramework.toUpperCase()} 样式方案</li>
        ${options.uiLibrary ? `<li>✅ ${options.uiLibrary} UI组件库</li>` : ''}
        <li>✅ ${options.testing.framework} 测试框架</li>
      </ul>
    </div>
    
    ${options.uiLibrary === 'element-plus' 
      ? `<el-button type="primary" @click="handleClick">Element Plus 按钮</el-button>`
      : options.uiLibrary === 'element-ui'
        ? `<el-button type="primary" @click="handleClick">Element UI 按钮</el-button>`
        : `<button class="btn" @click="handleClick">点击我</button>`
    }
    
    <p v-if="clicked">按钮被点击了！</p>
  </div>
</template>

<script${options.language === 'typescript' ? ' lang="ts"' : ''}>
${options.framework === 'vue3'
  ? `import { ref } from 'vue'

export default {
  name: 'HelloWorld',
  setup() {
    const clicked = ref(false)
    
    const handleClick = () => {
      clicked.value = !clicked.value
    }
    
    return {
      clicked,
      handleClick
    }
  }
}`
  : `export default {
  name: 'HelloWorld',
  data() {
    return {
      clicked: false
    }
  },
  methods: {
    handleClick() {
      this.clicked = !this.clicked
    }
  }
}`}
</script>

<style scoped>
.hello-world {
  padding: 2rem;
  text-align: center;
}

.features {
  margin: 2rem 0;
}

.features ul {
  list-style: none;
  padding: 0;
}

.features li {
  margin: 0.5rem 0;
  color: #42b883;
}

.btn {
  background: #42b883;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1rem;
}

.btn:hover {
  background: #369870;
}
</style>
`;
    } else if (options.framework === 'react') {
      const ext = options.language === 'typescript' ? 'tsx' : 'jsx';
      fileName = `src/components/HelloWorld.${ext}`;
      
      content = `import React, { useState } from 'react'
${options.uiLibrary === 'antd' ? `import { Button } from 'antd'` : ''}

${options.language === 'typescript' ? 'const HelloWorld: React.FC = () => {' : 'function HelloWorld() {'}
  const [clicked, setClicked] = useState(false)
  
  const handleClick = () => {
    setClicked(!clicked)
  }
  
  return (
    <div className="hello-world">
      <h2>Hello World 组件</h2>
      <div className="features">
        <h3>技术栈特性：</h3>
        <ul>
          <li>✅ REACT 框架</li>
          <li>✅ ${options.language.toUpperCase()} 语言支持</li>
          <li>✅ ${options.buildTool.toUpperCase()} 构建工具</li>
          <li>✅ ${options.styleFramework.toUpperCase()} 样式方案</li>
          ${options.uiLibrary ? `<li>✅ ${options.uiLibrary} UI组件库</li>` : ''}
          <li>✅ ${options.testing.framework} 测试框架</li>
        </ul>
      </div>
      
      ${options.uiLibrary === 'antd'
        ? `<Button type="primary" onClick={handleClick}>
        Ant Design 按钮
      </Button>`
        : `<button className="btn" onClick={handleClick}>
        点击我
      </button>`
      }
      
      {clicked && <p>按钮被点击了！</p>}
    </div>
  )
}

export default HelloWorld
`;
    }

    return {
      path: fileName,
      type: 'source',
      content: content.trim(),
    };
  }

  /**
   * 生成样式文件
   */
  private static generateStyleFiles(options: ScaffoldOptions): GeneratedFile[] {
    const files: GeneratedFile[] = [];

    // 主样式文件
    if (options.styleFramework === 'tailwind') {
      files.push({
        path: 'src/style.css',
        type: 'source',
        content: `@tailwind base;
@tailwind components;
@tailwind utilities;

/* 自定义样式 */
body {
  margin: 0;
  padding: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
    'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
    sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

#app, #root {
  min-height: 100vh;
}
`,
      });
    } else {
      const ext = options.styleFramework === 'sass' ? 'scss' : 'css';
      files.push({
        path: `src/style.${ext}`,
        type: 'source',
        content: `/* 全局样式 */
* {
  box-sizing: border-box;
}

body {
  margin: 0;
  padding: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
    'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
    sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  background-color: #f5f5f5;
}

#app, #root {
  min-height: 100vh;
}

.header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  text-align: center;
  padding: 2rem;
  
  h1 {
    margin: 0 0 1rem 0;
    font-size: 2.5rem;
  }
  
  p {
    margin: 0;
    opacity: 0.9;
  }
}

.main {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem 1rem;
}

.hello-world {
  background: white;
  border-radius: 8px;
  padding: 2rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  
  h2 {
    color: #333;
    margin-bottom: 1rem;
  }
  
  .features {
    margin: 2rem 0;
    
    ul {
      list-style: none;
      padding: 0;
      
      li {
        margin: 0.5rem 0;
        color: #42b883;
        font-weight: 500;
      }
    }
  }
}
`,
      });
    }

    return files;
  }

  /**
   * 生成HTML模板
   */
  private static generateIndexHtml(options: ScaffoldOptions, projectName: string): GeneratedFile {
    const rootId = options.framework.startsWith('vue') ? 'app' : 'root';
    
    const content = `<!DOCTYPE html>
<html lang="zh-CN">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${projectName}</title>
  </head>
  <body>
    <div id="${rootId}"></div>
    <script type="module" src="/src/main.${options.language === 'typescript' ? 'ts' : 'js'}"></script>
  </body>
</html>
`;

    return {
      path: 'index.html',
      type: 'template',
      content: content.trim(),
    };
  }

  /**
   * 生成类型定义文件
   */
  private static generateTypeFiles(options: ScaffoldOptions): GeneratedFile[] {
    const files: GeneratedFile[] = [];

    if (options.framework.startsWith('vue')) {
      // Vue类型定义
      files.push({
        path: 'src/vite-env.d.ts',
        type: 'source',
        content: `/// <reference types="vite/client" />

declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<{}, {}, any>
  export default component
}
`,
      });
    } else if (options.framework === 'react') {
      // React类型定义
      files.push({
        path: 'src/vite-env.d.ts',
        type: 'source',
        content: `/// <reference types="vite/client" />
`,
      });
    }

    // 通用类型定义
    files.push({
      path: 'src/types/index.ts',
      type: 'source',
      content: `// 项目通用类型定义

export interface User {
  id: number
  name: string
  email: string
}

export interface ApiResponse<T = any> {
  code: number
  message: string
  data: T
}
`,
    });

    return files;
  }

  /**
   * 生成测试文件
   */
  private static generateTestFiles(options: ScaffoldOptions): GeneratedFile[] {
    const files: GeneratedFile[] = [];

    if (options.testing.framework === 'vitest') {
      // Vitest测试设置
      files.push({
        path: 'src/test/setup.ts',
        type: 'source',
        content: `import { beforeAll, afterEach, afterAll } from 'vitest'
${options.testing.mockSolution === 'msw' ? `import { server } from '../mocks/server'` : ''}

${options.testing.mockSolution === 'msw' ? `// 启动服务器监听
beforeAll(() => server.listen())

// 每个测试后重置处理器
afterEach(() => server.resetHandlers())

// 清理
afterAll(() => server.close())` : ''}
`,
      });

      // 示例测试文件
      if (options.framework.startsWith('vue')) {
        files.push({
          path: 'src/components/__tests__/HelloWorld.test.ts',
          type: 'source',
          content: `import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import HelloWorld from '../HelloWorld.vue'

describe('HelloWorld', () => {
  it('renders properly', () => {
    const wrapper = mount(HelloWorld)
    expect(wrapper.text()).toContain('Hello World 组件')
  })

  it('handles click events', async () => {
    const wrapper = mount(HelloWorld)
    const button = wrapper.find('button')
    
    await button.trigger('click')
    expect(wrapper.text()).toContain('按钮被点击了')
  })
})
`,
        });
      } else if (options.framework === 'react') {
        files.push({
          path: 'src/components/__tests__/HelloWorld.test.tsx',
          type: 'source',
          content: `import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import HelloWorld from '../HelloWorld'

describe('HelloWorld', () => {
  it('renders properly', () => {
    render(<HelloWorld />)
    expect(screen.getByText('Hello World 组件')).toBeInTheDocument()
  })

  it('handles click events', () => {
    render(<HelloWorld />)
    const button = screen.getByRole('button')
    
    fireEvent.click(button)
    expect(screen.getByText('按钮被点击了！')).toBeInTheDocument()
  })
})
`,
        });
      }
    }

    return files;
  }
}