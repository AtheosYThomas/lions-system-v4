import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

export interface LiffSessionAttributes {
  id: string;
  line_user_id: string;
  display_name?: string;
  picture_url?: string;
  event_id?: string;
  status: string;
  last_seen_at: Date;
  created_at: Date;
}

export type LiffSessionCreationAttributes = Optional<
  LiffSessionAttributes,
  'id' | 'created_at'
>;

export class LiffSession
  extends Model<LiffSessionAttributes, LiffSessionCreationAttributes>
  implements LiffSessionAttributes
{
  public id!: string;
  public line_user_id!: string;
  public display_name?: string;
  public picture_url?: string;
  public event_id?: string;
  public status!: string;
  public last_seen_at!: Date;
  public created_at!: Date;
}

LiffSession.init(
  {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },
    line_user_id: {
      type: DataTypes.STRING,
      allowNull: false,
      field: 'line_user_id',
    },
    display_name: {
      type: DataTypes.STRING,
    },
    picture_url: {
      type: DataTypes.STRING,
    },
    event_id: {
      type: DataTypes.UUID,
    },
    status: {
      type: DataTypes.STRING,
      defaultValue: 'pending',
    },
    last_seen_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    tableName: 'liff_sessions',
    timestamps: false,
  }
);

export default LiffSession;
