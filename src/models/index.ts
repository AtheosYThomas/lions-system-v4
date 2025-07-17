import Event from './event';
import Member from './member';
import Registration from './registration';
import Payment from './payment';
import MessageLog from './messageLog';
import LiffSession from './liffSession';
import Checkin from './checkin';
import Announcement from './announcement';
import sequelize from '../config/database';

// 定義關聯
Event.hasMany(Registration, { foreignKey: 'event_id', as: 'registrations' });
Registration.belongsTo(Event, { foreignKey: 'event_id', as: 'event' });

Member.hasMany(Registration, { foreignKey: 'member_id', as: 'registrations' });
Registration.belongsTo(Member, { foreignKey: 'member_id', as: 'member' });

Member.hasMany(Checkin, { foreignKey: 'member_id', as: 'checkins' });
Checkin.belongsTo(Member, { foreignKey: 'member_id', as: 'member' });

Event.hasMany(Checkin, { foreignKey: 'event_id', as: 'checkins' });
Checkin.belongsTo(Event, { foreignKey: 'event_id', as: 'event' });

// Payment 關聯
Member.hasMany(Payment, { foreignKey: 'member_id', as: 'payments' });
Payment.belongsTo(Member, { foreignKey: 'member_id', as: 'member' });

Event.hasMany(Payment, { foreignKey: 'event_id', as: 'payments' });
Payment.belongsTo(Event, { foreignKey: 'event_id', as: 'event' });

// MessageLog 關聯 (使用 user_id 字段)
Member.hasMany(MessageLog, { foreignKey: 'user_id', sourceKey: 'line_uid', as: 'messageLogs' });
MessageLog.belongsTo(Member, { foreignKey: 'user_id', targetKey: 'line_uid', as: 'member' });

// Announcement 關聯
Member.hasMany(Announcement, { foreignKey: 'created_by', as: 'announcements' });
Announcement.belongsTo(Member, { foreignKey: 'created_by', as: 'creator' });

Event.hasMany(Announcement, { foreignKey: 'related_event_id', as: 'announcements' });
Announcement.belongsTo(Event, { foreignKey: 'related_event_id', as: 'relatedEvent' });

export { sequelize, Member, Event, Registration, Checkin, Payment, MessageLog, LiffSession, Announcement };