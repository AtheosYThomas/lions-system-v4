
import { Request, Response } from 'express';
import lineService from '../services/lineService';
import { LineWebhookRequestBody } from '../types/line';

class LineController {
  /**
   * 處理 LINE Webhook 請求
   */
  async handleWebhook(req: Request, res: Response): Promise<void> {
    try {
      console.log('📨 收到 LINE webhook 請求');
      console.log('📦 Request body =', JSON.stringify(req.body, null, 2));

      const body: LineWebhookRequestBody = req.body;
      const result = await lineService.handleWebhookEvents(body.events);

      if (!result.success) {
        console.error('❌ LINE 服務處理失敗:', result.error);
      }

      // LINE webhook 必須回傳 200 狀態碼
      res.status(200).send('OK');
      
    } catch (error) {
      console.error('❌ LineController webhook 處理錯誤:', error);
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
}

export default new LineController();
