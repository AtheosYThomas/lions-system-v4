
const BASE_URL = 'http://0.0.0.0:5000';

const testMessages = [
  '哈囉',
  '你好', 
  '查詢活動',
  '會員資訊',
  '簽到',
  '幫助',
  '測試訊息',
  'hello',
  'help'
];

async function testHealthCheck(retries = 3) {
  console.log('🏥 檢查伺服器健康狀態...');
  
  for (let i = 0; i < retries; i++) {
    try {
      console.log(`🔄 嘗試 ${i + 1}/${retries}...`);
      
      const response = await fetch(`${BASE_URL}/health`, {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });
      
      console.log(`📊 回應狀態: ${response.status}`);
      console.log(`📊 回應類型: ${response.headers.get('content-type')}`);
      
      if (response.ok) {
        const responseText = await response.text();
        console.log(`📊 回應內容: ${responseText.substring(0, 200)}...`);
        
        try {
          const health = JSON.parse(responseText);
          console.log('✅ 伺服器健康狀態:', health);
          return true;
        } catch (jsonError) {
          console.log('❌ JSON 解析錯誤，伺服器可能回應了 HTML');
          console.log('回應開頭:', responseText.substring(0, 100));
        }
      } else {
        console.log('❌ 伺服器回應異常:', response.status);
      }
    } catch (error) {
      console.log(`❌ 連接錯誤 (${i + 1}/${retries}):`, error.message);
    }
    
    // 如果不是最後一次嘗試，等待 2 秒
    if (i < retries - 1) {
      console.log('⏳ 等待 2 秒後重試...');
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }
  
  return false;
}

async function testWebhookEndpoint() {
  console.log('🔍 測試 Webhook 端點可用性...');
  
  try {
    // 測試空的 webhook 請求 (LINE 驗證用)
    const response = await fetch(`${BASE_URL}/webhook`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Line-Signature': 'test-signature'
      },
      body: JSON.stringify({ events: [] })
    });

    if (response.status === 200) {
      console.log('✅ Webhook 端點可用');
      return true;
    } else {
      console.log(`❌ Webhook 端點回應異常: ${response.status}`);
      return false;
    }
  } catch (error) {
    console.log('❌ Webhook 端點測試失敗:', error.message);
    return false;
  }
}

async function sendTestMessage(message: string, delay = 1000) {
  console.log(`\n📤 測試訊息: "${message}"`);
  
  try {
    const testEvent = {
      events: [
        {
          type: 'message',
          replyToken: `test-reply-${Date.now()}`,
          source: {
            userId: 'test-user-123',
            type: 'user'
          },
          message: {
            type: 'text',
            text: message
          },
          timestamp: Date.now()
        }
      ]
    };

    const response = await fetch(`${BASE_URL}/webhook`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Line-Signature': 'test-signature'
      },
      body: JSON.stringify(testEvent),
      timeout: 10000
    });

    const status = response.ok ? '✅ 成功' : '❌ 失敗';
    console.log(`📥 回應狀態: ${status} (${response.status})`);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.log('錯誤詳情:', errorText);
    }
    
  } catch (error) {
    console.log(`❌ 測試失敗: ${error.message}`);
  }
  
  console.log('---');
  
  // 等待指定時間再測試下一個訊息
  if (delay > 0) {
    await new Promise(resolve => setTimeout(resolve, delay));
  }
}

async function testFollowEvent() {
  console.log('\n👋 測試加好友事件...');
  
  try {
    const followEvent = {
      events: [
        {
          type: 'follow',
          replyToken: `test-follow-${Date.now()}`,
          source: {
            userId: 'test-new-user-456',
            type: 'user'
          },
          timestamp: Date.now()
        }
      ]
    };

    const response = await fetch(`${BASE_URL}/webhook`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Line-Signature': 'test-signature'
      },
      body: JSON.stringify(followEvent),
      timeout: 10000
    });

    const status = response.ok ? '✅ 成功' : '❌ 失敗';
    console.log(`📥 加好友事件回應: ${status} (${response.status})`);
    
  } catch (error) {
    console.log(`❌ 加好友事件測試失敗: ${error.message}`);
  }
}

// 執行完整測試
async function runFullTest() {
  console.log('🤖 開始完整 LINE Bot 測試...\n');
  
  // 1. 檢查伺服器健康狀態
  const serverHealthy = await testHealthCheck();
  if (!serverHealthy) {
    console.log('❌ 伺服器不可用，停止測試');
    return;
  }
  
  // 2. 測試 Webhook 端點
  const webhookAvailable = await testWebhookEndpoint();
  if (!webhookAvailable) {
    console.log('❌ Webhook 端點不可用，停止測試');
    return;
  }
  
  console.log('\n🔄 開始訊息測試...');
  
  // 3. 測試各種訊息
  for (const message of testMessages) {
    await sendTestMessage(message, 800);
  }
  
  // 4. 測試加好友事件
  await testFollowEvent();
  
  console.log('\n✅ LINE Bot 完整測試完成！');
  console.log('\n💡 如果測試成功但實際 LINE 仍無回應，請檢查：');
  console.log('   1. LINE Channel Access Token 是否正確');
  console.log('   2. LINE Channel Secret 是否正確');
  console.log('   3. LINE Webhook URL 是否設定為正確的公開 URL');
  console.log('   4. LINE Bot 是否已加為好友');
}

// 快速測試單一訊息
async function quickTest(message = '哈囉') {
  console.log(`🚀 快速測試訊息: "${message}"`);
  
  const serverHealthy = await testHealthCheck();
  if (serverHealthy) {
    await sendTestMessage(message, 0);
  }
}

// 根據命令行參數決定執行哪種測試
const args = process.argv.slice(2);
if (args.length > 0 && args[0] === 'quick') {
  const message = args[1] || '哈囉';
  quickTest(message).catch(console.error);
} else {
  runFullTest().catch(console.error);
}
