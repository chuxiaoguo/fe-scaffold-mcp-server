<template>
  <div id="app">
    <header class="header">
      <h1>欢迎使用 Vue3</h1>
      <p>这是一个使用 Vite + TypeScript + {{STYLE_FRAMEWORK}} 构建的项目</p>
    </header>
    
    <main class="main">
      <HelloWorld />
    </main>
  </div>
</template>

<script setup lang="ts">
import HelloWorld from './components/HelloWorld.vue'
</script>

<style scoped>
.header {
  text-align: center;
  padding: 2rem;
  background: linear-gradient(135deg, #42b883 0%, #35495e 100%);
  color: white;
  margin-bottom: 2rem;
}

.header h1 {
  margin: 0 0 1rem 0;
  font-size: 2.5rem;
}

.header p {
  margin: 0;
  opacity: 0.9;
}

.main {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
}
</style>