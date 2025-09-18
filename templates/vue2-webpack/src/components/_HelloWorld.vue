<template>
  <div class="hello">
    <h1>{{ msg }}</h1>
    <p>
      This is a Vue 2 project with Element UI components.
    </p>
    
    <div class="demo-section">
      <el-button type="primary" @click="handleClick">Primary Button</el-button>
      <el-button type="success">Success Button</el-button>
      <el-button type="info">Info Button</el-button>
      <el-button type="warning">Warning Button</el-button>
      <el-button type="danger">Danger Button</el-button>
    </div>

    <div class="demo-section">
      <el-input
        v-model="inputValue"
        placeholder="Please input"
        style="width: 200px"
      ></el-input>
      <p v-if="inputValue">You typed: {{ inputValue }}</p>
    </div>
  </div>
</template>

<script>
export default {
  name: "HelloWorld",
  props: {
    msg: String,
  },
  data() {
    return {
      inputValue: "",
    };
  },
  methods: {
    handleClick() {
      this.$message({
        message: "Hello Element UI!",
        type: "success",
      });
    },
  },
};
</script>

<style scoped>
.hello {
  padding: 20px;
}

.demo-section {
  margin: 20px 0;
}
</style>