
import express from 'express';
import { middleware } from '@line/bot-sdk';
import { config } from '../../config/config';
import lineController from '../../controllers/lineController';

const router = express.Router();

// LINE webhook POST 事件處理（包含錯誤處理）
router.post('/', 
  (req, res, next) => {
    // 自定義 middleware 錯誤處理
    middleware({ channelSecret: config.line.channelSecret })(req, res, (err) => {
      if (err) {
        console.log('⚠️ LINE webhook 簽名驗證失敗 - 可能是非 LINE 平台的請求');
        return res.status(200).send('OK'); // LINE 要求回傳 200
      }
      next();
    });
  },
  async (req, res) => {
    await lineController.handleWebhook(req, res);
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
