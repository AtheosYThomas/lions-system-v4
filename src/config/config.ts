import * as dotenv from 'dotenv';
dotenv.config();

export const config = {
  line: {
    accessToken: process.env.LINE_CHANNEL_ACCESS_TOKEN || '',
    channelSecret: process.env.LINE_CHANNEL_SECRET || '',
  },
  liff: {
    appId: process.env.LIFF_APP_ID || '2007739371-aKePV20l'
  },
  database: {
    url: process.env.DATABASE_URL || ''
  }
};