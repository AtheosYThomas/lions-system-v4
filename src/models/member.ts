
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
  phone: DataTypes.STRING,
  email: DataTypes.STRING,
  line_uid: { 
    type: DataTypes.STRING, 
    unique: true 
  },
  role: DataTypes.STRING,
  status: DataTypes.STRING,
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'members'
});

export default Member;
