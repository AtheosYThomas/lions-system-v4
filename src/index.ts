
import express from 'express';
import lineWebhook from './line/webhook';
import membersRouter from './routes/members';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';

const app = express();

// ✅ 基本中間件
app.use(express.json({ limit: '10mb' }));

// ✅ health check 路由
app.get('/healthz', (_req, res) => res.status(200).send('OK'));

// ✅ API 路由
app.use('/api', membersRouter);

// ✅ LINE Webhook：必須使用 raw parser
app.use('/webhook', express.raw({ type: 'application/json' }), lineWebhook);

// ✅ 錯誤處理中間件
app.use(notFoundHandler);
app.use(errorHandler);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
