
import { Sequelize } from 'sequelize';
import { config } from './config';

export const sequelize = new Sequelize(config.database.url, {
  dialect: 'postgres',
  logging: console.log, // 開啟日誌以便調試
  dialectOptions: {
    ssl: process.env.NODE_ENV === 'production' ? {
      require: true,
      rejectUnauthorized: false
    } : false
  }
});

// 預設匯出
export default sequelize;
