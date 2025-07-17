
import { Client, WebhookEvent, MessageEvent } from '@line/bot-sdk';
import { config } from '../config/config';
import MessageLog from '../models/messageLog';
import Member from '../models/member';
import { LineTextMessageEvent, LineReplyMessage, LinePushMessage, LineServiceResponse } from '../types/line';

class LineService {
  private client: Client;

  constructor() {
    this.client = new Client({
      channelAccessToken: config.line.accessToken,
      channelSecret: config.line.channelSecret
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
      const replyMessage: LineReplyMessage = {
        type: 'text',
        text: `收到您的訊息: ${originalMessage}`
      };

      await this.client.replyMessage(replyToken, replyMessage);
      console.log('✅ 訊息回應成功');
    } catch (error) {
      console.error('❌ 訊息回應失敗:', error);
      throw error;
    }
  }

  /**
   * 推送訊息
   */
  async pushMessage(userId: string, message: string): Promise<LineServiceResponse> {
    try {
      const pushMessage: LinePushMessage = {
        type: 'text',
        text: message || '這是系統推播測試訊息'
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
      // TODO: 根據您的 MessageLog 模型調整欄位
      await MessageLog.create({
        userId: event.source.userId,
        message: event.message.text,
        timestamp: new Date(event.timestamp),
        messageType: 'text'
      });
      console.log('💾 訊息記錄已儲存');
    } catch (error) {
      console.error('❌ 儲存訊息記錄失敗:', error);
      // 不拋出錯誤，避免影響主要功能
    }
  }
}

export default new LineService();
