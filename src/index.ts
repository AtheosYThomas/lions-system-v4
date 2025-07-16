
import express from 'express';
import lineWebhook from './line/webhook';

const app = express();

// ✅ health check 路由
app.get('/healthz', (_req, res) => res.status(200).send('OK'));

// ✅ LINE Webhook：必須使用 raw parser
app.use('/webhook', express.raw({ type: 'application/json' }), lineWebhook);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
