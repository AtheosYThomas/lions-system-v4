import { Sequelize } from 'sequelize';

const sequelize = new Sequelize(process.env.DATABASE_URL || '', {
  dialect: 'postgres',
  protocol: 'postgres',
  logging: false,
  dialectOptions: {
    ssl: process.env.NODE_ENV === 'production' ? {
      require: true,
      rejectUnauthorized: false
    } : false
  },
  pool: {
    max: 5,          // 最大連線數
    min: 0,          // 最小連線數
    acquire: 30000,  // 獲取連線的最大等待時間(ms)
    idle: 10000      // 連線閒置時間(ms)
  },
  retry: {
    max: 3           // 最大重試次數
  }
});

export default sequelize;