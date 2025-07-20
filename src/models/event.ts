import { Model, DataTypes, Optional } from 'sequelize';
import sequelize from '../config/database';

export interface IEventModel {
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

// IEventModel 是全部欄位，EventCreationAttributes 是可省略 id 與 timestamps
export type EventCreationAttributes = Optional<
  IEventModel,
  'id' | 'created_at' | 'updated_at'
>;

class Event
  extends Model<IEventModel, EventCreationAttributes>
  implements IEventModel
{
  public id!: string;
  public title!: string;
  public description?: string;
  public date!: Date;
  public location?: string;
  public max_attendees?: number | null;
  public status!: string;
  public created_at!: Date;
  public updated_at?: Date;

  public getPublicData(): IEventModel {
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
  }
}

Event.init(
  {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: DataTypes.TEXT,
    date: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    location: DataTypes.STRING,
    max_attendees: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    status: {
      type: DataTypes.STRING,
      defaultValue: 'active',
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      field: 'created_at',
    },
    updated_at: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'updated_at',
    },
  },
  {
    sequelize,
    tableName: 'events',
    modelName: 'Event',
    timestamps: true,
    underscored: true, // 使用 snake_case 命名慣例
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  }
);

export default Event;
export { Event };
