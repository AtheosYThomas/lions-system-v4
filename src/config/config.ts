
import dotenv from 'dotenv';
dotenv.config();

export const config = {
  line: {
    channelSecret: process.env.LINE_CHANNEL_SECRET || '',
    accessToken: process.env.LINE_ACCESS_TOKEN || '',
    liffId: process.env.LIFF_ID || '',
  },
  db: {
    url: process.env.DATABASE_URL || '',
  },
  openai: {
    key: process.env.OPENAI_API_KEY || '',
  },
  jwtSecret: process.env.JWT_SECRET || 'secret',
};
