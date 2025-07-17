
import fetch from 'node-fetch';

const testMessages = [
  '哈囉',
  '你好',
  '查詢活動',
  '會員資訊',
  '簽到',
  '幫助',
  '測試訊息'
];

async function testLineBot() {
  console.log('🤖 開始測試 LINE Bot 功能...\n');

  for (const message of testMessages) {
    console.log(`📤 測試訊息: "${message}"`);
    
    try {
      const response = await fetch('http://localhost:5000/webhook', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
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
              }
            }
          ]
        })
      });

      const status = response.ok ? '✅ 成功' : '❌ 失敗';
      console.log(`📥 回應狀態: ${status} (${response.status})`);
      
    } catch (error) {
      console.log(`❌ 測試失敗: ${error}`);
    }
    
    console.log('---');
    
    // 等待 1 秒再測試下一個訊息
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  console.log('✅ LINE Bot 測試完成！');
}

// 測試加好友事件
async function testFollowEvent() {
  console.log('\n👋 測試加好友事件...');
  
  try {
    const response = await fetch('http://localhost:5000/webhook', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        events: [
          {
            type: 'follow',
            replyToken: `test-follow-${Date.now()}`,
            source: {
              userId: 'test-new-user-456',
              type: 'user'
            }
          }
        ]
      })
    });

    const status = response.ok ? '✅ 成功' : '❌ 失敗';
    console.log(`📥 加好友事件回應: ${status} (${response.status})`);
    
  } catch (error) {
    console.log(`❌ 加好友事件測試失敗: ${error}`);
  }
}

// 執行測試
async function runTests() {
  await testLineBot();
  await testFollowEvent();
}

runTests().catch(console.error);
