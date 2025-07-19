
import dotenv from 'dotenv';

// 載入環境變數
dotenv.config();

// 設定測試環境
process.env.NODE_ENV = 'test';

// 增加測試超時時間
jest.setTimeout(30000);

// 全域測試設定
beforeAll(async () => {
  console.log('🧪 開始執行測試...');
});

afterAll(async () => {
  console.log('✅ 測試完成');
});
