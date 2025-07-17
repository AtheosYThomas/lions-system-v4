
import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

interface PaymentAttributes {
  id?: string;
  member_id: string;
  event_id?: string;
  amount: number;
  method: string;
  status: string;
  receipt_url?: string;
  created_at?: Date;
}

type PaymentCreationAttributes = Optional<PaymentAttributes, 'id' | 'created_at' | 'event_id' | 'receipt_url' | 'status'>;

class Payment extends Model<PaymentAttributes, PaymentCreationAttributes> implements PaymentAttributes {
  public id?: string;
  public member_id!: string;
  public event_id?: string;
  public amount!: number;
  public method!: string;
  public status!: string;
  public receipt_url?: string;
  public created_at?: Date;
}

Payment.init({
  id: { 
    type: DataTypes.UUID, 
    primaryKey: true,
    defaultValue: DataTypes.UUIDV4
  },
  member_id: {
    type: DataTypes.UUID,
    allowNull: false
  },
  event_id: DataTypes.UUID,
  amount: DataTypes.INTEGER,
  method: DataTypes.STRING,
  status: {
    type: DataTypes.STRING,
    defaultValue: 'pending'
  },
  receipt_url: DataTypes.STRING,
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  sequelize,
  tableName: 'payments',
  timestamps: false
});

export default Payment;

Payment.associate = (models: any) => {
  Payment.belongsTo(models.Member, { 
    foreignKey: 'member_id',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
    hooks: true
  });
  Payment.belongsTo(models.Event, { 
    foreignKey: 'event_id',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
    hooks: true
  });
};
