
import dotenv from 'dotenv';
import { sequelize } from '../src/models/index';
import Member from '../src/models/member';
import Event from '../src/models/event';
import Registration from '../src/models/registration';
import Announcement from '../src/models/announcement';
import Checkin from '../src/models/checkin';
import Payment from '../src/models/payment';

// 載入測試環境變數
dotenv.config();

/**
 * 清理測試資料庫
 */
export async function cleanTestDatabase() {
  try {
    console.log('🧽 開始清理測試資料...');
    
    // 依照外鍵關係順序刪除
    await Payment.destroy({ where: {}, truncate: true });
    await Checkin.destroy({ where: {}, truncate: true });
    await Registration.destroy({ where: {}, truncate: true });
    await Announcement.destroy({ where: {}, truncate: true });
    await Event.destroy({ where: {}, truncate: true });
    await Member.destroy({ where: {}, truncate: true });
    
    console.log('✅ 測試資料清理完成');
  } catch (error) {
    console.error('❌ 清理測試資料失敗:', error);
    throw error;
  }
}

// 全域測試設定
beforeAll(async () => {
  // 測試前的全域設定
  try {
    await sequelize.authenticate();
    console.log('✅ 測試資料庫連線成功');
  } catch (error) {
    console.error('❌ 測試資料庫連線失敗:', error);
    throw error;
  }
});

afterAll(async () => {
  // 測試後的清理工作
  await cleanTestDatabase();
  await sequelize.close();
  console.log('🧽 測試結束，資料已清除');
});

// 每個測試檔案後清理
afterEach(async () => {
  await cleanTestDatabase();
});
