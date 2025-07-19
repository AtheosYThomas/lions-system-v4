
import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../config/database';
import Member from './member';
import Event from './event';

export interface PushRecordAttributes {
  id: string;
  member_id: string;
  event_id: string;
  message_type: string;
  status: string;
  pushed_at: Date;
}

export interface PushRecordCreationAttributes extends Omit<PushRecordAttributes, 'id' | 'pushed_at'> {}

class PushRecord extends Model<PushRecordAttributes, PushRecordCreationAttributes> 
  implements PushRecordAttributes {
  public id!: string;
  public member_id!: string;
  public event_id!: string;
  public message_type!: string;
  public status!: string;
  public pushed_at!: Date;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

PushRecord.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    member_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'members',
        key: 'id',
      },
    },
    event_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'events',
        key: 'id',
      },
    },
    message_type: {
      type: DataTypes.STRING,
      allowNull: false,
      comment: 'checkin_reminder, manual_push, event_notification',
    },
    status: {
      type: DataTypes.ENUM('success', 'failed'),
      allowNull: false,
    },
    pushed_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    modelName: 'PushRecord',
    tableName: 'push_records',
    timestamps: true,
  }
);

// 建立關聯
PushRecord.belongsTo(Member, { foreignKey: 'member_id', as: 'member' });
PushRecord.belongsTo(Event, { foreignKey: 'event_id', as: 'event' });

Member.hasMany(PushRecord, { foreignKey: 'member_id', as: 'pushRecords' });
Event.hasMany(PushRecord, { foreignKey: 'event_id', as: 'pushRecords' });

export default PushRecord;
