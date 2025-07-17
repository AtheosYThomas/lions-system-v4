
export const validateEnvironment = (): boolean => {
  const requiredVars = [
    'DATABASE_URL',
    'LINE_CHANNEL_ACCESS_TOKEN',
    'LINE_CHANNEL_SECRET'
  ];

  const missing: string[] = [];
  
  requiredVars.forEach(varName => {
    if (!process.env[varName]) {
      missing.push(varName);
    }
  });

  if (missing.length > 0) {
    console.log('⚠️ 缺少以下環境變數:', missing.join(', '));
    console.log('💡 系統將以有限功能模式運行');
    return false;
  }

  console.log('✅ 所有必要環境變數已設定');
  return true;
};

export const getEnvironmentStatus = () => {
  return {
    DATABASE_URL: !!process.env.DATABASE_URL,
    LINE_CHANNEL_ACCESS_TOKEN: !!process.env.LINE_CHANNEL_ACCESS_TOKEN,
    LINE_CHANNEL_SECRET: !!process.env.LINE_CHANNEL_SECRET,
    PORT: process.env.PORT || '5000'
  };
};
