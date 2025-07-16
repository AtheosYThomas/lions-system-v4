
import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database';

const Member = sequelize.define('Member', {
  id: { 
    type: DataTypes.UUID, 
    primaryKey: true,
    defaultValue: DataTypes.UUIDV4
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  phone: DataTypes.STRING,
  email: DataTypes.STRING,
  line_uid: { 
    type: DataTypes.STRING, 
    unique: true 
  },
  role: DataTypes.STRING,
  status: DataTypes.STRING,
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'members'
});

export default Member;
// 簡單的 Member 模型 - 實際應用中應該使用 Sequelize 或其他 ORM
export default class Member {
  constructor(
    public id: string,
    public name: string,
    public email: string,
    public lineUserId?: string
  ) {}

  static async findAll(): Promise<Member[]> {
    // 這裡應該從資料庫查詢，目前返回模擬資料
    return [
      new Member('1', '測試會員1', 'test1@example.com', 'U1234567890'),
      new Member('2', '測試會員2', 'test2@example.com', 'U0987654321')
    ];
  }

  static async findById(id: string): Promise<Member | null> {
    const members = await this.findAll();
    return members.find(member => member.id === id) || null;
  }
}
