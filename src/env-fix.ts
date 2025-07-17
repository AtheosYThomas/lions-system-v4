
import fs from 'fs';

const envFix = () => {
  console.log('🔧 開始修復環境變數問題...\n');

  // 1. 清理危險的環境變數
  console.log('🧹 清理危險的環境變數...');
  
  const dangerousVars = [
    'DEBUG_URL',
    'WEBPACK_DEV_SERVER_URL',
    'WEBPACK_DEV_SERVER',
    'HMR_HOST',
    'HMR_PORT',
    'VITE_DEV_SERVER_URL'
  ];

  dangerousVars.forEach(varName => {
    if (process.env[varName]) {
      delete process.env[varName];
      console.log(`✅ 已清理 ${varName}`);
    }
  });

  // 2. 檢查並清理包含錯誤訊息的環境變數
  console.log('\n🔍 檢查環境變數值...');
  
  Object.entries(process.env).forEach(([key, value]) => {
    if (value && typeof value === 'string') {
      if (value.includes('${') || 
          value.includes('undefined') || 
          value.includes('Missing parameter') ||
          value.includes('null')) {
        delete process.env[key];
        console.log(`✅ 已清理問題變數: ${key}`);
      }
    }
  });

  // 3. 設定必要的環境變數預設值
  console.log('\n⚙️ 設定預設環境變數...');
  
  if (!process.env.NODE_ENV) {
    process.env.NODE_ENV = 'development';
    console.log('✅ 設定 NODE_ENV = development');
  }

  if (!process.env.PORT) {
    process.env.PORT = '5000';
    console.log('✅ 設定 PORT = 5000');
  }

  // 4. 檢查 .env 檔案
  console.log('\n📄 檢查 .env 檔案...');
  
  if (!fs.existsSync('.env')) {
    const envTemplate = `# 北大獅子會系統環境變數設定

# LINE Bot 設定 (請替換為實際值)
LINE_CHANNEL_ACCESS_TOKEN=your_line_channel_access_token_here
LINE_CHANNEL_SECRET=your_line_channel_secret_here

# 資料庫設定
DATABASE_URL=sqlite://./database.db

# 伺服器設定
PORT=5000
NODE_ENV=development

# 可選設定
DEBUG=false
LOG_LEVEL=info
`;
    
    fs.writeFileSync('.env', envTemplate);
    console.log('✅ 已建立 .env 範本檔案');
    console.log('⚠️  請編輯 .env 檔案，填入正確的 LINE Bot 憑證');
  } else {
    console.log('✅ .env 檔案已存在');
    
    // 檢查 .env 檔案內容
    const envContent = fs.readFileSync('.env', 'utf-8');
    
    if (envContent.includes('your_line_channel_access_token_here')) {
      console.log('⚠️  請更新 .env 檔案中的 LINE Bot 憑證');
    }
  }

  console.log('\n🎯 環境變數修復完成！');
};

export default envFix;

// 如果直接執行此檔案
if (require.main === module) {
  envFix();
}
