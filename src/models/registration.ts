
import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

interface RegistrationAttributes {
  id?: string;
  event_id: string;
  member_id: string;
  registration_date: Date;
  status: string;
  created_at?: Date;
}

type RegistrationCreationAttributes = Optional<RegistrationAttributes, 'id' | 'created_at' | 'registration_date' | 'status'>;

class Registration extends Model<RegistrationAttributes, RegistrationCreationAttributes> implements RegistrationAttributes {
  public id?: string;
  public event_id!: string;
  public member_id!: string;
  public registration_date!: Date;
  public status!: string;
  public created_at?: Date;

  // 定義 associate 靜態方法類型
  static associate: (models: any) => void;
}

Registration.init({
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
  registration_date: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  status: {
    type: DataTypes.STRING,
    defaultValue: 'confirmed'
  },
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  sequelize,
  tableName: 'registrations',
  timestamps: false
});

export default Registration;

Registration.associate = (models: any) => {
  Registration.belongsTo(models.Member, { 
    foreignKey: 'member_id',
    as: 'member',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE'
  });
  Registration.belongsTo(models.Event, { 
    foreignKey: 'event_id',
    as: 'event',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE'
  });
};
