import Event from './event';
import Member from './member';
import Registration from './registration';
import Payment from './payment';
import MessageLog from './messageLog';
import LiffSession from './liffSession';
import Checkin from './checkin';
import Announcement from './announcement';
import File from './file';
import PushRecord from './pushRecord';
import sequelize from '../config/database';

// ===================================
// Sequelize 模型關聯設定
// ===================================
// 這裡統一定義所有模型之間的關聯關係
// 使用 hasMany、belongsTo、hasOne 等方法建立關聯
// ===================================

// -----------------------------------
// Event 相關關聯 (活動)
// -----------------------------------

// Event -> Registration (一對多)
// 一個活動可以有多個報名記錄
Event.hasMany(Registration, {
  foreignKey: 'event_id',
  as: 'registrations',
  onDelete: 'CASCADE', // 刪除活動時一併刪除相關報名記錄
});

// Event -> Checkin (一對多)
// 一個活動可以有多個簽到記錄
Event.hasMany(Checkin, {
  foreignKey: 'event_id',
  as: 'checkins',
  onDelete: 'CASCADE', // 刪除活動時一併刪除相關簽到記錄
});

// Event -> Payment (一對多)
// 一個活動可以有多個付款記錄
Event.hasMany(Payment, {
  foreignKey: 'event_id',
  as: 'payments',
  onDelete: 'CASCADE', // 刪除活動時一併刪除相關付款記錄
});

// Event -> Announcement (一對多)
// 一個活動可以有多個相關公告
Event.hasMany(Announcement, {
  foreignKey: 'related_event_id',
  as: 'announcements',
  onDelete: 'SET NULL', // 刪除活動時公告的相關活動設為 NULL
});

// -----------------------------------
// Member 相關關聯 (會員)
// -----------------------------------

// Member -> Registration (一對多)
// 一個會員可以有多個報名記錄
Member.hasMany(Registration, {
  foreignKey: 'member_id',
  as: 'registrations',
  onDelete: 'CASCADE', // 刪除會員時一併刪除相關報名記錄
});

// Member -> Checkin (一對多)
// 一個會員可以有多個簽到記錄
Member.hasMany(Checkin, {
  foreignKey: 'member_id',
  as: 'checkins',
  onDelete: 'CASCADE', // 刪除會員時一併刪除相關簽到記錄
});

// Member -> Payment (一對多)
// 一個會員可以有多個付款記錄
Member.hasMany(Payment, {
  foreignKey: 'member_id',
  as: 'payments',
  onDelete: 'CASCADE', // 刪除會員時一併刪除相關付款記錄
});

// Member -> MessageLog (一對多)
// 一個會員可以有多個訊息記錄 (使用 LINE UID 關聯)
Member.hasMany(MessageLog, {
  foreignKey: 'user_id',
  sourceKey: 'line_user_id',
  as: 'messageLogs',
  onDelete: 'CASCADE',
});

// Member -> Announcement (一對多)
// 一個會員可以創建多個公告
Member.hasMany(Announcement, {
  foreignKey: 'created_by',
  as: 'createdAnnouncements',
  onDelete: 'SET NULL', // 刪除會員時公告的創建者設為 NULL
});

// -----------------------------------
// 反向關聯 (belongsTo)
// -----------------------------------

// Registration -> Event (多對一)
// 每個報名記錄屬於一個活動
Registration.belongsTo(Event, {
  foreignKey: 'event_id',
  as: 'event',
});

// Registration -> Member (多對一)
// 每個報名記錄屬於一個會員
Registration.belongsTo(Member, {
  foreignKey: 'member_id',
  as: 'member',
});

// Checkin -> Event (多對一)
// 每個簽到記錄屬於一個活動
Checkin.belongsTo(Event, {
  foreignKey: 'event_id',
  as: 'event',
});

// Checkin -> Member (多對一)
// 每個簽到記錄屬於一個會員
Checkin.belongsTo(Member, {
  foreignKey: 'member_id',
  as: 'member',
});

// Payment -> Event (多對一)
// 每個付款記錄屬於一個活動
Payment.belongsTo(Event, {
  foreignKey: 'event_id',
  as: 'event',
});

// Payment -> Member (多對一)
// 每個付款記錄屬於一個會員
Payment.belongsTo(Member, {
  foreignKey: 'member_id',
  as: 'member',
});

// MessageLog -> Member (多對一)
// 每個訊息記錄屬於一個會員 (使用 LINE UID 關聯)
MessageLog.belongsTo(Member, {
  foreignKey: 'user_id',
  targetKey: 'line_user_id',
  as: 'member',
});

// Announcement -> Member (多對一)
// 每個公告屬於一個創建者
Announcement.belongsTo(Member, {
  foreignKey: 'created_by',
  as: 'creator',
});

// Announcement -> Event (多對一)
// 每個公告可能關聯到一個活動
Announcement.belongsTo(Event, {
  foreignKey: 'related_event_id',
  as: 'relatedEvent',
});

// -----------------------------------
// File 相關關聯 (檔案)
// -----------------------------------

// File -> Member (多對一)
// 每個檔案屬於一個上傳者
File.belongsTo(Member, {
  foreignKey: 'uploaded_by',
  as: 'uploader',
});

// Member -> File (一對多)
// 一個會員可以上傳多個檔案
Member.hasMany(File, {
  foreignKey: 'uploaded_by',
  as: 'uploadedFiles',
  onDelete: 'SET NULL',
});

// Event -> File (一對多)
// 一個活動可以有多個相關檔案
Event.hasMany(File, {
  foreignKey: 'related_id',
  as: 'files',
  scope: { usage: ['event_cover'] },
  onDelete: 'CASCADE',
});

// Announcement -> File (一對多)
// 一個公告可以有多個相關檔案
Announcement.hasMany(File, {
  foreignKey: 'related_id',
  as: 'files',
  scope: { usage: ['announcement_image'] },
  onDelete: 'CASCADE',
});

// ===================================
// 匯出所有模型和資料庫連線
// ===================================
export {
  sequelize,
  Member,
  Event,
  Registration,
  Checkin,
  Payment,
  MessageLog,
  LiffSession,
  Announcement,
  File,
  PushRecord,
};

// ===================================
// 關聯關係摘要
// ===================================
/*
完整的關聯關係如下：

Event (活動):
  - hasMany Registration (報名記錄)
  - hasMany Checkin (簽到記錄)  
  - hasMany Payment (付款記錄)
  - hasMany Announcement (相關公告)

Member (會員):
  - hasMany Registration (報名記錄)
  - hasMany Checkin (簽到記錄)
  - hasMany Payment (付款記錄)
  - hasMany MessageLog (訊息記錄) - 透過 LINE UID
  - hasMany Announcement (創建的公告)

反向關聯:
  - Registration belongsTo Event & Member
  - Checkin belongsTo Event & Member
  - Payment belongsTo Event & Member
  - MessageLog belongsTo Member (透過 LINE UID)
  - Announcement belongsTo Member (創建者) & Event (相關活動)

特殊設定:
  - CASCADE: 主記錄刪除時連帶刪除相關記錄
  - SET NULL: 主記錄刪除時相關欄位設為 NULL
  - LINE UID 關聯: Member.line_uid <-> MessageLog.user_id
*/
