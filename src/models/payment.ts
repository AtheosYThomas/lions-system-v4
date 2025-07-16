
import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database';

const Payment = sequelize.define('Payment', {
  id: { 
    type: DataTypes.UUID, 
    primaryKey: true,
    defaultValue: DataTypes.UUIDV4
  },
  member_id: {
    type: DataTypes.UUID,
    allowNull: false
  },
  event_id: DataTypes.UUID,
  amount: DataTypes.INTEGER,
  method: DataTypes.STRING,
  status: {
    type: DataTypes.STRING,
    defaultValue: 'pending'
  },
  receipt_url: DataTypes.STRING,
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'payments'
});

export default Payment;
