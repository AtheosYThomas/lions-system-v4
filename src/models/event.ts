
import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database';

export const Event = sequelize.define('event', {
  id: { type: DataTypes.UUID, primaryKey: true },
  title: DataTypes.STRING,
  description: DataTypes.TEXT,
  date: DataTypes.DATEONLY,
  location: DataTypes.STRING,
  status: DataTypes.STRING,
  created_by: DataTypes.UUID,
  approved_by: DataTypes.UUID,
  approved_at: DataTypes.DATE,
  created_at: DataTypes.DATE
});
