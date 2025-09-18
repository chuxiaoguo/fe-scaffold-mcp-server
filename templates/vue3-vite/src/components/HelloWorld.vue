<template>
  <div class="hello-world">
    <h2>Hello World 组件</h2>
    <div class="features">
      <h3>技术栈特性：</h3>
      <ul>
        <li>✅ Vue 3 框架</li>
        <li>✅ TypeScript 语言支持</li>
        <li>✅ Vite 构建工具</li>
        <li>✅ Tailwind CSS 样式方案</li>
        <li>✅ Element Plus UI组件库</li>
        <li>✅ Vitest 测试框架</li>
      </ul>
    </div>
    
    <div class="demo-section">
      <el-button type="primary" @click="handleClick" :icon="Star">
        {{ clicked ? '已点击' : '点击我' }}
      </el-button>
      <el-button type="success" :icon="Check">成功</el-button>
      <el-button type="info" :icon="InfoFilled">信息</el-button>
      <el-button type="warning" :icon="Warning">警告</el-button>
    </div>

    <div class="demo-section">
      <el-input
        v-model="inputValue"
        placeholder="请输入内容"
        style="width: 200px; margin-right: 10px"
      />
      <el-tag v-if="inputValue" type="success">{{ inputValue }}</el-tag>
    </div>
    
    <el-alert
      v-if="clicked"
      title="按钮被点击了！"
      type="success"
      :closable="false"
      show-icon
    />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { Star, Check, InfoFilled, Warning } from '@element-plus/icons-vue'

const clicked = ref(false)
const inputValue = ref('')

const handleClick = () => {
  clicked.value = !clicked.value
}
</script>

<style scoped>
.hello-world {
  background: white;
  border-radius: 8px;
  padding: 2rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  text-align: center;
}

.hello-world h2 {
  color: #333;
  margin-bottom: 1rem;
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
  font-weight: 500;
}

.demo-section {
  margin: 20px 0;
}
</style>