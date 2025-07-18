
import { Request, Response } from 'express';
import lineService from '../integrations/line/lineService';
import { LineWebhookRequestBody } from '../types/line';

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
      
      if (!body) {
        console.log('⚠️ 請求體為空');
        res.status(200).send('OK');
        return;
      }

      if (!body.events) {
        console.log('✅ Webhook 驗證請求（無 events 字段）');
        res.status(200).send('OK');
        return;
      }

      if (body.events.length === 0) {
        console.log('✅ 空事件陣列 - 可能是測試請求');
        res.status(200).send('OK');
        return;
      }

      console.log(`📨 開始處理 ${body.events.length} 個事件`);
      for (let i = 0; i < body.events.length; i++) {
        const event = body.events[i];
        console.log(`📨 事件 ${i + 1}:`, {
          type: event.type,
          timestamp: event.timestamp,
          source: event.source
        });
      }

      const result = await lineService.handleWebhookEvents(body.events);

      if (!result.success) {
        console.error('❌ LINE 服務處理失敗:', result.error);
      } else {
        console.log('✅ LINE webhook 處理成功:', result.message);
      }

      // LINE webhook 必須回傳 200 狀態碼
      console.log('📤 回應 LINE Platform: 200 OK');
      res.status(200).send('OK');
      
    } catch (error) {
      console.error('❌ LineController webhook 處理錯誤:', error);
      console.error('❌ 錯誤堆疊:', error instanceof Error ? error.stack : 'No stack trace');
      // LINE webhook 必須回傳 200，否則會重複發送
      res.status(200).send('OK');
    }
  }

  /**
   * 處理推播訊息請求
   */
  async handlePushMessage(req: Request, res: Response): Promise<void> {
    try {
      const { userId } = req.params;
      const { message } = req.body;

      if (!userId) {
        res.status(400).json({ 
          success: false, 
          error: 'userId is required' 
        });
        return;
      }

      const result = await lineService.pushMessage(userId, message);

      if (result.success) {
        res.json({ 
          success: true, 
          message: 'Push message sent successfully' 
        });
      } else {
        res.status(500).json({ 
          success: false, 
          error: result.error 
        });
      }
      
    } catch (error) {
      console.error('❌ LineController 推播處理錯誤:', error);
      res.status(500).json({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Internal server error' 
      });
    }
  }

  /**
   * 測試推播 Flex Message
   */
  async testPushFlex(req: Request, res: Response): Promise<void> {
    try {
      const { userId, type = 'event' } = req.body;

      if (!userId) {
        res.status(400).json({ 
          success: false, 
          error: 'userId is required' 
        });
        return;
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

      if (!userId || !title || !date) {
        res.status(400).json({ 
          success: false, 
          error: 'userId, title, and date are required' 
        });
        return;
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
