
import fetch from 'node-fetch';
import crypto from 'crypto';
import { config } from '../config/config';

async function testLineWebhook() {
  console.log('🧪 測試 LINE Webhook 設定...');
  
  // 1. 檢查環境變數
  console.log('\n1️⃣ 檢查環境變數:');
  console.log('✅ LINE_CHANNEL_SECRET:', config.line.channelSecret ? '已設定' : '❌ 未設定');
  console.log('✅ LINE_CHANNEL_ACCESS_TOKEN:', config.line.accessToken ? '已設定' : '❌ 未設定');
  
  // 2. 測試本地 webhook 端點
  console.log('\n2️⃣ 測試本地 webhook 端點:');
  
  const testPayload = {
    events: [
      {
        type: 'message',
        timestamp: Date.now(),
        source: {
          type: 'user',
          userId: 'test-user-id'
        },
        replyToken: 'test-reply-token',
        message: {
          type: 'text',
          id: 'test-message-id',
          text: '測試訊息'
        }
      }
    ]
  };
  
  const body = JSON.stringify(testPayload);
  const signature = crypto
    .createHmac('sha256', config.line.channelSecret)
    .update(body, 'utf8')
    .digest('base64');
    
  try {
    const response = await fetch('http://localhost:5000/webhook', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-line-signature': signature,
        'User-Agent': 'Test-Agent'
      },
      body: body
    });
    
    console.log('📤 發送測試請求到 webhook');
    console.log('📦 Payload:', testPayload);
    console.log('🔐 Signature:', signature);
    console.log('📨 回應狀態:', response.status);
    console.log('📨 回應內容:', await response.text());
    
  } catch (error) {
    console.error('❌ 測試請求失敗:', error);
  }
  
  // 3. 檢查 webhook URL 格式
  console.log('\n3️⃣ Webhook URL 格式檢查:');
  console.log('本地測試: http://localhost:5000/webhook');
  console.log('生產環境: https://your-repl-name.replit.dev/webhook');
  console.log('📝 請確保在 LINE Developers Console 中設定正確的 webhook URL');
}

if (require.main === module) {
  testLineWebhook().catch(console.error);
}

export default testLineWebhook;
