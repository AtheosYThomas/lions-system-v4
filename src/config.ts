
import { ClientConfig } from '@line/bot-sdk';

if (!process.env.LINE_CHANNEL_ACCESS_TOKEN || !process.env.LINE_CHANNEL_SECRET) {
  console.error("❌ 缺少 LINE 憑證，請確認 Secrets 是否設定正確");
  process.exit(1); // 強制結束
}

const config: ClientConfig = {
  channelAccessToken: process.env.LINE_CHANNEL_ACCESS_TOKEN!,
  channelSecret: process.env.LINE_CHANNEL_SECRET!,
};

export default config;
