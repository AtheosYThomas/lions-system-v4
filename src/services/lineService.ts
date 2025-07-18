import { Client, WebhookEvent, MessageEvent } from '@line/bot-sdk';
import { config } from '../config/config';
import MessageLog from '../models/messageLog';
import Member from '../models/member';
import { LineTextMessageEvent, LineReplyMessage, LinePushMessage, LineServiceResponse } from '../types/line';

class LineService {
  private client: Client;

  constructor() {
    this.client = new Client({
      channelAccessToken: config.line.accessToken || process.env.LINE_CHANNEL_ACCESS_TOKEN || '',
      channelSecret: config.line.channelSecret || process.env.LINE_CHANNEL_SECRET || ''
    });
  }

  /**
   * 處理 LINE Webhook 事件
   */
  async handleWebhookEvents(events: WebhookEvent[]): Promise<LineServiceResponse> {
    try {
      console.log('📩 LINE 服務開始處理事件');

      if (!events || events.length === 0) {
        console.log('✅ Webhook 驗證請求');
        return { success: true, message: 'Webhook verification' };
      }

      // 處理每個事件
      for (const event of events) {
        await this.processEvent(event);
      }

      return { success: true, message: 'Events processed successfully' };
    } catch (error) {
      console.error('❌ LINE 服務處理事件錯誤:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  /**
   * 處理單一事件
   */
  private async processEvent(event: WebhookEvent): Promise<void> {
    console.log('📨 處理事件類型:', event.type);

    switch (event.type) {
      case 'message':
        await this.handleMessageEvent(event as MessageEvent);
        break;
      case 'follow':
        await this.handleFollowEvent(event);
        break;
      case 'unfollow':
        await this.handleUnfollowEvent(event);
        break;
      default:
        console.log('🔔 未處理的事件類型:', event.type);
    }
  }

  /**
   * 處理訊息事件
   */
  private async handleMessageEvent(event: MessageEvent): Promise<void> {
    if (event.message.type !== 'text') {
      console.log('📄 非文字訊息，跳過處理');
      return;
    }

    const textEvent = event as LineTextMessageEvent;
    const userMessage = textEvent.message.text;

    console.log('💬 收到文字訊息:', userMessage);

    // 儲存訊息記錄
    await this.saveMessageLog(textEvent);

    // 回應訊息
    await this.replyToMessage(textEvent.replyToken, userMessage);
  }

  /**
   * 處理追蹤事件
   */
  private async handleFollowEvent(event: WebhookEvent): Promise<void> {
    console.log('👋 用戶開始追蹤');
    // TODO: 處理用戶追蹤邏輯
  }

  /**
   * 處理取消追蹤事件
   */
  private async handleUnfollowEvent(event: WebhookEvent): Promise<void> {
    console.log('👋 用戶取消追蹤');
    // TODO: 處理用戶取消追蹤邏輯
  }

  /**
   * 回應訊息
   */
  async replyToMessage(replyToken: string, originalMessage: string): Promise<void> {
    try {
      console.log('🔄 準備回應訊息:', { replyToken, originalMessage });

      const replyMessage: LineReplyMessage = {
        type: 'text',
        text: `北大獅子會收到您的訊息: ${originalMessage}\n\n請使用 LIFF 系統進行會員管理操作。`
      };

      console.log('📤 發送回應訊息:', replyMessage);
      await this.client.replyMessage(replyToken, replyMessage);
      console.log('✅ 訊息回應成功');
    } catch (error) {
      console.error('❌ 訊息回應失敗:', error);
      console.error('錯誤詳細:', {
        message: error instanceof Error ? error.message : String(error),
        replyToken,
        originalMessage
      });
      // 不拋出錯誤，避免影響 webhook 回應
    }
  }

  /**
   * 推送訊息
   */
  async pushMessage(userId: string, message: string): Promise<LineServiceResponse> {
    try {
      const pushMessage: LinePushMessage = {
        type: 'text',
        text: message ?? '這是系統推播測試訊息'
      };

      await this.client.pushMessage(userId, pushMessage);
      console.log('✅ 推播訊息成功');
      return { success: true, message: 'Push message sent successfully' };
    } catch (error) {
      console.error('❌ 推播訊息失敗:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Push message failed' };
    }
  }

  /**
   * 儲存訊息記錄
   */
  private async saveMessageLog(event: LineTextMessageEvent): Promise<void> {
    try {
      const lineUserId = event.source.userId || '';
      
      // 先檢查會員是否存在，如果不存在則創建基本會員記錄
      let member = await Member.findOne({ 
        where: { line_uid: lineUserId } 
      });

      if (!member) {
        console.log('👤 會員不存在，創建基本會員記錄:', lineUserId);
        
        // 創建基本會員記錄
        member = await Member.create({
          id: require('crypto').randomUUID(),
          name: `LINE用戶_${lineUserId.substring(0, 8)}`,
          email: `${lineUserId}@temp.line`,
          line_uid: lineUserId,
          role: 'member',
          birthday: '1900-01-01',
          job_title: '待補充',
          address: '待補充',
          mobile: '待補充',
          status: 'pending'
        });
        
        console.log('✅ 已創建基本會員記錄');
      }

      // 儲存訊息記錄
      await MessageLog.create({
        user_id: lineUserId,
        message_content: event.message.text,
        timestamp: new Date(event.timestamp),
        message_type: 'text'
      });
      
      console.log('💾 訊息記錄已儲存');
    } catch (error) {
      console.error('❌ 儲存訊息記錄失敗:', error);
      // 不拋出錯誤，避免影響主要功能
    }
  }
}

export default new LineService();