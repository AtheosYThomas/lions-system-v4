
import { Member } from '../src/models/member';
import { Event } from '../src/models/event';
import { Registration } from '../src/models/registration';
import { Checkin } from '../src/models/checkin';

export class TestUtils {
  /**
   * 生成測試用 LINE User ID
   */
  static generateTestLineUserId(): string {
    return `U_test_${Date.now()}_${Math.random().toString(36).substring(7)}`;
  }

  /**
   * 生成測試用會員資料
   */
  static generateTestMemberData(lineUserId?: string) {
    const timestamp = Date.now();
    return {
      name: `測試會員_${timestamp}`,
      email: `test_${timestamp}@peida.net`,
      mobile: '0912345678',
      birthday: '1990-01-01',
      job_title: '軟體工程師',
      address: '台北市信義區',
      line_user_id: lineUserId || this.generateTestLineUserId(),
      status: 'active',
      role: 'member'
    };
  }

  /**
   * 生成測試用活動資料
   */
  static generateTestEventData(createdBy: string) {
    const timestamp = Date.now();
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 30);

    return {
      title: `測試活動_${timestamp}`,
      description: '系統測試專用活動',
      location: '線上會議',
      event_date: futureDate.toISOString().split('T')[0],
      event_time: '19:00',
      max_attendees: 50,
      registration_deadline: futureDate.toISOString().split('T')[0],
      created_by: createdBy,
      status: 'pending'
    };
  }

  /**
   * 清理測試資料
   */
  static async cleanupTestData(lineUserId?: string) {
    try {
      if (lineUserId) {
        // 找到測試會員
        const member = await Member.findOne({ where: { line_user_id: lineUserId } });
        
        if (member) {
          // 清理相關的簽到記錄
          await Checkin.destroy({ where: { member_id: member.id } });
          
          // 清理相關的報名記錄
          await Registration.destroy({ where: { member_id: member.id } });
          
          // 清理測試活動
          await Event.destroy({ where: { created_by: member.id } });
          
          // 清理測試會員
          await Member.destroy({ where: { id: member.id } });
        }
      }
      
      // 清理所有測試資料（名稱包含測試）
      await Member.destroy({ where: { name: { [require('sequelize').Op.like]: '%測試%' } } });
      await Event.destroy({ where: { title: { [require('sequelize').Op.like]: '%測試%' } } });
      
    } catch (error) {
      console.error('清理測試資料失敗:', error);
    }
  }

  /**
   * 等待指定時間
   */
  static async wait(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * 驗證 LINE User ID 格式
   */
  static validateLineUserId(lineUserId: string): boolean {
    return /^U[a-f0-9]{32}$|^U_test_/.test(lineUserId);
  }

  /**
   * 驗證 QR Code URL 格式
   */
  static validateQRCodeUrl(url: string): boolean {
    return /^https?:\/\/.+/.test(url);
  }
}
