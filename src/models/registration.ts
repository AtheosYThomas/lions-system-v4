
import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database';

export const Registration = sequelize.define('registration', {
  id: { type: DataTypes.UUID, primaryKey: true },
  event_id: DataTypes.UUID,
  member_id: DataTypes.UUID,
  num_attendees: DataTypes.INTEGER,
  notes: DataTypes.STRING,
  created_at: DataTypes.DATE
});
