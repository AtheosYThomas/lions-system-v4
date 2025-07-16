
import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database';

export const Member = sequelize.define('member', {
  id: { type: DataTypes.UUID, primaryKey: true },
  name: DataTypes.STRING,
  phone: DataTypes.STRING,
  email: DataTypes.STRING,
  line_uid: { type: DataTypes.STRING, unique: true },
  role: DataTypes.STRING,
  status: DataTypes.STRING,
  created_at: DataTypes.DATE
});
