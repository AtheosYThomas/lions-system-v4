
import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database';

export const Payment = sequelize.define('payment', {
  id: { type: DataTypes.UUID, primaryKey: true },
  member_id: DataTypes.UUID,
  event_id: DataTypes.UUID,
  amount: DataTypes.INTEGER,
  method: DataTypes.STRING,
  status: DataTypes.STRING,
  receipt_url: DataTypes.STRING,
  created_at: DataTypes.DATE
});
