
import chalk from 'chalk';

export function validateEnvironment(): boolean {
  console.log(chalk.cyan('🔍 驗證環境變數...'));
  
  const errors: string[] = [];
  
  // 檢查資料庫連線
  if (!process.env.DATABASE_URL) {
    errors.push('DATABASE_URL 未設定');
  }
  
  // 檢查 LINE 設定
  if (!process.env.LINE_CHANNEL_ACCESS_TOKEN) {
    errors.push('LINE_CHANNEL_ACCESS_TOKEN 未設定');
  }
  
  if (!process.env.LINE_CHANNEL_SECRET) {
    errors.push('LINE_CHANNEL_SECRET 未設定');
  }
  
  // 檢查 LIFF 設定
  if (!process.env.LIFF_APP_ID) {
    errors.push('LIFF_APP_ID 未設定');
  }
  
  if (errors.length > 0) {
    console.log(chalk.red('❌ 環境變數驗證失敗:'));
    errors.forEach(error => {
      console.log(chalk.red(`  - ${error}`));
    });
    return false;
  }
  
  console.log(chalk.green('✅ 環境變數驗證通過'));
  return true;
}
