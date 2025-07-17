
import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

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

type MemberCreationAttributes = Optional<MemberAttributes, 'id' | 'created_at' | 'role'>;

class Member extends Model<MemberAttributes, MemberCreationAttributes> implements MemberAttributes {
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

static associate(models: any) {
  Member.hasMany(models.Registration, { 
    foreignKey: 'member_id',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
    hooks: true
  });
  Member.hasMany(models.Checkin, { 
    foreignKey: 'member_id',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
    hooks: true
  });
  Member.hasMany(models.Payment, { 
    foreignKey: 'member_id',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
    hooks: true
  });
}

export default Member;
