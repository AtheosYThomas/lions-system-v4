
import express from 'express';
import lineWebhook from './line/webhook';

const app = express();

// 🔐 必須解析 JSON，否則 req.body 是空的！
app.use(express.json());

// 🔗 綁定 LINE webhook 路由
app.use('/webhook', lineWebhook);

// 🚀 啟動伺服器
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Server is running on port ${PORT}`);
});
