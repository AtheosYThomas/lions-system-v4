import { Request, Response } from 'express';
import lineService from '../integrations/line/lineService';
import { LineWebhookRequestBody } from '../types/line';
import { isValidLineUserId } from '../utils/validators';

// Helper function to encapsulate userId validation logic
const validateLineUserId = (userId: string | undefined) => {
  if (!userId) {
    return { valid: false, error: 'line_user_id is required' };
  }
  if (!isValidLineUserId(userId)) {
    return { valid: false, error: 'Invalid line_user_id format' };
  }
  return { valid: true, error: null };
};

class LineController {
  /**
   * 處理 LINE Webhook 請求
   */
  async handleWebhook(req: Request, res: Response): Promise<void> {
    try {
      console.log('📨 LINE Controller 收到 webhook 請求');
      console.log('📦 Request headers:', {
        'content-type': req.headers['content-type'],
        'user-agent': req.headers['user-agent'],
        'x-line-signature': req.headers['x-line-signature'] ? 'Present' : 'Missing'
      });

      const body: LineWebhookRequestBody = req.body;
      console.log('📦 Request body:', JSON.stringify(body, null, 2));

      // 處理空請求體
      if (!body) {
        console.log('⚠️ 請求體為空 - 回應 OK');
        return res.status(200).json({ status: 'ok', message: 'Empty body received' });
      }

      // 處理 webhook 驗證請求
      if (!body.events) {
        console.log('✅ Webhook 驗證請求（無 events 字段）');
        return res.status(200).json({ status: 'ok', message: 'Webhook verification' });
      }

      // 處理空事件陣列
      if (body.events.length === 0) {
        console.log('✅ 空事件陣列 - 可能是測試請求');
        return res.status(200).json({ status: 'ok', message: 'Empty events array' });
      }

      console.log(`📨 開始處理 ${body.events.length} 個事件`);

      // 記錄每個事件的詳細資訊
      body.events.forEach((event, index) => {
        console.log(`📨 事件 ${index + 1}:`, {
          type: event.type,
          timestamp: event.timestamp,
          source: event.source,
          replyToken: 'replyToken' in event ? (event.replyToken ? 'Present' : 'Missing') : 'N/A'
        });
      });

      // 處理事件
      const result = await lineService.handleWebhookEvents(body.events);

      if (!result.success) {
        console.error('❌ LINE 服務處理失敗:', result.error);
        return res.status(200).json({ 
          status: 'error', 
          message: 'Event processing failed',
          error: result.error
        });
      } else {
        console.log('✅ LINE webhook 處理成功:', result.message);
        return res.status(200).json({ 
          status: 'ok', 
          message: result.message,
          processed: body.events.length
        });
      }

    } catch (error) {
      console.error('❌ LineController webhook 處理錯誤:', error);
      console.error('❌ 錯誤堆疊:', error instanceof Error ? error.stack : 'No stack trace');

      // LINE webhook 必須回傳 200，否則會重複發送
      return res.status(200).json({ 
        status: 'error', 
        message: 'Internal processing error',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * 處理推播訊息請求
   */
  async handlePushMessage(req: Request, res: Response): Promise<void> {
    try {
      const { userId } = req.params;
      const { message } = req.body;

      // ✅ 使用驗證工具函式檢查 LINE User ID 格式
      const validation = validateLineUserId(userId);
      if (!validation.valid) {
        return res.status(400).json({
          success: false,
          error: validation.error,
        });
      }

      if (!message) {
        return res.status(400).json({
          success: false,
          error: 'Message content is required',
        });
      }

      const result = await lineService.pushMessage(userId, message);

      if (result.success) {
        res.json({
          success: true,
          message: 'Push message sent successfully',
        });
      } else {
        res.status(500).json({
          success: false,
          error: result.error,
        });
      }
    } catch (error) {
      console.error('❌ LineController 推播處理錯誤:', error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error',
      });
    }
  }

  /**
   * 測試推播 Flex Message
   */
  async testPushFlex(req: Request, res: Response): Promise<void> {
    try {
      const { userId, type = 'event' } = req.body;

      // ✅ 使用驗證工具函式檢查 LINE User ID 格式
      const validation = validateLineUserId(userId);
      if (!validation.valid) {
        return res.status(400).json({
          success: false,
          error: validation.error,
        });
      }

      let result;

      if (type === 'event') {
        // 推播活動通知
        result = await lineService.pushEventNotification(
          userId,
          '社服活動報名開始',
          '2025/08/01 18:00',
          'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&h=800&q=80'
        );
      } else if (type === 'member') {
        // 推播會員資訊
        result = await lineService.pushMemberInfo(
          userId,
          '測試會員',
          '正式會員',
          '2025/01/01'
        );
      } else {
        res.status(400).json({ 
          success: false, 
          error: 'Invalid type. Use "event" or "member"' 
        });
        return;
      }

      if (result.success) {
        res.json({ 
          success: true, 
          message: `Flex ${type} message sent successfully`,
          type: type
        });
      } else {
        res.status(500).json({ 
          success: false, 
          error: result.error 
        });
      }

    } catch (error) {
      console.error('❌ LineController Flex 推播處理錯誤:', error);
      res.status(500).json({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Internal server error' 
      });
    }
  }

  /**
   * 自訂 Flex Message 推播
   */
  async customFlexPush(req: Request, res: Response): Promise<void> {
    try {
      const { userId, title, date, imageUrl } = req.body;

      // ✅ 使用驗證工具函式檢查 LINE User ID 格式
      const validation = validateLineUserId(userId);
      if (!validation.valid) {
        return res.status(400).json({
          success: false,
          error: validation.error,
        });
      }

      if (!title || !date) {
        return res.status(400).json({
          success: false,
          error: 'title and date are required',
        });
      }

      const defaultImageUrl = 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&h=800&q=80';
      const result = await lineService.pushEventNotification(
        userId,
        title,
        date,
        imageUrl || defaultImageUrl
      );

      if (result.success) {
        res.json({ 
          success: true, 
          message: 'Custom flex message sent successfully' 
        });
      } else {
        res.status(500).json({ 
          success: false, 
          error: result.error 
        });
      }

    } catch (error) {
      console.error('❌ LineController 自訂 Flex 推播處理錯誤:', error);
      res.status(500).json({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Internal server error' 
      });
    }
  }
}

export default new LineController();

export const handleLineWebhook = async (req: Request, res: Response): Promise<void> => {
  try {
    const events = req.body.events || [];

    if (events.length === 0) {
      res.status(200).json({ status: 'ok', message: 'No events' });
      return;
    }

    for (const event of events) {
      await lineService.handleEvent(event);
    }

    res.status(200).json({ status: 'ok' });
  } catch (error) {
    console.error('❌ LINE Webhook 處理錯誤:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getLiffConfig = async (req: Request, res: Response): Promise<void> => {
  try {
    const liffId = process.env.LIFF_ID;
    if (!liffId) {
      res.status(500).json({ error: 'LIFF ID not configured' });
      return;
    }

    res.json({ liffId });
  } catch (error) {
    res.status(500).json({ error: 'Failed to get LIFF config' });
  }
};