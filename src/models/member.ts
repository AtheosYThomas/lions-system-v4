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

export default Member;