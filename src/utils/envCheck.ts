
export const checkRequiredEnvVars = () => {
  const required = [
    'LINE_CHANNEL_SECRET',
    'LINE_CHANNEL_ACCESS_TOKEN'
  ];

  const missing = required.filter(varName => !process.env[varName]);
  
  if (missing.length > 0) {
    console.error('❌ 缺少必要的環境變數:', missing);
    console.error('請在 .env 檔案中設定以上變數');
    process.exit(1);
  }
  
  console.log('✅ 所有必要環境變數已設定');
};
