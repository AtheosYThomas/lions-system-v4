
import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

interface MessageLogAttributes {
  id?: string;
  user_id: string;
  timestamp?: Date;
  message_type?: string;
  message_content?: string;
  intent?: string;
  action_taken?: string;
  event_id?: string;
}

type MessageLogCreationAttributes = Optional<MessageLogAttributes, 'id' | 'timestamp' | 'message_type' | 'message_content' | 'intent' | 'action_taken' | 'event_id'>;

class MessageLog extends Model<MessageLogAttributes, MessageLogCreationAttributes> implements MessageLogAttributes {
  public id?: string;
  public user_id!: string;
  public timestamp?: Date;
  public message_type?: string;
  public message_content?: string;
  public intent?: string;
  public action_taken?: string;
  public event_id?: string;
}

MessageLog.init({
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
  sequelize,
  tableName: 'message_logs',
  timestamps: false
});

export default MessageLog;

MessageLog.associate = (models: any) => {
  MessageLog.belongsTo(models.Member, { 
    foreignKey: 'user_id', 
    targetKey: 'line_uid',
    constraints: false,
    onDelete: 'SET NULL',
    onUpdate: 'CASCADE'
  });
  MessageLog.belongsTo(models.Event, { 
    foreignKey: 'event_id',
    onDelete: 'SET NULL',
    onUpdate: 'CASCADE'
  });
};
