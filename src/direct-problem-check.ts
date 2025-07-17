
import sequelize from './config/database';

const directProblemCheck = async () => {
  console.log('🎯 直接問題確認檢查');
  console.log('='.repeat(40));
  
  const results = {
    database: '未測試',
    models: '未測試',
    associations: '未測試',
    errors: [] as string[]
  };

  try {
    // 1. 快速資料庫連線測試
    console.log('1️⃣ 測試資料庫連線...');
    await sequelize.authenticate();
    results.database = '✅ 正常';
    console.log('   ✅ 資料庫連線成功');
  } catch (error) {
    results.database = `❌ 失敗: ${error}`;
    results.errors.push(`資料庫連線失敗: ${error}`);
    console.log('   ❌ 資料庫連線失敗:', error);
  }

  try {
    // 2. 快速模型載入測試
    console.log('2️⃣ 測試模型載入...');
    const Member = require('./models/member').default;
    const Event = require('./models/event').default;
    
    if (Member && Event) {
      results.models = '✅ 正常';
      console.log('   ✅ 主要模型載入成功');
    } else {
      results.models = '❌ 模型載入失敗';
      results.errors.push('主要模型載入失敗');
    }
  } catch (error) {
    results.models = `❌ 失敗: ${error}`;
    results.errors.push(`模型載入錯誤: ${error}`);
    console.log('   ❌ 模型載入失敗:', error);
  }

  try {
    // 3. 簡單關聯測試（不創建資料）
    console.log('3️⃣ 測試模型關聯...');
    const models = require('./models');
    
    if (models.Member && models.Event) {
      results.associations = '✅ 正常';
      console.log('   ✅ 模型關聯載入成功');
    } else {
      results.associations = '❌ 關聯載入失敗';
      results.errors.push('模型關聯載入失敗');
    }
  } catch (error) {
    results.associations = `❌ 失敗: ${error}`;
    results.errors.push(`關聯測試錯誤: ${error}`);
    console.log('   ❌ 關聯測試失敗:', error);
  }

  // 4. 結果總結
  console.log('\n📋 問題確認結果:');
  console.log('='.repeat(40));
  console.log(`🗄️  資料庫狀態: ${results.database}`);
  console.log(`📊 模型載入: ${results.models}`);
  console.log(`🔗 模型關聯: ${results.associations}`);
  
  if (results.errors.length === 0) {
    console.log('\n🎉 所有檢查通過！系統狀態正常');
    console.log('💡 建議: 可以安全啟動系統');
  } else {
    console.log('\n❌ 發現問題:');
    results.errors.forEach((error, index) => {
      console.log(`${index + 1}. ${error}`);
    });
    
    console.log('\n🔧 建議修復步驟:');
    if (results.database.includes('❌')) {
      console.log('   1. 檢查 DATABASE_URL 環境變數');
      console.log('   2. 確認資料庫服務狀態');
    }
    if (results.models.includes('❌')) {
      console.log('   3. 檢查模型檔案完整性');
      console.log('   4. 確認 TypeScript 編譯');
    }
    if (results.associations.includes('❌')) {
      console.log('   5. 檢查 models/index.ts 檔案');
      console.log('   6. 確認關聯定義正確');
    }
  }

  await sequelize.close();
  console.log('\n✅ 檢查完成');
};

directProblemCheck().catch(console.error);
