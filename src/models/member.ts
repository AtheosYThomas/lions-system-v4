
import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database';

const Member = sequelize.define('Member', {
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
  tableName: 'members',
  timestamps: false
});

export default Member;
