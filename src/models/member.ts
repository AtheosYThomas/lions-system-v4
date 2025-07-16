
import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../config/database';

interface MemberAttributes {
  id: string;
  name: string;
  email: string;
  line_uid?: string;
  role?: string;
  phone?: string;
  status: string;
  created_at: Date;
}

class Member extends Model<MemberAttributes> implements MemberAttributes {
  public id!: string;
  public name!: string;
  public email!: string;
  public line_uid?: string;
  public role?: string;
  public phone?: string;
  public status!: string;
  public created_at!: Date;
}

Member.init({
  id: { 
    type: DataTypes.UUID, 
    primaryKey: true,
    defaultValue: DataTypes.UUIDV4
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  line_uid: {
    type: DataTypes.STRING,
    field: 'line_user_id'
  },
  role: {
    type: DataTypes.STRING,
    defaultValue: 'member'
  },
  phone: {
    type: DataTypes.STRING
  },
  status: {
    type: DataTypes.STRING,
    defaultValue: 'active'
  },
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  sequelize,
  tableName: 'members',
  timestamps: false
});

// 關聯設定將在 src/models/index.ts 中統一處理

export default Member;
