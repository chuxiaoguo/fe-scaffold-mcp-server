import React from "react";
import HelloWorld from "./components/HelloWorld";

const App: React.FC = () => {
  return (
    <div className="app">
      <header className="header">
        <h1>欢迎使用 React</h1>
        <p>这是一个使用 Vite + TypeScript + {{ STYLE_FRAMEWORK }} 构建的项目</p>
      </header>

      <main className="main">
        <HelloWorld />
      </main>
    </div>
  );
};

export default App;
