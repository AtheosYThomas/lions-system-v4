
import { Request, Response } from 'express';
import { WebhookEvent, Client, MessageEvent, TextMessage, FollowEvent, UnfollowEvent } from '@line/bot-sdk';
import { config } from '../config/config';
import MessageLog from '../models/messageLog';
import Member from '../models/member';

const client = new Client({
  channelAccessToken: config.line.accessToken,
  channelSecret: config.line.channelSecret
});

const lineHandler = async (req: Request, res: Response) => {
  try {
    console.log('📩 收到 LINE Webhook 請求');
    console.log('📦 Request body =', JSON.stringify(req.body, null, 2));

    const events: WebhookEvent[] = req.body.events;
    
    if (!events || events.length === 0) {
      console.log('✅ Webhook 驗證請求，回傳 200 OK');
      return res.status(200).send('OK');
    }

    // 處理每個 LINE 事件
    const promises = events.map(async (event) => {
      try {
        console.log(`📨 處理事件類型: ${event.type}`);
        
        switch (event.type) {
          case 'message':
            return await handleMessageEvent(event as MessageEvent);
          case 'follow':
            return await handleFollowEvent(event as FollowEvent);
          case 'unfollow':
            return await handleUnfollowEvent(event as UnfollowEvent);
          default:
            console.log(`⚠️ 未處理的事件類型: ${event.type}`);
            return null;
        }
      } catch (eventError) {
        console.error(`❌ 處理事件失敗 (${event.type}):`, eventError);
        return null;
      }
    });

    await Promise.allSettled(promises);
    console.log('✅ 所有事件處理完成');
    
    res.status(200).send('OK');
    
  } catch (err) {
    console.error('❌ LINE Handler 總體錯誤：', err);
    res.status(200).send('OK'); // LINE webhook 必須回傳 200
  }
};

// 處理訊息事件
const handleMessageEvent = async (event: MessageEvent) => {
  try {
    const userId = event.source.userId;
    
    if (event.message.type === 'text') {
      const textMessage = event.message as TextMessage;
      const messageText = textMessage.text;
      
      console.log(`📝 收到文字訊息: "${messageText}" from ${userId}`);
      
      // 記錄訊息到資料庫
      try {
        await MessageLog.create({
          userId: userId || 'unknown',
          messageType: 'received',
          content: messageText,
          timestamp: new Date()
        });
        console.log('💾 訊息已記錄到資料庫');
      } catch (dbError) {
        console.error('❌ 資料庫記錄失敗:', dbError);
      }
      
      // 產生回應訊息
      let replyText = '';
      
      if (messageText.includes('哈囉') || messageText.includes('你好') || messageText.includes('hello')) {
        replyText = '哈囉！歡迎使用北大獅子會系統 🦁\n\n可用指令：\n• 查詢活動\n• 會員資訊\n• 簽到\n• 幫助';
      } else if (messageText.includes('活動')) {
        replyText = '📅 目前活動查詢功能開發中\n請稍後再試或聯繫管理員';
      } else if (messageText.includes('會員')) {
        replyText = '👤 會員資訊功能開發中\n請稍後再試或聯繫管理員';
      } else if (messageText.includes('簽到')) {
        replyText = '✅ 簽到功能開發中\n請稍後再試或聯繫管理員';
      } else if (messageText.includes('幫助') || messageText.includes('help')) {
        replyText = '🤖 北大獅子會 LINE Bot\n\n可用指令：\n• 哈囉/你好 - 歡迎訊息\n• 查詢活動 - 查看活動列表\n• 會員資訊 - 查看會員資料\n• 簽到 - 活動簽到\n• 幫助 - 顯示此訊息';
      } else {
        replyText = `收到您的訊息：「${messageText}」\n\n輸入「幫助」查看可用指令 🤖`;
      }
      
      // 回覆訊息
      const replyMessage = {
        type: 'text' as const,
        text: replyText
      };
      
      await client.replyMessage(event.replyToken, replyMessage);
      console.log('✅ 回覆訊息已傳送');
      
      // 記錄回覆訊息
      try {
        await MessageLog.create({
          userId: userId || 'unknown',
          messageType: 'sent',
          content: replyText,
          timestamp: new Date()
        });
        console.log('💾 回覆訊息已記錄');
      } catch (dbError) {
        console.error('❌ 回覆記錄失敗:', dbError);
      }
      
    } else {
      console.log(`📎 收到非文字訊息: ${event.message.type}`);
      await client.replyMessage(event.replyToken, {
        type: 'text',
        text: '抱歉，目前只支援文字訊息 📝'
      });
    }
    
  } catch (error) {
    console.error('❌ 處理訊息事件失敗:', error);
    throw error;
  }
};

// 處理加好友事件
const handleFollowEvent = async (event: FollowEvent) => {
  try {
    const userId = event.source.userId;
    console.log(`👋 新用戶加入: ${userId}`);
    
    const welcomeMessage = {
      type: 'text' as const,
      text: '🦁 歡迎加入北大獅子會！\n\n感謝您加入我們的 LINE Bot\n輸入「幫助」查看可用功能\n\n如有任何問題，請聯繫管理員'
    };
    
    await client.replyMessage(event.replyToken, welcomeMessage);
    console.log('✅ 歡迎訊息已傳送');
    
  } catch (error) {
    console.error('❌ 處理加好友事件失敗:', error);
  }
};

// 處理取消好友事件
const handleUnfollowEvent = async (event: UnfollowEvent) => {
  try {
    const userId = event.source.userId;
    console.log(`👋 用戶離開: ${userId}`);
    
  } catch (error) {
    console.error('❌ 處理取消好友事件失敗:', error);
  }
};

export default lineHandler;
