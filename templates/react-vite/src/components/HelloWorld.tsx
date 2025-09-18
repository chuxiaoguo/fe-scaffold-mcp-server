import React, { useState } from "react";
import { Button, Input, Tag, Alert, Space } from "antd";
import { StarOutlined, CheckOutlined, InfoCircleOutlined, ExclamationCircleOutlined } from "@ant-design/icons";

const HelloWorld: React.FC = () => {
  const [clicked, setClicked] = useState(false);
  const [inputValue, setInputValue] = useState("");

  const handleClick = () => {
    setClicked(!clicked);
  };

  return (
    <div className="hello-world">
      <h2>Hello World 组件</h2>
      <div className="features">
        <h3>技术栈特性：</h3>
        <ul>
          <li>✅ React 框架</li>
          <li>✅ TypeScript 语言支持</li>
          <li>✅ Vite 构建工具</li>
          <li>✅ Tailwind CSS 样式方案</li>
          <li>✅ Ant Design UI组件库</li>
          <li>✅ Vitest 测试框架</li>
        </ul>
      </div>

      <div className="demo-section">
        <Space wrap>
          <Button 
            type="primary" 
            icon={<StarOutlined />} 
            onClick={handleClick}
          >
            {clicked ? '已点击' : '点击我'}
          </Button>
          <Button type="default" icon={<CheckOutlined />}>
            成功
          </Button>
          <Button type="dashed" icon={<InfoCircleOutlined />}>
            信息
          </Button>
          <Button danger icon={<ExclamationCircleOutlined />}>
            警告
          </Button>
        </Space>
      </div>

      <div className="demo-section">
        <Space>
          <Input
            placeholder="请输入内容"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            style={{ width: 200 }}
          />
          {inputValue && <Tag color="success">{inputValue}</Tag>}
        </Space>
      </div>

      {clicked && (
        <Alert
          message="按钮被点击了！"
          type="success"
          showIcon
          className="demo-alert"
        />
      )}
    </div>
  );
};

export default HelloWorld;
