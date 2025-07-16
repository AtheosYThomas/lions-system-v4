import * as dotenv from 'dotenv';

// 載入環境變數
dotenv.config();

// 驗證關鍵環境變數是否正確載入，避免未展開的模板字串
const validateEnvVars = () => {
  const requiredVars = ['LINE_CHANNEL_SECRET', 'LINE_CHANNEL_ACCESS_TOKEN'];
  const warnings: string[] = [];

  for (const varName of requiredVars) {
    const value = process.env[varName];
    if (!value) {
      warnings.push(`⚠️ 缺少環境變數: ${varName}`);
    } else if (value.includes('${') && value.includes('}')) {
      warnings.push(`⚠️ 環境變數 ${varName} 包含未展開的模板字串: ${value}`);
    }
  }

  if (warnings.length > 0) {
    console.log('環境變數警告:');
    warnings.forEach(warning => console.log(warning));
  }
};

validateEnvVars();

export const config = {
  line: {
    accessToken: process.env.LINE_CHANNEL_ACCESS_TOKEN || '',
    channelSecret: process.env.LINE_CHANNEL_SECRET || '',
  },
  database: {
    url: process.env.DATABASE_URL || ''
  }
};