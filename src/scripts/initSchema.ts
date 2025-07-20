import sequelize from '../config/database';
import '../models/index'; // 載入所有模型關聯

/**
 * 資料庫結構初始化腳本
 * 用於創建和同步資料表結構
 * 僅用於開發環境或首次部署
 */
const initSchema = async () => {
  try {
    console.log('🔄 開始資料庫結構初始化...');

    // 測試資料庫連線
    console.log('🔗 測試資料庫連線...');
    await sequelize.authenticate();
    console.log('✅ 資料庫連線成功！');

    // 同步資料表結構
    console.log('🏗️ 開始同步資料表結構...');
    await sequelize.sync({ alter: true });
    console.log('✅ 資料表結構同步完成！');

    // 顯示已建立的表格
    const tables = await sequelize.getQueryInterface().showAllTables();
    console.log('📋 已建立的資料表:', tables.sort());

    console.log('🎉 資料庫結構初始化完成！');
  } catch (error) {
    console.error('❌ 資料庫初始化錯誤:', error);
    if (error instanceof Error) {
      console.error('錯誤詳情:', error.message);
      if (error.message.includes('foreign key constraint')) {
        console.error('🔧 建議: 檢查外鍵資料型別是否匹配');
      }
    }
    // 在生產環境中不要直接退出，讓應用程式繼續啟動
    if (process.env.NODE_ENV !== 'production') {
      process.exit(1);
    }
  } finally {
    await sequelize.close();
    console.log('🔒 資料庫連線已關閉');
    process.exit(0);
  }
};

// 直接執行
if (require.main === module) {
  initSchema();
}

export default initSchema;
