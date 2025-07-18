
import express from 'express';
import { middleware } from '@line/bot-sdk';
import { config } from '../../config/config';
import lineController from '../../controllers/lineController';

const router = express.Router();

// LINE webhook POST 事件處理（包含錯誤處理）
router.post('/', 
  middleware({ channelSecret: config.line.channelSecret }),
  async (req, res) => {
    try {
      console.log('📨 收到 LINE webhook 請求');
      console.log('📦 Request headers:', {
        'x-line-signature': req.headers['x-line-signature'],
        'content-type': req.headers['content-type'],
        'user-agent': req.headers['user-agent']
      });
      
      await lineController.handleWebhook(req, res);
    } catch (error) {
      console.error('❌ LINE webhook 處理錯誤:', error);
      res.status(200).send('OK'); // LINE 要求回傳 200
    }
  }
);

// 推播訊息 API
router.post('/push/:userId', async (req, res) => {
  await lineController.handlePushMessage(req, res);
});

// GET 方法用於 webhook 驗證
router.get('/', (req, res) => {
  console.log('✅ LINE webhook GET 驗證請求');
  res.status(200).send('LINE webhook endpoint is active');
});

export default router;
