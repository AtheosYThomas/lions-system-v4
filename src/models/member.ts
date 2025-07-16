
import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../config/database';

interface MemberAttributes {
  id: string;
  name: string;
  email: string;
  lineUserId?: string;
  status: string;
  created_at: Date;
}

class Member extends Model<MemberAttributes> implements MemberAttributes {
  public id!: string;
  public name!: string;
  public email!: string;
  public lineUserId?: string;
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
  lineUserId: {
    type: DataTypes.STRING,
    field: 'line_user_id'
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

export default Member;
