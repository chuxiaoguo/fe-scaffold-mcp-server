// webpack代理配置
module.exports = {
  "/api": {
    target: "http://localhost:3001",
    changeOrigin: true,
    pathRewrite: {
      "^/api": "/api",
    },
    onProxyReq: (proxyReq, req, res) => {
      console.log("Proxying request:", req.method, req.url);
    },
  },
};
