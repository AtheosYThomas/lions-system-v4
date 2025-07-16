
import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database';

export const Checkin = sequelize.define('checkin', {
  id: { type: DataTypes.UUID, primaryKey: true },
  event_id: DataTypes.UUID,
  member_id: DataTypes.UUID,
  checkin_time: DataTypes.DATE,
  device_info: DataTypes.STRING
});
