
import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';

interface EventAttributes {
  id: string;
  title: string;
  description?: string;
  date: Date;
  location?: string;
  max_attendees?: number | null;
  status: string;
  created_at: Date;
  updated_at?: Date;
}

class Event extends Model<EventAttributes> implements EventAttributes {
  public id!: string;
  public title!: string;
  public description?: string;
  public date!: Date;
  public location?: string;
  public max_attendees?: number | null;
  public status!: string;
  public created_at!: Date;
  public updated_at?: Date;
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
  max_attendees: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  status: {
    type: DataTypes.STRING,
    defaultValue: 'active'
  },
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  updated_at: {
    type: DataTypes.DATE,
    allowNull: true
  }
}, {
  sequelize,
  tableName: 'events',
  timestamps: false
});

// 關聯設定將在 src/models/index.ts 中統一處理

// Add getPublicData method to Event prototype
Event.prototype.getPublicData = function (): any {
  return {
    id: this.id,
    title: this.title,
    description: this.description,
    date: this.date,
    location: this.location,
    max_attendees: this.max_attendees,
    status: this.status,
    created_at: this.created_at,
    updated_at: this.updated_at,
  };
};

export default Event;
export { Event };
