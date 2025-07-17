
import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

export interface MemberAttributes {
  id: string;
  name: string;
  email: string;
  line_uid?: string;
  role?: string;
  phone?: string;
  english_name?: string;
  birthday: string;
  job_title: string;
  fax?: string;
  address: string;
  mobile: string;
  status: string;
  created_at: Date;
}

export type MemberCreationAttributes = Optional<MemberAttributes, 'id' | 'created_at'>;

export class Member extends Model<MemberAttributes, MemberCreationAttributes> implements MemberAttributes {
  public id!: string;
  public name!: string;
  public email!: string;
  public line_uid?: string;
  public role?: string;
  public phone?: string;
  public english_name?: string;
  public birthday!: string;
  public job_title!: string;
  public fax?: string;
  public address!: string;
  public mobile!: string;
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
    field: 'line_user_id',
    unique: true
  },
  role: {
    type: DataTypes.STRING,
    defaultValue: 'member'
  },
  phone: {
    type: DataTypes.STRING
  },
  english_name: {
    type: DataTypes.STRING,
  },
  birthday: {
    type: DataTypes.DATEONLY,
    allowNull: false,
  },
  job_title: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  mobile: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  fax: {
    type: DataTypes.STRING,
  },
  address: {
    type: DataTypes.TEXT,
    allowNull: false,
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
