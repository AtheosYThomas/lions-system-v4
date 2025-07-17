
import sequelize from '../config/database';
import Member from './member';
import Event from './event';
import Checkin from './checkin';
import Registration from './registration';
import Payment from './payment';
import MessageLog from './messageLog';

// 建立模型集合
const db = {
  Member,
  Event,
  Checkin,
  Registration,
  Payment,
  MessageLog,
  sequelize
};

// 統一初始化所有模型關聯
Object.values(db).forEach((model: any) => {
  try {
    if (model.associate && typeof model.associate === 'function') {
      model.associate(db);
      console.log(`✅ ${model.name} 關聯初始化成功`);
    }
  } catch (error) {
    console.error(`❌ ${model.name} 關聯初始化失敗:`, error);
  }
});

export { Member, Event, Checkin, Registration, Payment, MessageLog };
export default db;
