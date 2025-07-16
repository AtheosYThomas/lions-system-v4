
import { ClientConfig } from '@line/bot-sdk';

const config: ClientConfig = {
  channelAccessToken: process.env.LINE_CHANNEL_ACCESS_TOKEN || '',
  channelSecret: process.env.LINE_CHANNEL_SECRET || '',
};

// 確保必要的環境變數存在
if (!process.env.LINE_CHANNEL_ACCESS_TOKEN) {
  console.warn('⚠️  LINE_CHANNEL_ACCESS_TOKEN not found in environment');
}

if (!process.env.LINE_CHANNEL_SECRET) {
  console.warn('⚠️  LINE_CHANNEL_SECRET not found in environment');
}

export default config;
