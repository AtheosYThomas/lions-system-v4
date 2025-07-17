
import { DataTypes } from 'sequelize';
import sequelize from '../config/database';

const MessageLog = sequelize.define('MessageLog', {
  id: { 
    type: DataTypes.UUID, 
    primaryKey: true,
    defaultValue: DataTypes.UUIDV4
  },
  user_id: {
    type: DataTypes.STRING,
    allowNull: false,
    references: {
      model: 'members',
      key: 'line_user_id'  // 對應資料庫中的實際欄位名稱
    },
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE'
  },
  timestamp: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  message_type: DataTypes.STRING,
  message_content: DataTypes.TEXT,
  intent: DataTypes.STRING,
  action_taken: DataTypes.STRING,
  event_id: DataTypes.UUID
}, {
  tableName: 'message_logs',
  timestamps: false
});

export default MessageLog;
