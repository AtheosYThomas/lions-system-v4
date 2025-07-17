
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
    allowNull: false
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

MessageLog.associate = (models: any) => {
  MessageLog.belongsTo(models.Member, { foreignKey: 'user_id', targetKey: 'line_uid' });
  MessageLog.belongsTo(models.Event, { foreignKey: 'event_id' });
};

export default MessageLog;
