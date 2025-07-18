import { Client, WebhookEvent, MessageEvent } from '@line/bot-sdk';
import { config } from '../../config/config';
import Member from '../../models/member';
import MessageLog from '../../models/messageLog';
import { LineTextMessageEvent, LineServiceResponse } from '../../types/line';

class LineService {
  private client: Client;

  constructor() {
    this.client = new Client({
      channelAccessToken: config.line.accessToken || '',
      channelSecret: config.line.channelSecret || ''
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
   * 處理訊息事件 - 核心邏輯
   */
  private async handleMessageEvent(event: MessageEvent): Promise<void> {
    if (event.message.type !== 'text') {
      console.log('📄 非文字訊息，跳過處理');
      return;
    }

    const textEvent = event as LineTextMessageEvent;
    const lineUserId = textEvent.source.userId;
    const userMessage = textEvent.message.text;

    console.log('💬 收到訊息:', { lineUserId, userMessage });

    // 🔍 核心邏輯：檢查用戶是否為會員
    const member = await Member.findOne({ 
      where: { line_user_id: lineUserId } 
    });

    if (member) {
      // ✅ 已註冊會員
      console.log('👤 已註冊會員:', member.name);
      await this.replyToRegisteredMember(textEvent.replyToken, member.name, userMessage);

      // 記錄已註冊會員的訊息
      await this.saveMessageLog(textEvent, member.id);
    } else {
      // ❌ 尚未註冊會員
      console.log('👤 尚未註冊會員:', lineUserId);
      await this.replyToUnregisteredUser(textEvent.replyToken, lineUserId);
    }
  }

  /**
   * 回應已註冊會員
   */
  private async replyToRegisteredMember(replyToken: string, memberName: string, userMessage: string): Promise<void> {
    try {
      const replyMessage = {
        type: 'text' as const,
        text: `👋 歡迎回來，${memberName}！\n\n您說：${userMessage}\n\n如需使用會員功能，請透過 LIFF 系統操作。`
      };

      await this.client.replyMessage(replyToken, replyMessage);
      console.log('✅ 已回應註冊會員');
    } catch (error) {
      console.error('❌ 回應註冊會員失敗:', error);
    }
  }

  /**
   * 回應未註冊用戶 - 提供註冊連結
   */
  private async replyToUnregisteredUser(replyToken: string, lineUserId: string): Promise<void> {
    try {
      const replyMessage = {
        type: 'flex' as const,
        altText: '請註冊會員',
        contents: {
          type: 'bubble' as const,
          body: {
            type: 'box',
            layout: 'vertical',
            contents: [
              {
                type: 'text',
                text: '🦁 北大獅子會',
                weight: 'bold',
                size: 'xl',
                color: '#1DB446'
              },
              {
                type: 'text',
                text: '您尚未註冊會員',
                weight: 'bold',
                size: 'lg',
                margin: 'md'
              },
              {
                type: 'text',
                text: '請點擊下方按鈕完成註冊，即可享受完整的會員服務',
                size: 'sm',
                color: '#666666',
                wrap: true,
                margin: 'sm'
              }
            ]
          },
          footer: {
            type: 'box',
            layout: 'vertical',
            contents: [
              {
                type: 'button',
                action: {
                  type: 'uri',
                  label: '🚀 立即註冊',
                  uri: `https://liff.line.me/2007739371-aKePV20l`
                },
                style: 'primary',
                color: '#1DB446'
              }
            ]
          }
        }
      };

      await this.client.replyMessage(replyToken, replyMessage);
      console.log('✅ 已回應未註冊用戶，提供註冊連結');
    } catch (error) {
      console.error('❌ 回應未註冊用戶失敗:', error);
    }
  }

  /**
   * 處理追蹤事件
   */
  private async handleFollowEvent(event: WebhookEvent): Promise<void> {
    console.log('👋 用戶開始追蹤');

    if (!event.source?.userId) {
      console.log('⚠️ 無法獲取用戶 ID');
      return;
    }

    const lineUserId = event.source.userId;

    // 檢查是否為已註冊會員
    const member = await Member.findOne({ 
      where: { line_user_id: lineUserId } 
    });

    if (member) {
      // 歡迎回來訊息
      const welcomeMessage = {
        type: 'text' as const,
        text: `🎉 歡迎回來，${member.name}！\n\n感謝您重新加入北大獅子會 LINE 官方帳號！`
      };

      await this.client.pushMessage(lineUserId, welcomeMessage);
    } else {
      // 新用戶歡迎 + 註冊邀請
      const welcomeMessage = {
        type: 'flex' as const,
        altText: '歡迎加入北大獅子會',
        contents: {
          type: 'bubble' as const,
          body: {
            type: 'box',
            layout: 'vertical',
            contents: [
              {
                type: 'text',
                text: '🎉 歡迎加入',
                weight: 'bold',
                size: 'xl',
                color: '#1DB446'
              },
              {
                type: 'text',
                text: '北大獅子會 LINE 官方帳號',
                weight: 'bold',
                size: 'lg'
              },
              {
                type: 'text',
                text: '請完成會員註冊，即可享受完整服務',
                size: 'sm',
                color: '#666666',
                wrap: true,
                margin: 'md'
              }
            ]
          },
          footer: {
            type: 'box',
            layout: 'vertical',
            contents: [
              {
                type: 'button',
                action: {
                  type: 'uri',
                  label: '🚀 完成註冊',
                  uri: `https://liff.line.me/2007739371-aKePV20l`
                },
                style: 'primary',
                color: '#1DB446'
              }
            ]
          }
        }
      };

      await this.client.pushMessage(lineUserId, welcomeMessage);
    }
  }

  /**
   * 處理取消追蹤事件
   */
  private async handleUnfollowEvent(event: WebhookEvent): Promise<void> {
    console.log('👋 用戶取消追蹤');
    // 記錄取消追蹤事件（如果需要）
  }

  /**
   * 儲存訊息記錄
   */
  private async saveMessageLog(event: LineTextMessageEvent, memberId?: string): Promise<void> {
    try {
      const lineUserId = event.source.userId || '';

      await MessageLog.create({
        user_id: lineUserId,
        message_content: event.message.text,
        timestamp: new Date(event.timestamp),
        message_type: 'text'
      });

      console.log('💾 訊息記錄已儲存');
    } catch (error) {
      console.error('❌ 儲存訊息記錄失敗:', error);
    }
  }

  /**
   * 推送訊息
   */
  async pushMessage(userId: string, message: string): Promise<LineServiceResponse> {
    try {
      const pushMessage = {
        type: 'text' as const,
        text: message
      };

      await this.client.pushMessage(userId, pushMessage);
      console.log('✅ 推播訊息成功');
      return { success: true, message: 'Push message sent successfully' };
    } catch (error) {
      console.error('❌ 推播訊息失敗:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Push message failed' };
    }
  }
}

export default new LineService();