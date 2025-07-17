
import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';

interface CheckinAttributes {
  id: string;
  member_id: string;
  event_id: string;
  checkin_time: Date;
  device_info?: string;
  created_at: Date;
}

interface CheckinCreationAttributes {
  member_id: string;
  event_id: string;
  checkin_time?: Date;
  device_info?: string;
}

class Checkin extends Model<CheckinAttributes, CheckinCreationAttributes> implements CheckinAttributes {
  public id!: string;
  public member_id!: string;
  public event_id!: string;
  public checkin_time!: Date;
  public device_info?: string;
  public created_at!: Date;
}

Checkin.init({
  id: { 
    type: DataTypes.UUID, 
    primaryKey: true,
    defaultValue: DataTypes.UUIDV4
  },
  member_id: {
    type: DataTypes.UUID,
    allowNull: false
  },
  event_id: {
    type: DataTypes.UUID,
    allowNull: false
  },
  checkin_time: {
    type: DataTypes.DATE,
    allowNull: false
  },
  device_info: {
    type: DataTypes.STRING,
    allowNull: true
  },
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  sequelize,
  tableName: 'checkins',
  timestamps: false
});

// 關聯設定將在 src/models/index.ts 中統一處理

export default Checkin;
