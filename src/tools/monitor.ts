
import { config } from '../config/config';
import sequelize from '../config/database';

const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m'
};

async function monitorSystem() {
  console.log(`${colors.blue}📊 北大獅子會系統監控 - ${new Date().toLocaleString()}${colors.reset}`);
  console.log('=' .repeat(50));

  // 檢查資料庫連線
  try {
    await sequelize.authenticate();
    console.log(`${colors.green}✅ 資料庫連線: 正常${colors.reset}`);
  } catch (error) {
    console.log(`${colors.red}❌ 資料庫連線: 失敗${colors.reset}`);
    console.error('資料庫錯誤:', error);
  }

  // 檢查 LINE 配置
  const lineStatus = config.line.accessToken && config.line.channelSecret;
  console.log(`${lineStatus ? colors.green : colors.red}${lineStatus ? '✅' : '❌'} LINE Bot 配置: ${lineStatus ? '已設定' : '未設定'}${colors.reset}`);

  // 檢查記憶體使用
  const usage = process.memoryUsage();
  const memoryMB = Math.round(usage.rss / 1024 / 1024);
  const memoryColor = memoryMB > 200 ? colors.red : memoryMB > 100 ? colors.yellow : colors.green;
  console.log(`${memoryColor}📊 記憶體使用: ${memoryMB}MB${colors.reset}`);

  // 檢查系統運行時間
  const uptimeMinutes = Math.floor(process.uptime() / 60);
  console.log(`${colors.blue}⏱️ 系統運行時間: ${uptimeMinutes} 分鐘${colors.reset}`);

  // 測試 API 端點
  try {
    const response = await fetch('http://localhost:5000/health');
    const status = response.ok ? '正常' : '異常';
    const statusColor = response.ok ? colors.green : colors.red;
    console.log(`${statusColor}🔍 Health Check: ${status}${colors.reset}`);
  } catch (error) {
    console.log(`${colors.red}❌ Health Check: 無法連接${colors.reset}`);
  }

  console.log('=' .repeat(50));
}

// 立即執行一次
monitorSystem();

// 每 30 秒監控一次
setInterval(monitorSystem, 30000);

// 處理 Ctrl+C 退出
process.on('SIGINT', () => {
  console.log(`\n${colors.yellow}👋 監控已停止${colors.reset}`);
  process.exit(0);
});
