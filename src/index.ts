
import express from 'express';
import lineWebhook from './line/webhook';
import membersRouter from './routes/members';
import pushRouter from './line/push';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';
import { checkRequiredEnvVars } from './utils/envCheck';

// ✅ 檢查環境變數
checkRequiredEnvVars();

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

// ✅ API 路由
app.use('/api', membersRouter);
app.use('/api', pushRouter);

// ✅ LINE Webhook：必須使用 raw parser
app.use('/webhook', express.raw({ type: 'application/json' }), lineWebhook);

// ✅ 錯誤處理中間件
app.use(notFoundHandler);
app.use(errorHandler);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
