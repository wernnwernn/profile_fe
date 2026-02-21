const { createProxyMiddleware } = require("http-proxy-middleware");

module.exports = function (app) {
  app.use(
    "/api",
    createProxyMiddleware({
      // รับค่าเพียงตัวเดียวจาก .env เช่น REACT_APP_API_BASE=http://localhost:5000
      target: process.env.REACT_APP_API_BASE || "http://localhost:5000",
      changeOrigin: true,
    })
  );
};
