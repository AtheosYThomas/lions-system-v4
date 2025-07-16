// 在載入任何模組前先清理環境
console.log('🧹 初始化前清理 path-to-regexp 問題...');

// 清理所有可能導致 path-to-regexp 錯誤的環境變數
const dangerousVars = Object.keys(process.env).filter(key => {
  const value = process.env[key];
  return value && typeof value === 'string' && (
    value.includes('${') ||
    value.includes('Missing parameter') ||
    value.includes('undefined') ||
    value.includes('null') ||
    key.includes('DEBUG_URL') ||
    key.includes('WEBPACK') ||
    key.includes('HMR') ||
    key.includes('VITE_DEV')
  );
});

dangerousVars.forEach(key => {
  console.log(`🧹 清理危險變數: ${key}`);
  delete process.env[key];
});

// 設置安全的預設值
process.env.NODE_ENV = 'development';
process.env.PORT = process.env.PORT || '5000';

console.log('✅ 環境清理完成');

import sequelize from './config/database';
import './models/index'; // 載入所有模型關聯

const initDB = async () => {
  try {
    console.log('🔄 開始測試資料庫連線...');
    await sequelize.authenticate();
    console.log('✅ 資料庫連線成功！');

    console.log('🔄 開始同步資料表...');
    await sequelize.sync({ force: true });
    console.log('✅ 資料表初始化完成！');

    // 顯示所有已建立的表格
    const tables = await sequelize.getQueryInterface().showAllTables();
    console.log('📋 已建立的資料表:', tables);

  } catch (error) {
    console.error('❌ 資料庫初始化錯誤:', error);
    if (error instanceof Error) {
      console.error('錯誤詳情:', error.message);
    }
  } finally {
    await sequelize.close();
    console.log('🔒 資料庫連線已關閉');
  }
};

initDB();