
import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database';

const Registration = sequelize.define('Registration', {
  id: { 
    type: DataTypes.UUID, 
    primaryKey: true,
    defaultValue: DataTypes.UUIDV4
  },
  event_id: {
    type: DataTypes.UUID,
    allowNull: false
  },
  member_id: {
    type: DataTypes.UUID,
    allowNull: false
  },
  num_attendees: DataTypes.INTEGER,
  notes: DataTypes.STRING,
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'registrations'
});

export default Registration;
