
import Member from './member';
import Event from './event';
import Checkin from './checkin';
import Registration from './registration';

// 統一設定所有模型關聯，避免循環依賴
Member.hasMany(Checkin, { foreignKey: 'member_id' });
Member.hasMany(Registration, { foreignKey: 'member_id' });

Event.hasMany(Checkin, { foreignKey: 'event_id' });
Event.hasMany(Registration, { foreignKey: 'event_id' });

Checkin.belongsTo(Member, { foreignKey: 'member_id' });
Checkin.belongsTo(Event, { foreignKey: 'event_id' });

Registration.belongsTo(Member, { foreignKey: 'member_id' });
Registration.belongsTo(Event, { foreignKey: 'event_id' });

export { Member, Event, Checkin, Registration };
