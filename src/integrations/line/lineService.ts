import { Client, WebhookEvent, MessageEvent, FlexMessage } from '@line/bot-sdk';
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

    if (!lineUserId) {
      console.log('⚠️ 無法獲取用戶 ID');
      return;
    }

    console.log('💬 收到訊息:', { lineUserId, userMessage });

    // 新增智慧回覆邏輯
    const text = event.message.text.toLowerCase();
    const replyToken = event.replyToken;

    // 查詢會員狀態
    const member = await Member.findOne({ where: { line_user_id: lineUserId } });

    // 智慧回覆：簽到功能
    if (text.includes('簽到')) {
      const { checkinCard } = await import('./flexTemplates');
      const message = {
        type: 'flex' as const,
        altText: '簽到入口',
        contents: checkinCard(member?.name || '會員'),
      };
      await this.client.replyMessage(replyToken, message);
      console.log('✅ 已回應簽到請求');
      return;
    }

    // 智慧回覆：活動查詢
    if (text.includes('報名') || text.includes('活動')) {
      const events = await this.getUpcomingEvents();
      const { eventOverviewCard } = await import('./flexTemplates');
      const message = {
        type: 'flex' as const,
        altText: '近期活動',
        contents: eventOverviewCard(events),
      };
      await this.client.replyMessage(replyToken, message);
      console.log('✅ 已回應活動查詢');
      return;
    }

    // 智慧回覆：會員資訊
    if (text.includes('會員')) {
      const { memberCenterCard } = await import('./flexTemplates');
      const message = {
        type: 'flex' as const,
        altText: '會員中心',
        contents: memberCenterCard(member),
      };
      await this.client.replyMessage(replyToken, message);
      console.log('✅ 已回應會員查詢');
      return;
    }

    // 原有邏輯：根據會員狀態回應
    if (member) {
      // ✅ 已註冊會員 - 使用 fallback 回應
      console.log('👤 已註冊會員:', member.name);
      await this.replyText(replyToken, "請輸入「活動」、「簽到」、「會員」等關鍵字以獲得幫助。");

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
      // 創建會員專用 Flex Message
      const replyMessage = {
        type: 'flex' as const,
        altText: `歡迎回來，${memberName}！`,
        contents: {
          type: 'bubble' as const,
          body: {
            type: 'box' as const,
            layout: 'vertical' as const,
            contents: [
              {
                type: 'text' as const,
                text: '🦁 北大獅子會',
                weight: 'bold' as const,
                size: 'xl' as const,
                color: '#1DB446'
              },
              {
                type: 'text' as const,
                text: `歡迎回來，${memberName}！`,
                weight: 'bold' as const,
                size: 'lg' as const,
                margin: 'md' as const
              },
              {
                type: 'separator' as const,
                margin: 'md' as const
              },
              {
                type: 'text' as const,
                text: `您說：「${userMessage}」`,
                size: 'sm' as const,
                color: '#666666',
                wrap: true,
                margin: 'md' as const
              },
              {
                type: 'text' as const,
                text: '如需使用會員功能，請點擊下方按鈕進入 LIFF 系統',
                size: 'sm' as const,
                color: '#666666',
                wrap: true,
                margin: 'sm' as const
              }
            ]
          },
          footer: {
            type: 'box' as const,
            layout: 'vertical' as const,
            contents: [
              {
                type: 'button' as const,
                action: {
                  type: 'uri' as const,
                  label: '🚀 進入會員系統',
                  uri: `https://liff.line.me/2007739371-aKePV20l`
                },
                style: 'primary' as const,
                color: '#1DB446'
              }
            ]
          }
        }
      };

      await this.client.replyMessage(replyToken, replyMessage);
      console.log('✅ 已回應註冊會員 (Flex Message)');
    } catch (error) {
      console.error('❌ 回應註冊會員失敗:', error);
      // 備用簡單文字回應
      try {
        const fallbackMessage = {
          type: 'text' as const,
          text: `👋 歡迎回來，${memberName}！\n\n如需使用會員功能，請前往 LIFF 系統。`
        };
        await this.client.replyMessage(replyToken, fallbackMessage);
        console.log('✅ 已發送備用文字回應');
      } catch (fallbackError) {
        console.error('❌ 備用回應也失敗:', fallbackError);
      }
    }
  }

  /**
   * 回應未註冊用戶 - 提供註冊連結
   */
  private async replyToUnregisteredUser(replyToken: string, lineUserId: string): Promise<void> {
    try {
      // 發送註冊邀請 - 直接導向 register.html
        const replyMessage = {
          type: 'flex' as const,
          altText: '請註冊會員',
          contents: {
            type: 'bubble' as const,
            hero: {
              type: 'image' as const,
              url: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&h=800&q=80',
              size: 'full' as const,
              aspectRatio: '20:13' as const,
              aspectMode: 'cover' as const
            },
            body: {
              type: 'box' as const,
              layout: 'vertical' as const,
              contents: [
                {
                  type: 'text' as const,
                  text: '🦁 北大獅子會',
                  weight: 'bold' as const,
                  size: 'xl' as const,
                  color: '#1DB446' as const
                },
                {
                  type: 'text' as const,
                  text: '歡迎您的到來！',
                  weight: 'bold' as const,
                  size: 'lg' as const,
                  margin: 'md' as const
                },
                {
                  type: 'separator' as const,
                  margin: 'md' as const
                },
                {
                  type: 'text' as const,
                  text: '您尚未註冊為會員',
                  size: 'md' as const,
                  color: '#333333' as const,
                  margin: 'md' as const
                },
                {
                  type: 'text' as const,
                  text: '完成註冊後，您將享受：\n• 活動優先報名\n• 會員專屬服務\n• 即時通知與資訊',
                  size: 'sm' as const,
                  color: '#666666' as const,
                  wrap: true,
                  margin: 'sm' as const
                }
              ]
            },
            footer: {
              type: 'box' as const,
              layout: 'vertical' as const,
              contents: [
                {
                  type: 'button' as const,
                  action: {
                    type: 'uri' as const,
                    label: '🚀 立即註冊會員',
                    uri: 'https://service.peida.net/register.html'
                  },
                  style: 'primary' as const,
                  color: '#1DB446' as const
                }
              ]
            }
          }
        };
      await this.client.replyMessage(replyToken, replyMessage);
      console.log('✅ 已回應未註冊用戶，提供註冊連結');
    } catch (error) {
      console.error('❌ 回應未註冊用戶失敗:', error);
      // 備用簡單回應
      try {
        // 如果 Flex Message 失敗，發送簡單文字訊息
        const fallbackMessage = {
          type: 'text' as const,
          text: `🦁 北大獅子會\n\n歡迎您！請點擊連結完成註冊：\nhttps://service.peida.net/register.html`
        };
        await this.client.replyMessage(replyToken, fallbackMessage);
        console.log('✅ 已發送備用註冊回應');
      } catch (fallbackError) {
        console.error('❌ 備用註冊回應也失敗:', fallbackError);
      }
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
      // 發送註冊邀請 - 直接導向 register.html
        const welcomeMessage = {
          type: 'flex' as const,
          altText: '請註冊會員',
          contents: {
            type: 'bubble' as const,
            body: {
              type: 'box' as const,
              layout: 'vertical' as const,
              contents: [
                {
                  type: 'text' as const,
                  text: '🎉 歡迎加入',
                  weight: 'bold' as const,
                  size: 'xl' as const,
                  color: '#1DB446' as const
                },
                {
                  type: 'text' as const,
                  text: '北大獅子會 LINE 官方帳號',
                  weight: 'bold' as const,
                  size: 'lg' as const
                },
                {
                  type: 'text' as const,
                  text: '請完成會員註冊，即可享受完整服務',
                  size: 'sm' as const,
                  color: '#666666' as const,
                  wrap: true,
                  margin: 'md' as const
                }
              ]
            },
            footer: {
              type: 'box' as const,
              layout: 'vertical' as const,
              contents: [
                {
                  type: 'button' as const,
                  action: {
                    type: 'uri' as const,
                    label: '🚀 完成註冊',
                    uri: 'https://service.peida.net/register.html'
                  },
                  style: 'primary' as const,
                  color: '#1DB446' as const
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

  /**
   * 創建活動 Flex Message 卡片
   */
  createFlexEventCard(title: string, date: string, imageUrl: string): FlexMessage {
    return {
      type: 'flex',
      altText: `活動通知：${title}`,
      contents: {
        type: 'bubble',
        hero: {
          type: 'image',
          url: imageUrl,
          size: 'full',
          aspectRatio: '20:13',
          aspectMode: 'cover'
        },
        body: {
          type: 'box',
          layout: 'vertical',
          contents: [
            {
              type: 'text',
              text: title,
              weight: 'bold',
              size: 'lg'
            },
            {
              type: 'text',
              text: `活動時間：${date}`,
              size: 'sm',
              color: '#666666',
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
                label: '查看詳情',
                uri: `https://liff.line.me/2007739371-aKePV20l`
              },
              style: 'primary',
              color: '#1DB446'
            }
          ]
        }
      }
    };
  }

  /**
   * 創建會員資訊 Flex Message 卡片
   */
  createFlexMemberCard(memberName: string, memberLevel: string, joinDate: string): FlexMessage {
    return {
      type: 'flex',
      altText: `會員資訊：${memberName}`,
      contents: {
        type: 'bubble',
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
              text: '會員資訊',
              weight: 'bold',
              size: 'lg',
              margin: 'md'
            },
            {
              type: 'separator',
              margin: 'md'
            },
            {
              type: 'box',
              layout: 'vertical',
              margin: 'md',
              contents: [
                {
                  type: 'box',
                  layout: 'baseline',
                  contents: [
                    {
                      type: 'text',
                      text: '姓名：',
                      size: 'sm',
                      color: '#666666',
                      flex: 2
                    },
                    {
                      type: 'text',
                      text: memberName,
                      size: 'sm',
                      flex: 3,
                      weight: 'bold'
                    }
                  ]
                },
                {
                  type: 'box',
                  layout: 'baseline',
                  margin: 'sm',
                  contents: [
                    {
                      type: 'text',
                      text: '會員等級：',
                      size: 'sm',
                      color: '#666666',
                      flex: 2
                    },
                    {
                      type: 'text',
                      text: memberLevel,
                      size: 'sm',
                      flex: 3,
                      color: '#1DB446',
                      weight: 'bold'
                    }
                  ]
                },
                {
                  type: 'box',
                  layout: 'baseline',
                  margin: 'sm',
                  contents: [
                    {
                      type: 'text',
                      text: '加入日期：',
                      size: 'sm',
                      color: '#666666',
                      flex: 2
                    },
                    {
                      type: 'text',
                      text: joinDate,
                      size: 'sm',
                      flex: 3
                    }
                  ]
                }
              ]
            }
          ]
        }
      }
    };
  }

  /**
   * 推送 Flex Message
   */
  async pushFlexMessage(userId: string, flexMessage: FlexMessage): Promise<LineServiceResponse> {
    try {
      await this.client.pushMessage(userId, flexMessage);
      console.log(`✅ Flex 推播成功：${userId}`);
      return { success: true, message: 'Flex message sent successfully' };
    } catch (error) {
      console.error(`❌ Flex 推播失敗：${userId}`, error);
      return { success: false, error: error instanceof Error ? error.message : 'Flex push message failed' };
    }
  }

  /**
   * 推送活動通知
   */
  async pushEventNotification(userId: string, title: string, date: string, imageUrl: string): Promise<LineServiceResponse> {
    const flexMessage = this.createFlexEventCard(title, date, imageUrl);
    return await this.pushFlexMessage(userId, flexMessage);
  }

  /**
   * 推送會員資訊
   */
  async pushMemberInfo(userId: string, memberName: string, memberLevel: string, joinDate: string): Promise<LineServiceResponse> {
    const flexMessage = this.createFlexMemberCard(memberName, memberLevel, joinDate);
    return await this.pushFlexMessage(userId, flexMessage);
  }

  /**
   * 獲取即將到來的活動
   */
  private async getUpcomingEvents(): Promise<Array<{id: string, title: string, date: Date}>> {
    try {
      const Event = (await import('../../models/event')).default;
      const { Op } = await import('sequelize');
      
      const events = await Event.findAll({
        where: {
          status: 'active',
          date: { [Op.gte]: new Date() }
        },
        order: [['date', 'ASC']],
        limit: 5,
        attributes: ['id', 'title', 'date']
      });

      return events.map((event: any) => ({
        id: event.id,
        title: event.title,
        date: event.date
      }));
    } catch (error) {
      console.error('❌ 獲取活動失敗:', error);
      return [];
    }
  }

  /**
   * 回覆文字訊息
   */
  private async replyText(replyToken: string, text: string): Promise<void> {
    try {
      const message = {
        type: 'text' as const,
        text: text
      };
      await this.client.replyMessage(replyToken, message);
      console.log('✅ 已回覆文字訊息');
    } catch (error) {
      console.error('❌ 回覆文字訊息失敗:', error);
    }
  }

  /**
   * 批量推送活動報到通知
   */
  async pushBulkCheckinNotification(
    userIds: string[], 
    title: string, 
    date: string, 
    eventId: string,
    messageType: string = 'manual_push'
  ): Promise<{
    success: number;
    failed: number;
    results: Array<{ userId: string; success: boolean; error?: string }>;
    pushRecords: Array<{ userId: string; memberId?: string; status: 'success' | 'failed' }>;
  }> {
    const { createCheckinFlexMessage } = await import('./flexTemplates');
    const flexMessage = createCheckinFlexMessage(title, date, eventId);
    
    const results: Array<{ userId: string; success: boolean; error?: string }> = [];
    const pushRecords: Array<{ userId: string; memberId?: string; status: 'success' | 'failed' }> = [];
    let successCount = 0;
    let failedCount = 0;

    // 獲取會員資料用於記錄
    const Member = (await import('../../models/member')).default;
    const memberMap = new Map();
    
    try {
      const members = await Member.findAll({
        where: { line_user_id: userIds },
        attributes: ['id', 'line_user_id']
      });
      
      members.forEach((member: any) => {
        memberMap.set(member.line_user_id, member.id);
      });
    } catch (error) {
      console.error('❌ 獲取會員資料失敗:', error);
    }

    // 批量推送，避免 API 限制
    const batchSize = 500; // LINE API 限制
    for (let i = 0; i < userIds.length; i += batchSize) {
      const batch = userIds.slice(i, i + batchSize);
      
      const promises = batch.map(async (userId) => {
        const memberId = memberMap.get(userId);
        
        try {
          await this.client.pushMessage(userId, flexMessage);
          results.push({ userId, success: true });
          pushRecords.push({ userId, memberId, status: 'success' });
          successCount++;
          console.log(`✅ 推播成功：${userId}`);
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Unknown error';
          results.push({ userId, success: false, error: errorMessage });
          pushRecords.push({ userId, memberId, status: 'failed' });
          failedCount++;
          console.error(`❌ 推播失敗：${userId}`, errorMessage);
        }
      });

      await Promise.allSettled(promises);
      
      // 避免過快推送
      if (i + batchSize < userIds.length) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    // 記錄推播結果到資料庫
    try {
      const pushService = (await import('../../services/pushService')).default;
      const recordsToSave = pushRecords
        .filter(record => record.memberId)
        .map(record => ({
          member_id: record.memberId!,
          event_id: eventId,
          message_type: messageType,
          status: record.status
        }));

      if (recordsToSave.length > 0) {
        await pushService.recordBulkPushResults(recordsToSave);
        console.log(`💾 已記錄 ${recordsToSave.length} 筆推播記錄`);
      }
    } catch (error) {
      console.error('❌ 記錄推播結果失敗:', error);
    }

    console.log(`📊 推播統計 - 成功: ${successCount}, 失敗: ${failedCount}`);
    
    return {
      success: successCount,
      failed: failedCount,
      results,
      pushRecords
    };
  }

  /**
   * 推送單一活動報到通知
   */
  async pushCheckinNotification(userId: string, title: string, date: string, eventId: string): Promise<LineServiceResponse> {
    try {
      const { createCheckinFlexMessage } = await import('./flexTemplates');
      const flexMessage = createCheckinFlexMessage(title, date, eventId);
      
      await this.client.pushMessage(userId, flexMessage);
      console.log(`✅ 報到通知推播成功：${userId}`);
      return { success: true, message: 'Checkin notification sent successfully' };
    } catch (error) {
      console.error(`❌ 報到通知推播失敗：${userId}`, error);
      return { success: false, error: error instanceof Error ? error.message : 'Push notification failed' };
    }
  }
}

export default new LineService();