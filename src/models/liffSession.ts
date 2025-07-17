
import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';

interface LiffSessionAttributes {
  id: string;
  line_uid: string;
  display_name?: string;
  picture_url?: string;
  event_id?: string;
  status: string;
  last_seen_at: Date;
  created_at: Date;
}

class LiffSession extends Model<LiffSessionAttributes> implements LiffSessionAttributes {
  public id!: string;
  public line_uid!: string;
  public display_name?: string;
  public picture_url?: string;
  public event_id?: string;
  public status!: string;
  public last_seen_at!: Date;
  public created_at!: Date;
}

LiffSession.init({
  id: { 
    type: DataTypes.UUID, 
    primaryKey: true,
    defaultValue: DataTypes.UUIDV4
  },
  line_uid: {
    type: DataTypes.STRING,
    allowNull: false,
    field: 'line_uid'
  },
  display_name: {
    type: DataTypes.STRING
  },
  picture_url: {
    type: DataTypes.STRING
  },
  event_id: {
    type: DataTypes.UUID
  },
  status: {
    type: DataTypes.STRING,
    defaultValue: 'pending'
  },
  last_seen_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  sequelize,
  tableName: 'liff_sessions',
  timestamps: false
});

export default LiffSession;
