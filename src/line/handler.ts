
import { Request, Response } from 'express';
import { WebhookEvent, Client } from '@line/bot-sdk';
import { config } from '../config/config';
import MessageLog from '../models/messageLog';
import Member from '../models/member';

const client = new Client({
  channelAccessToken: config.line.accessToken,
  channelSecret: config.line.channelSecret
});

const lineHandler = async (req: Request, res: Response) => {
  try {
    console.log('📩 收到 Webhook 請求');
    console.log('📦 Request body =', JSON.stringify(req.body, null, 2));

    const events: WebhookEvent[] = req.body.events || [];
    console.log('📦 收到事件數量 =', events.length);

    const promises = events.map(async (event) => {
      try {
        console.log('🔍 處理事件類型 =', event.type);

        if (event.type === 'message' && event.message.type === 'text') {
          const userMsg = event.message.text;
          const userId = event.source?.userId;
          console.log('🗣️ 使用者訊息 =', userMsg);
          console.log('👤 使用者 ID =', userId);

          // 檢查會員是否存在，避免外鍵錯誤
          if (userId) {
            const member = await Member.findOne({ where: { line_uid: userId } });
            if (member) {
              // 記錄訊息到資料庫
              await MessageLog.create({
                user_id: userId,
                timestamp: new Date(),
                message_type: event.message.type,
                message_content: event.message.text,
                intent: 'default',
                action_taken: 'logged',
              });
              console.log('📝 訊息已記錄到資料庫');
            } else {
              console.log('⚠️ 使用者不在會員資料庫中，跳過訊息記錄');
            }
          }

          await client.replyMessage(event.replyToken, {
            type: 'text',
            text: `你說的是：${userMsg}`,
          });

          console.log('✅ 回覆訊息成功');
        } else {
          console.log('📭 跳過非文字訊息事件');
        }
      } catch (eventErr) {
        console.error('❌ 單一事件處理錯誤 =', eventErr);
      }
    });

    // ✅ 等待所有事件完成
    await Promise.all(promises);
    res.status(200).end(); // ✅ 告訴 LINE 成功處理了
  } catch (err) {
    console.error('❌ handler.ts 總體錯誤：', err);
    res.status(500).end(); // ❌ 出錯才回 500
  }
};

export default lineHandler;
