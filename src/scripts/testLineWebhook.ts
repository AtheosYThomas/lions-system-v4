import axios from 'axios';
import crypto from 'crypto';
import dotenv from 'dotenv';

dotenv.config();

/**
 * 測試 LINE Webhook 功能
 * 模擬 LINE 平台發送的訊息事件
 */
class LineWebhookTester {
  private readonly webhookUrl: string;
  private readonly channelSecret: string;

  constructor() {
    this.webhookUrl = 'http://0.0.0.0:5000/webhook';
    this.channelSecret = process.env.LINE_CHANNEL_SECRET || '';
  }

  /**
   * 生成 LINE 簽名
   */
  private generateSignature(body: string): string {
    if (!this.channelSecret) {
      console.warn('⚠️ LINE_CHANNEL_SECRET 未設定，跳過簽名驗證');
      return '';
    }

    return crypto
      .createHmac('sha256', this.channelSecret)
      .update(body, 'utf8')
      .digest('base64');
  }

  /**
   * 測試文字訊息事件
   */
  async testTextMessage(
    text: string,
    userId = 'U_TEST_USER_12345'
  ): Promise<void> {
    const payload = {
      destination: 'U_LINE_BOT_ID',
      events: [
        {
          type: 'message',
          message: {
            type: 'text',
            id: `msg_${Date.now()}`,
            text: text,
          },
          timestamp: Date.now(),
          source: {
            type: 'user',
            userId: userId,
          },
          replyToken: `REPLY_TOKEN_${Date.now()}`,
          mode: 'active',
        },
      ],
    };

    const body = JSON.stringify(payload);
    const signature = this.generateSignature(body);

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'User-Agent': 'LineBotSdk/1.0',
    };

    if (signature) {
      headers['x-line-signature'] = signature;
    }

    try {
      console.log(`🧪 測試訊息: "${text}"`);
      console.log(`👤 用戶ID: ${userId}`);

      const response = await axios.post(this.webhookUrl, payload, { headers });

      console.log('✅ Webhook 測試成功');
      console.log('📊 回應狀態:', response.status);
      console.log('📦 回應資料:', response.data);
    } catch (error: any) {
      console.error('❌ Webhook 測試失敗');
      if (error.response) {
        console.error('📊 狀態碼:', error.response.status);
        console.error('📦 錯誤資料:', error.response.data);
      } else {
        console.error('🔍 錯誤訊息:', error.message);
      }
    }
  }

  /**
   * 測試追蹤事件
   */
  async testFollowEvent(userId = 'U_TEST_USER_12345'): Promise<void> {
    const payload = {
      destination: 'U_LINE_BOT_ID',
      events: [
        {
          type: 'follow',
          timestamp: Date.now(),
          source: {
            type: 'user',
            userId: userId,
          },
          replyToken: `REPLY_TOKEN_${Date.now()}`,
          mode: 'active',
        },
      ],
    };

    const body = JSON.stringify(payload);
    const signature = this.generateSignature(body);

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'User-Agent': 'LineBotSdk/1.0',
    };

    if (signature) {
      headers['x-line-signature'] = signature;
    }

    try {
      console.log(`🧪 測試追蹤事件`);
      console.log(`👤 用戶ID: ${userId}`);

      const response = await axios.post(this.webhookUrl, payload, { headers });

      console.log('✅ 追蹤事件測試成功');
      console.log('📊 回應狀態:', response.status);
      console.log('📦 回應資料:', response.data);
    } catch (error: any) {
      console.error('❌ 追蹤事件測試失敗');
      if (error.response) {
        console.error('📊 狀態碼:', error.response.status);
        console.error('📦 錯誤資料:', error.response.data);
      } else {
        console.error('🔍 錯誤訊息:', error.message);
      }
    }
  }

  /**
   * 批量測試多個關鍵字
   */
  async runBatchTest(userId = 'U_TEST_USER_12345'): Promise<void> {
    console.log('🚀 開始批量測試 LINE Webhook');
    console.log('================================');

    const testCases = ['簽到', '活動', '會員', '報名', 'hello', '測試訊息'];

    for (const testCase of testCases) {
      await this.testTextMessage(testCase, userId);
      console.log(''); // 空行分隔

      // 避免請求過快
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    console.log('================================');
    console.log('✅ 批量測試完成');
  }
}

// 執行測試
async function main(): Promise<void> {
  const tester = new LineWebhookTester();

  // 檢查命令行參數
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.log('📋 使用方式:');
    console.log('npx tsx src/scripts/testLineWebhook.ts "測試訊息" [userId]');
    console.log('npx tsx src/scripts/testLineWebhook.ts --batch [userId]');
    console.log('npx tsx src/scripts/testLineWebhook.ts --follow [userId]');
    console.log('');
    console.log('📝 範例:');
    console.log('npx tsx src/scripts/testLineWebhook.ts "簽到"');
    console.log('npx tsx src/scripts/testLineWebhook.ts "會員" U123456789');
    console.log('npx tsx src/scripts/testLineWebhook.ts --batch');
    console.log('npx tsx src/scripts/testLineWebhook.ts --follow U123456789');
    return;
  }

  const [command, userId] = args;

  switch (command) {
    case '--batch':
      await tester.runBatchTest(userId);
      break;

    case '--follow':
      await tester.testFollowEvent(userId);
      break;

    default:
      await tester.testTextMessage(command, userId);
      break;
  }
}

// 執行主程式
if (require.main === module) {
  main().catch(console.error);
}

export default LineWebhookTester;
