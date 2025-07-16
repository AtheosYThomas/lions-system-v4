import dotenv from 'dotenv';
dotenv.config();

export const config = {
  line: {
    accessToken: process.env.LINE_CHANNEL_ACCESS_TOKEN || '',
    channelSecret: process.env.LINE_CHANNEL_SECRET || '',
  },
  database: {
    url: process.env.DATABASE_URL || ''
  }
};