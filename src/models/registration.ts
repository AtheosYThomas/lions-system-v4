
import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

export interface RegistrationAttributes {
  id: string;
  event_id: string;
  member_id: string;
  registration_date: Date;
  status: string;
  created_at: Date;
}

export type RegistrationCreationAttributes = Optional<RegistrationAttributes, 'id' | 'registration_date' | 'created_at'>;

export class Registration extends Model<RegistrationAttributes, RegistrationCreationAttributes> implements RegistrationAttributes {
  public id!: string;
  public event_id!: string;
  public member_id!: string;
  public registration_date!: Date;
  public status!: string;
  public created_at!: Date;
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
