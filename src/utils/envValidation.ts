
const requiredEnvVars = [
  'NODE_ENV',
  'LINE_CHANNEL_ACCESS_TOKEN',
  'LINE_CHANNEL_SECRET',
  'DATABASE_URL',
  'PORT'
];

// 保險判斷方式
export const isDev = process.env.NODE_ENV === 'development';
export const isProd = process.env.NODE_ENV === 'production';
export const isTest = process.env.NODE_ENV === 'test';

export const validateEnvironment = () => {
  const missing: string[] = [];
  const configured: string[] = [];
  
  requiredEnvVars.forEach(envVar => {
    if (process.env[envVar]) {
      configured.push(envVar);
    } else {
      missing.push(envVar);
    }
  });
  
  if (missing.length > 0) {
    console.error('❌ 缺少必要的環境變數:', missing);
    return false;
  }
  
  console.log('✅ 所有環境變數已設定:', configured);
  return true;
};
