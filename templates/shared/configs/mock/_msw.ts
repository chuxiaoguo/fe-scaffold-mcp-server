// MSW配置文件
import { setupWorker } from "msw/browser";
import { handlers } from "./handlers";

// 创建service worker
export const worker = setupWorker(...handlers);

// 开发环境启动
if (process.env.NODE_ENV === "development") {
  worker.start({
    onUnhandledRequest: "warn",
  });
}
