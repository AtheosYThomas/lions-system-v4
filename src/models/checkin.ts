
import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database';

const Checkin = sequelize.define('Checkin', {
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
  checkin_time: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  device_info: DataTypes.STRING
}, {
  tableName: 'checkins'
});

export default Checkin;
