
import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database';

const Event = sequelize.define('Event', {
  id: { 
    type: DataTypes.UUID, 
    primaryKey: true,
    defaultValue: DataTypes.UUIDV4
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false
  },
  description: DataTypes.TEXT,
  date: DataTypes.DATEONLY,
  location: DataTypes.STRING,
  status: DataTypes.STRING,
  created_by: DataTypes.UUID,
  approved_by: DataTypes.UUID,
  approved_at: DataTypes.DATE,
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'events'
});

export default Event;
