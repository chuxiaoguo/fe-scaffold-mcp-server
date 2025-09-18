import React from "react";
import ReactDOM from "react-dom/client";
import "antd/dist/reset.css"; // Ant Design 5.x 样式重置
import App from "./App.tsx";
import "./style.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
