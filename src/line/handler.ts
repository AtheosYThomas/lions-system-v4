import { Request, Response } from 'express';
import { Client, middleware, WebhookEvent, MessageEvent, TextMessage, PostbackEvent } from '@line/bot-sdk';
import { config } from '../config/config';
import Member from '../models/member';
import MessageLog from '../models/messageLog';

const client = new Client({
  channelAccessToken: config.line.accessToken,
  channelSecret: config.line.channelSecret,
});

export default async function lineHandler(req: Request, res: Response) {
  try {
    console.log('🔄 處理 LINE webhook 請求');
    console.log('📦 Request body:', JSON.stringify(req.body, null, 2));

    const events: WebhookEvent[] = req.body.events;

    if (!events || events.length === 0) {
      console.log('⚠️ 沒有收到任何事件');
      return res.status(200).json({ status: 'ok' });
    }

    console.log(`📨 收到 ${events.length} 個事件`);

    // 處理每個事件
    await Promise.all(events.map(handleEvent));

    res.status(200).json({ status: 'ok' });
  } catch (error) {
    console.error('🔥 LINE handler error:', error);
    // 確保回傳 200 狀態碼給 LINE
    res.status(200).json({ status: 'error', message: 'processed' });
  }
}

async function handleEvent(event: WebhookEvent) {
  console.log('🔄 處理事件:', event.type);
  console.log('📋 事件詳情:', JSON.stringify(event, null, 2));

  try {
    if (event.type === 'message' && event.message.type === 'text') {
      await handleTextMessage(event);
    } else if (event.type === 'postback') {
      await handlePostback(event);
    } else if (event.type === 'follow') {
      await handleFollow(event);
    } else if (event.type === 'unfollow') {
      await handleUnfollow(event);
    } else {
      console.log('🔄 未處理的事件類型:', event.type);
    }
  } catch (error) {
    console.error('🔥 事件處理錯誤:', error);
  }
}

async function handleTextMessage(event: MessageEvent) {
  const { replyToken, message } = event;
  const userId = event.source.userId;

  if (!userId) {
    console.log('⚠️ 無法取得 userId');
    return;
  }

  console.log(`📨 收到文字訊息: "${(message as TextMessage).text}" from ${userId}`);

  try {
    // 記錄訊息
    await MessageLog.create({
      userId,
      message: (message as TextMessage).text,
      timestamp: new Date(),
      direction: 'incoming'
    });

    // 檢查是否為註冊用戶
    const member = await Member.findOne({ where: { lineUserId: userId } });

    let replyMessage: string;

    if (!member) {
      replyMessage = `👋 歡迎來到北大獅子會！\n\n請先完成註冊：\n🔗 ${process.env.FRONTEND_URL || 'http://localhost:5000'}/register\n\n註冊後即可使用所有功能！`;
    } else {
      const messageText = (message as TextMessage).text.toLowerCase();

      if (messageText.includes('個人資料') || messageText.includes('profile')) {
        replyMessage = `👤 ${member.name} 的個人資料：\n📧 Email: ${member.email}\n📱 電話: ${member.phone}\n🏢 職業: ${member.occupation}\n📍 地址: ${member.address}`;
      } else if (messageText.includes('活動') || messageText.includes('event')) {
        replyMessage = `📅 活動功能：\n• 查看最新活動\n• 活動報名\n• 報名狀態查詢\n\n請使用網頁版查看詳細資訊：\n🔗 ${process.env.FRONTEND_URL || 'http://localhost:5000'}`;
      } else if (messageText.includes('簽到') || messageText.includes('checkin')) {
        replyMessage = `✅ 簽到功能：\n請使用 LIFF 應用程式進行簽到\n\n🔗 ${process.env.FRONTEND_URL || 'http://localhost:5000'}/checkin`;
      } else {
        replyMessage = `你好 ${member.name}！👋\n\n📋 可用功能：\n• 個人資料 - 查看您的資料\n• 活動 - 查看和報名活動\n• 簽到 - 活動簽到\n• 幫助 - 查看使用說明\n\n💡 請輸入功能名稱或使用網頁版：\n🔗 ${process.env.FRONTEND_URL || 'http://localhost:5000'}`;
      }
    }

    console.log('📤 準備回覆:', replyMessage);

    await client.replyMessage(replyToken, {
      type: 'text',
      text: replyMessage
    });

    // 記錄回覆
    await MessageLog.create({
      userId,
      message: replyMessage,
      timestamp: new Date(),
      direction: 'outgoing'
    });

    console.log('✅ 訊息處理完成');

  } catch (error) {
    console.error('🔥 文字訊息處理錯誤:', error);

    // 錯誤時的簡單回覆
    try {
      await client.replyMessage(replyToken, {
        type: 'text',
        text: '抱歉，系統暫時無法處理您的訊息，請稍後再試。'
      });
    } catch (replyError) {
      console.error('🔥 回覆錯誤訊息失敗:', replyError);
    }
  }
}

async function handlePostback(event: PostbackEvent) {
  console.log('📤 處理 Postback 事件:', event.postback.data);
  // 可以在這裡處理按鈕點擊等互動
}

async function handleFollow(event: WebhookEvent) {
  const userId = event.source.userId;
  console.log('➕ 新用戶追蹤:', userId);

  if (!userId) return;

  try {
    const welcomeMessage = `🦁 歡迎加入北大獅子會！\n\n請先完成註冊以享受完整服務：\n🔗 ${process.env.FRONTEND_URL || 'http://localhost:5000'}/register`;

    await client.pushMessage(userId, {
      type: 'text',
      text: welcomeMessage
    });
  } catch (error) {
    console.error('🔥 處理追蹤事件錯誤:', error);
  }
}

async function handleUnfollow(event: WebhookEvent) {
  const userId = event.source.userId;
  console.log('➖ 用戶取消追蹤:', userId);

  // 可以在這裡處理取消追蹤的邏輯
}