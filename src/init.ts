
// src/init.ts
import { sequelize } from './config/database';
import Member from './models/member';
import Event from './models/event';
import Registration from './models/registration';
import Checkin from './models/checkin';
import MessageLog from './models/messageLog';
import Payment from './models/payment';

const initDB = async () => {
  try {
    console.log('🔄 開始資料庫初始化...');
    
    // 測試資料庫連接
    await sequelize.authenticate();
    console.log('✅ 資料庫連接成功');
    
    // 同步所有模型到資料庫
    await sequelize.sync({ alter: true });
    console.log('✅ 資料表初始化完成！');
    
    // 檢查各表是否建立成功
    const tableNames = await sequelize.getQueryInterface().showAllTables();
    console.log('📋 已建立的資料表:', tableNames);
    
  } catch (error) {
    console.error('❌ 資料庫初始化錯誤:', error);
    throw error;
  } finally {
    await sequelize.close();
    console.log('🔐 資料庫連接已關閉');
  }
};

// 如果直接執行此檔案就初始化資料庫
if (require.main === module) {
  initDB().catch(console.error);
}

export default initDB;
