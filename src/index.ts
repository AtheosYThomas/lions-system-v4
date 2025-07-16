import express from 'express';
import lineWebhook from './line/webhook';

const app = express();
app.use(express.json()); // 一定要加

app.use('/webhook', lineWebhook);

const PORT = parseInt(process.env.PORT || '3000');
app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Server is running on port ${PORT}`);
});