
import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../config/database';

interface CheckinAttributes {
  id: string;
  member_id: string;
  event_id: string;
  checkin_time: Date;
  created_at: Date;
}

class Checkin extends Model<CheckinAttributes> implements CheckinAttributes {
  public id!: string;
  public member_id!: string;
  public event_id!: string;
  public checkin_time!: Date;
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
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  sequelize,
  tableName: 'checkins',
  timestamps: false
});

export default Checkin;
