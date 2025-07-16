// 簡單的 Member 模型 - 暫時使用類別實作，待後續整合 Sequelize
class Member {
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

// 模擬的會員資料
const members = [
  {
    id: '1',
    name: '測試會員1',
    phone: '0912345678',
    email: 'test1@example.com',
    line_uid: 'U1234567890',
    status: 'active'
  },
  {
    id: '2',
    name: '測試會員2',
    phone: '0987654321',
    email: 'test2@example.com',
    line_uid: 'U0987654321',
    status: 'inactive'
  }
];

// 模擬的會員資料
  static async findAll() {
    try {
      return members.map(member => ({
        id: member.id,
        name: member.name,
        phone: member.phone,
        email: member.email,
        line_uid: member.line_uid,
        status: member.status
      }));
    } catch (error) {
      console.error('❌ Member.findAll 錯誤:', error);
      return [];
    }
  }

  static async findById(id: string) {
    try {
      return members.find(member => member.id === id) || null;
    } catch (error) {
      console.error('❌ Member.findById 錯誤:', error);
      return null;
    }
  }

export default Member;