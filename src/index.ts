
import express from 'express';
import lineWebhook from './line/webhook';
import membersRouter from './routes/members';
import pushRouter from './line/push';
import adminRouter from './routes/admin';
import checkinRouter from './routes/checkin';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';
import { checkRequiredEnvVars } from './utils/envCheck';

// ✅ 檢查環境變數
checkRequiredEnvVars();

// ✅ 載入模型關聯設定
import './models/index';

const app = express();

// ✅ 基本中間件
app.use(express.json({ limit: '10mb' }));
app.use(express.static('client/dist')); // 提供前端靜態檔案

// ✅ health check 路由
app.get('/healthz', (_req, res) => res.status(200).send('OK'));
app.get('/health', (_req, res) => res.status(200).json({ 
  status: 'healthy', 
  timestamp: new Date().toISOString(),
  version: '4.0'
}));

// ✅ 系統狀態監控
app.get('/api/system/status', (_req, res) => {
  const memoryUsage = process.memoryUsage();
  const uptime = process.uptime();
  
  res.json({
    system: {
      uptime: `${Math.floor(uptime / 60)} 分鐘`,
      memory: {
        used: `${Math.round(memoryUsage.heapUsed / 1024 / 1024)} MB`,
        total: `${Math.round(memoryUsage.heapTotal / 1024 / 1024)} MB`
      },
      nodeVersion: process.version,
      platform: process.platform
    },
    timestamp: new Date().toISOString()
  });
});

// ✅ API 路由
app.use('/api', membersRouter);
app.use('/api', pushRouter);
app.use('/api/admin', adminRouter);
app.use('/api', checkinRouter);

// ✅ LINE Webhook：必須使用 raw parser
app.use('/webhook', express.raw({ type: 'application/json' }), lineWebhook);

// ✅ 404 處理必須在所有路由之後
app.use(notFoundHandler);

// ✅ 錯誤處理中間件必須在最後
app.use(errorHandler);

const PORT: number = parseInt(process.env.PORT || '3000', 10);
app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Server running on 0.0.0.0:${PORT}`);
});
