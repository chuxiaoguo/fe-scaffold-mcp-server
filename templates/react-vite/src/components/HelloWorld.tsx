import React, { useState } from "react";

const HelloWorld: React.FC = () => {
  const [clicked, setClicked] = useState(false);

  const handleClick = () => {
    setClicked(!clicked);
  };

  return (
    <div className="hello-world">
      <h2>Hello World 组件</h2>
      <div className="features">
        <h3>技术栈特性：</h3>
        <ul>
          <li>✅ REACT 框架</li>
          <li>✅ TYPESCRIPT 语言支持</li>
          <li>✅ VITE 构建工具</li>
          <li>✅ STYLE_FRAMEWORK 样式方案</li>
          <li>✅ UI_LIBRARY UI组件库</li>
          <li>✅ Vitest 测试框架</li>
        </ul>
      </div>

      <button className="btn" onClick={handleClick}>
        点击我
      </button>

      {clicked && <p>按钮被点击了！</p>}
    </div>
  );
};

export default HelloWorld;
