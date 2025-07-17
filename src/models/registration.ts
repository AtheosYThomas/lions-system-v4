
import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';

interface RegistrationAttributes {
  id: string;
  event_id: string;
  member_id: string;
  registration_date: Date;
  status: string;
  created_at: Date;
}

class Registration extends Model<RegistrationAttributes> implements RegistrationAttributes {
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

Registration.associate = (models: any) => {
  Registration.belongsTo(models.Member, { 
    foreignKey: 'member_id',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
    hooks: true
  });
  Registration.belongsTo(models.Event, { 
    foreignKey: 'event_id',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
    hooks: true
  });
};

export default Registration;
