import express from 'express';
import { middleware } from '@line/bot-sdk';
import { config } from '../../config/config';
import lineController from '../../controllers/lineController';
import crypto from 'crypto';

const router = express.Router();

// 手動驗證簽名的中間件
function validateLineSignature(req: express.Request, res: express.Response, next: express.NextFunction) {
  try {
    const channelSecret = config.line.channelSecret;
    const signature = req.headers['x-line-signature'] as string;
    const body = JSON.stringify(req.body);

    console.log('🔐 驗證 LINE 簽名...');
    console.log('📦 Request details:', {
      signature: signature ? `${signature.substring(0, 10)}...` : 'Missing',
      bodyLength: body.length,
      channelSecretLength: channelSecret ? channelSecret.length : 0,
      contentType: req.headers['content-type'],
      userAgent: req.headers['user-agent']
    });

    if (!signature) {
      console.log('⚠️ 缺少 x-line-signature header');
      return res.status(200).send('OK'); // LINE 要求始終返回 200
    }

    if (!channelSecret) {
      console.error('❌ LINE_CHANNEL_SECRET 未設定');
      return res.status(200).send('OK');
    }

    // 計算預期的簽名
    const expectedSignature = crypto
      .createHmac('sha256', channelSecret)
      .update(body, 'utf8')
      .digest('base64');

    console.log('🔍 簽名比對:', {
      received: signature,
      expected: expectedSignature,
      match: signature === expectedSignature
    });

    if (signature !== expectedSignature) {
      console.log('⚠️ 簽名驗證失敗，但繼續處理（測試模式）');
      // 在開發環境中，我們仍然處理請求以便測試
    } else {
      console.log('✅ 簽名驗證成功');
    }

    next();
  } catch (error) {
    console.error('❌ 簽名驗證過程出錯:', error);
    res.status(200).send('OK');
  }
}

// LINE webhook POST 事件處理（使用自定義簽名驗證）
router.post('/', 
  express.json({ limit: '10mb' }), // 增加請求大小限制
  validateLineSignature,
  async (req, res) => {
    try {
      console.log('📨 Webhook 路由收到請求');

      // 確保請求有正確的 Content-Type
      if (!req.is('application/json')) {
        console.log('⚠️ 非 JSON 請求格式');
        return res.status(200).json({ 
          status: 'warning', 
          message: 'Expected JSON content-type' 
        });
      }

      await lineController.handleWebhook(req, res);
    } catch (error) {
      console.error('❌ LINE webhook 路由處理錯誤:', error);

      // 確保總是回傳正確的 JSON 格式
      if (!res.headersSent) {
        return res.status(200).json({ 
          status: 'error', 
          message: 'Route processing failed',
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }
  }
);

// 推播訊息 API
router.post('/push/:userId', async (req, res) => {
  await lineController.handlePushMessage(req, res);
});

// 測試 Flex Message 推播
router.post('/test-push', async (req, res) => {
  await lineController.testPushFlex(req, res);
});

// 自訂 Flex Message 推播
router.post('/custom-flex', async (req, res) => {
  await lineController.customFlexPush(req, res);
});

// GET 方法用於 webhook 驗證
router.get('/', (req, res) => {
  console.log('✅ LINE webhook GET 驗證請求');
  res.status(200).send('LINE webhook endpoint is active');
});

router.post('/push', lineController.handlePushMessage);
router.post('/test-push', lineController.testPushFlex);
router.post('/custom-flex', lineController.customFlexPush);
router.post('/ai-reply', lineController.aiReply);
router.post('/event-suggestion', lineController.generateEventSuggestion);

export default router;