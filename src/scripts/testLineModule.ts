
import lineService from '../services/lineService';
import lineController from '../controllers/lineController';
import { LineWebhookRequestBody } from '../types/line';

// 測試 LINE 模組重構後的功能
async function testLineModule() {
  console.log('🧪 開始測試 LINE 模組重構...');
  
  // 1. 測試服務層
  try {
    console.log('1️⃣ 測試 LineService...');
    const mockEvents = [];
    const result = await lineService.handleWebhookEvents(mockEvents);
    console.log('✅ LineService.handleWebhookEvents 測試通過:', result);
  } catch (error) {
    console.error('❌ LineService 測試失敗:', error);
  }

  // 2. 測試控制器層
  try {
    console.log('2️⃣ 測試 LineController...');
    const mockReq = {
      body: { events: [] } as LineWebhookRequestBody
    } as any;
    const mockRes = {
      status: (code: number) => ({ send: (msg: string) => console.log(`Response: ${code} - ${msg}`) }),
      json: (data: any) => console.log('JSON Response:', data)
    } as any;
    
    await lineController.handleWebhook(mockReq, mockRes);
    console.log('✅ LineController.handleWebhook 測試通過');
  } catch (error) {
    console.error('❌ LineController 測試失敗:', error);
  }

  // 3. 測試路由層
  try {
    console.log('3️⃣ 測試路由匯入...');
    const webhook = await import('../routes/line/webhook');
    console.log('✅ LINE webhook 路由匯入成功');
  } catch (error) {
    console.error('❌ LINE webhook 路由匯入失敗:', error);
  }

  console.log('🎉 LINE 模組測試完成！');
}

testLineModule().catch(console.error);
