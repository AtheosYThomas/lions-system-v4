import dotenv from 'dotenv';
import chalk from 'chalk';

// 載入環境變數
dotenv.config();

export function checkEnvironment() {
  console.log(chalk.cyan('🔍 檢查環境變數...'));

  const requiredVars = [
    'DATABASE_URL',
    'LINE_CHANNEL_ACCESS_TOKEN',
    'LINE_CHANNEL_SECRET',
    'LIFF_ID'
  ];

  const missing: string[] = [];
  const present: string[] = [];

  requiredVars.forEach(varName => {
    if (process.env[varName]) {
      present.push(varName);
    } else {
      missing.push(varName);
    }
  });

  console.log(chalk.green(`✅ 已設定的環境變數 (${present.length}/${requiredVars.length}):`));
  present.forEach(varName => {
    console.log(chalk.green(`  - ${varName}`));
  });

  if (missing.length > 0) {
    console.log(chalk.red(`❌ 缺失的環境變數 (${missing.length}):`));
    missing.forEach(varName => {
      console.log(chalk.red(`  - ${varName}`));
    });
    return false;
  }

  console.log(chalk.green('🎉 所有必要的環境變數都已設定！'));
  return true;
}