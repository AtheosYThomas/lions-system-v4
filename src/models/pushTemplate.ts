
import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

interface PushTemplateAttributes {
  id: string;
  name: string;
  description?: string;
  json: any;
  created_at: Date;
  updated_at: Date;
}

interface PushTemplateCreationAttributes extends Optional<PushTemplateAttributes, 'id' | 'created_at' | 'updated_at'> {}

class PushTemplate extends Model<PushTemplateAttributes, PushTemplateCreationAttributes> implements PushTemplateAttributes {
  public id!: string;
  public name!: string;
  public description?: string;
  public json!: any;
  public created_at!: Date;
  public updated_at!: Date;
}

PushTemplate.init(
  {
    id: {
      type: DataTypes.STRING,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    json: {
      type: DataTypes.JSONB,
      allowNull: false
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    },
    updated_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    }
  },
  {
    sequelize,
    tableName: 'push_templates',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  }
);

export default PushTemplate;
