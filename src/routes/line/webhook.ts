
import express from 'express';
import { middleware } from '@line/bot-sdk';
import { config } from '../../config/config';
import lineController from '../../controllers/lineController';

const router = express.Router();

// LINE webhook POST 事件處理
router.post('/', 
  middleware({ channelSecret: config.line.channelSecret }), 
  async (req, res) => {
    await lineController.handleWebhook(req, res);
  }
);

// 推播訊息 API
router.post('/push/:userId', async (req, res) => {
  await lineController.handlePushMessage(req, res);
});

export default router;
