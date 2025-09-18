<template>
  <div class="hello-world">
    <h2>Hello World 组件</h2>
    <div class="features">
      <h3>技术栈特性：</h3>
      <ul>
        <li>✅ VUE3 框架</li>
        <li>✅ TYPESCRIPT 语言支持</li>
        <li>✅ VITE 构建工具</li>
        <li>✅ {{STYLE_FRAMEWORK}} 样式方案</li>
        <li>✅ {{UI_LIBRARY}} UI组件库</li>
        <li>✅ Vitest 测试框架</li>
      </ul>
    </div>
    
    <button class="btn" @click="handleClick">点击我</button>
    
    <p v-if="clicked">按钮被点击了！</p>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const clicked = ref(false)

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

.btn {
  background: #42b883;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1rem;
  transition: background-color 0.3s;
}

.btn:hover {
  background: #369870;
}
</style>