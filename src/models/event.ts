
import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';

interface EventAttributes {
  id: string;
  title: string;
  description?: string;
  date: Date;
  location?: string;
  max_attendees?: number;
  status: string;
  created_at: Date;
}

class Event extends Model<EventAttributes> implements EventAttributes {
  public id!: string;
  public title!: string;
  public description?: string;
  public date!: Date;
  public location?: string;
  public max_attendees?: number;
  public status!: string;
  public created_at!: Date;
}

Event.init({
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
  date: {
    type: DataTypes.DATE,
    allowNull: false
  },
  location: DataTypes.STRING,
  max_attendees: DataTypes.INTEGER,
  status: {
    type: DataTypes.STRING,
    defaultValue: 'active'
  },
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  sequelize,
  tableName: 'events',
  timestamps: false
});

static associate(models: any) {
  Event.hasMany(models.Registration, { 
    foreignKey: 'event_id',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
    hooks: true
  });
  Event.hasMany(models.Checkin, { 
    foreignKey: 'event_id',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
    hooks: true
  });
  Event.hasMany(models.Payment, { 
    foreignKey: 'event_id',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
    hooks: true
  });
}

export default Event;
