
import express from 'express';
import lineWebhook from './line/webhook';

const app = express();
app.use(express.json());

// ✅ 這個是給你「瀏覽器」用來測試是否啟動
app.get('/healthz', (_req, res) => res.status(200).send('OK'));

// ✅ 這個是給「LINE伺服器」發送 webhook 用的
app.use('/webhook', lineWebhook);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
