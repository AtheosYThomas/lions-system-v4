
import {
  Model,
  DataTypes,
  Optional,
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
  ForeignKey,
} from 'sequelize';
import sequelize from '../config/database';

export interface AnnouncementAttributes extends InferAttributes<Announcement> {
  id: string;
  title: string;
  content: string;
  related_event_id: string | null;
  created_by: string | null;
  audience: 'all' | 'officers' | 'members';
  category: 'event' | 'system' | 'personnel';
  status: 'draft' | 'scheduled' | 'published';
  scheduled_at: Date | null;
  published_at?: Date | null;
  is_visible: boolean;
  created_at: Date;
  updated_at: Date;
}

export class Announcement extends Model<
  InferAttributes<Announcement>,
  InferCreationAttributes<Announcement>
> implements AnnouncementAttributes {
  declare id: CreationOptional<string>;
  declare title: string;
  declare content: string;
  declare related_event_id: ForeignKey<string> | null;
  declare created_by: ForeignKey<string> | null;
  declare audience: 'all' | 'officers' | 'members';
  declare category: 'event' | 'system' | 'personnel';
  declare status: 'draft' | 'scheduled' | 'published';
  declare scheduled_at: Date | null;
  declare published_at: Date | null;
  declare is_visible: boolean;
  declare created_at: CreationOptional<Date>;
  declare updated_at: CreationOptional<Date>;
}

Announcement.init(
  {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },
    title: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    related_event_id: {
      type: DataTypes.UUID,
      allowNull: true,
    },
    created_by: {
      type: DataTypes.UUID,
      allowNull: true,
    },
    audience: {
      type: DataTypes.ENUM('all', 'officers', 'members'),
      allowNull: false,
      defaultValue: 'all',
    },
    category: {
      type: DataTypes.ENUM('event', 'system', 'personnel'),
      allowNull: false,
      defaultValue: 'event',
    },
    status: {
      type: DataTypes.ENUM('draft', 'scheduled', 'published'),
      allowNull: false,
      defaultValue: 'draft',
    },
    scheduled_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    published_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    is_visible: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    updated_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    tableName: 'announcements',
    modelName: 'Announcement',
    timestamps: false,
    underscored: true,
  }
);

export default Announcement;
