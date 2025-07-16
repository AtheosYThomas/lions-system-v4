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