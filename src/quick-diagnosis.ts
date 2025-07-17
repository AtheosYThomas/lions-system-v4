
import fs from 'fs';
import path from 'path';

const quickDiagnosis = async () => {
  console.log('🔍 快速系統診斷...\n');
  
  const issues: string[] = [];
  const fixes: string[] = [];

  // 1. 檢查必要檔案
  const requiredFiles = [
    'src/index.ts',
    'src/config/database.ts',
    'src/models/index.ts',
    '.env'
  ];

  requiredFiles.forEach(file => {
    if (!fs.existsSync(file)) {
      issues.push(`❌ 缺少檔案: ${file}`);
    } else {
      console.log(`✅ ${file} 存在`);
    }
  });

  // 2. 檢查環境變數
  const requiredEnvVars = [
    'LINE_CHANNEL_ACCESS_TOKEN',
    'LINE_CHANNEL_SECRET',
    'DATABASE_URL',
    'PORT'
  ];

  requiredEnvVars.forEach(varName => {
    const value = process.env[varName];
    if (!value || value === 'undefined' || value.includes('${')) {
      issues.push(`❌ 環境變數問題: ${varName}`);
    } else {
      console.log(`✅ ${varName} 已設定`);
    }
  });

  // 3. 檢查前端建置
  if (!fs.existsSync('client/dist')) {
    issues.push('❌ 前端未建置');
  } else {
    console.log('✅ 前端已建置');
  }

  // 4. 輸出問題摘要
  if (issues.length > 0) {
    console.log('\n🚨 發現問題:');
    issues.forEach((issue, index) => {
      console.log(`${index + 1}. ${issue}`);
    });

    console.log('\n💡 建議修復步驟:');
    console.log('1. 執行環境修復: npx ts-node src/env-fix.ts');
    console.log('2. 初始化資料庫: npx tsx src/init.ts');
    console.log('3. 建置前端: cd client && npm install && npm run build');
    console.log('4. 啟動系統: npx ts-node src/index.ts');
  } else {
    console.log('\n🎉 系統檢查通過，可以啟動！');
  }

  return issues.length === 0;
};

export default quickDiagnosis;

if (require.main === module) {
  quickDiagnosis();
}
