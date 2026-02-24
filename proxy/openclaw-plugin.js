/**
 * OpenClaw Gateway 代理插件
 * 将 /historical-agents 路径代理到 Historical Agents MMO 服务
 */

const httpProxy = require('http-proxy');
const proxy = httpProxy.createProxyServer({});

// Historical Agents MMO 服务地址
const HISTORICAL_AGENTS_TARGET = 'http://localhost:4567';

module.exports = {
  name: 'historical-agents-proxy',
  
  setup(app) {
    // 代理所有 /historical-agents/* 请求
    app.use('/historical-agents', (req, res, next) => {
      // 修改请求路径，去掉 /historical-agents 前缀
      req.url = req.url.replace(/^\/historical-agents/, '') || '/';
      
      proxy.web(req, res, {
        target: HISTORICAL_AGENTS_TARGET,
        changeOrigin: true,
        ws: true // 支持 WebSocket
      }, (err) => {
        console.error('Proxy error:', err.message);
        res.status(502).json({
          error: 'Historical Agents MMO service unavailable',
          message: err.message
        });
      });
    });
    
    // 代理 WebSocket 连接
    app.use('/historical-agents', (req, res, next) => {
      if (req.headers.upgrade === 'websocket') {
        proxy.ws(req, res, {
          target: HISTORICAL_AGENTS_TARGET,
          changeOrigin: true
        });
      } else {
        next();
      }
    });
    
    console.log('Historical Agents proxy registered at /historical-agents');
  },
  
  // WebSocket 升级处理
  upgrade(req, socket, head) {
    if (req.url.startsWith('/historical-agents')) {
      req.url = req.url.replace(/^\/historical-agents/, '') || '/';
      proxy.ws(req, socket, head, {
        target: HISTORICAL_AGENTS_TARGET,
        changeOrigin: true
      });
    }
  }
};
