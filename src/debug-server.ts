
import express from 'express';
import { healthCheck } from './utils/healthCheck';

const app = express();
const PORT = 5001; // 使用不同 port 避免衝突

app.use(express.json());

// 偵錯路由
app.get('/debug/status', async (req, res) => {
  try {
    const health = await healthCheck();
    res.json({
      timestamp: new Date().toISOString(),
      server: 'debug server running',
      main_server: 'checking...',
      health_check: health
    });
  } catch (error) {
    res.status(500).json({
      error: 'Debug check failed',
      details: error instanceof Error ? error.message : '未知錯誤'
    });
  }
});

app.get('/debug/env', (req, res) => {
  res.json({
    PORT: !!process.env.PORT,
    DATABASE_URL: !!process.env.DATABASE_URL,
    LINE_ACCESS_TOKEN: !!process.env.LINE_CHANNEL_ACCESS_TOKEN,
    LINE_SECRET: !!process.env.LINE_CHANNEL_SECRET,
    DEBUG_URL: process.env.DEBUG_URL,
    NODE_ENV: process.env.NODE_ENV
  });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🔍 偵錯伺服器啟動於 http://0.0.0.0:${PORT}`);
  console.log(`📊 狀態檢查: http://0.0.0.0:${PORT}/debug/status`);
  console.log(`🔧 環境變數: http://0.0.0.0:${PORT}/debug/env`);
});
