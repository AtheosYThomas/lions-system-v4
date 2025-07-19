import { Request, Response } from 'express';
import Member from '../models/member';
import Event from '../models/event';
import { Registration } from '../models/registration';
import memberService from '../services/memberService';
import registrationService from '../services/registrationService';

interface RegisterRequest extends Request {
  body: {
    name: string;
    email: string;
    phone?: string;
    english_name?: string;
    birthday: string;
    job_title: string;
    fax?: string;
    address: string;
    mobile: string;
    line_uid: string;
  };
}

class RegistrationController {
  /**
   * 處理活動報名
   */
  async registerForEvent(req: Request, res: Response) {
    try {
      const {
        event_id,
        line_user_id,
        num_attendees = 1,
        notes
      } = req.body;

      // 驗證必要欄位
      if (!event_id || !line_user_id) {
        return res.status(400).json({
          success: false,
          error: '活動 ID 和 LINE 用戶 ID 是必要欄位'
        });
      }

      // 根據 line_user_id 查找會員
      const member = await Member.findOne({
        where: { line_user_id }
      });

      if (!member) {
        return res.status(404).json({
          success: false,
          error: '會員不存在，請先註冊'
        });
      }

      // 檢查活動是否存在
      const event = await Event.findByPk(event_id);
      if (!event) {
        return res.status(404).json({
          success: false,
          error: '活動不存在'
        });
      }

      // 檢查是否已經報名
      const existingRegistration = await Registration.findOne({
        where: {
          event_id,
          member_id: member.id
        }
      });

      if (existingRegistration) {
        return res.status(400).json({
          success: false,
          error: '您已經報名過此活動了',
          registration: existingRegistration
        });
      }

      // 創建報名記錄
      const registration = await Registration.create({
        event_id,
        member_id: member.id,
        registration_date: new Date(),
        status: 'confirmed'
      });

      console.log('✅ 活動報名成功:', {
        registrationId: registration.id,
        eventId: event_id,
        memberId: member.id,
        memberName: member.name
      });

      res.json({
        success: true,
        message: '報名成功！',
        id: registration.id,
        event_id,
        member_id: member.id,
        num_attendees,
        notes,
        registration_date: registration.registration_date,
        status: registration.status
      });

    } catch (error) {
      console.error('❌ 活動報名失敗:', error);

      if (error instanceof Error) {
        res.status(400).json({
          success: false,
          error: error.message
        });
      } else {
        res.status(500).json({
          success: false,
          error: '報名過程中發生未知錯誤'
        });
      }
    }
  }

  /**
   * 處理會員註冊
   */
  async registerMember(req: RegisterRequest, res: Response) {
    try {
      const {
        name,
        email,
        phone,
        english_name,
        birthday,
        job_title,
        fax,
        address,
        mobile,
        line_uid: lineUserId
      } = req.body;

      // 驗證必要欄位
      if (!name || !email || !birthday || !job_title || !address || !mobile || !lineUserId) {
        return res.status(400).json({
          success: false,
          error: '請填寫所有必要欄位'
        });
      }

      // 檢查 LINE UID 是否已經註冊
      const existingMember = await Member.findOne({
        where: { line_user_id: lineUserId }
      });

      if (existingMember) {
        return res.status(400).json({
          success: false,
          error: '此 LINE 帳號已經註冊過了'
        });
      }

      // 創建新會員
      const member = await memberService.createMember({
        name,
        email,
        phone,
        english_name,
        birthday,
        job_title,
        fax,
        address,
        mobile,
        line_user_id: lineUserId,
        role: 'member',
        status: 'active'
      });

      console.log('✅ 新會員註冊成功:', member.id);

      res.json({
        success: true,
        message: '註冊成功！歡迎加入北大獅子會',
        member: {
          id: member.id,
          name: member.name,
          email: member.email,
          status: member.status
        }
      });

    } catch (error) {
      console.error('❌ 會員註冊失敗:', error);

      if (error instanceof Error) {
        res.status(400).json({
          success: false,
          error: error.message
        });
      } else {
        res.status(500).json({
          success: false,
          error: '註冊過程中發生未知錯誤'
        });
      }
    }
  }

  /**
   * 檢查會員註冊狀態
   */
  async checkRegistrationStatus(req: Request, res: Response) {
    try {
      const { line_uid: lineUserId } = req.params;

      if (!lineUserId) {
        return res.status(400).json({
          success: false,
          error: 'LINE UID 是必要參數'
        });
      }

      const member = await Member.findOne({
        where: { line_user_id: lineUserId }
      });

      if (member) {
        res.json({
          success: true,
          isRegistered: true,
          member: {
            id: member.id,
            name: member.name,
            email: member.email,
            status: member.status
          }
        });
      } else {
        res.json({
          success: true,
          isRegistered: false,
          message: '尚未註冊'
        });
      }

    } catch (error) {
      console.error('❌ 檢查註冊狀態失敗:', error);
      res.status(500).json({
        success: false,
        error: '檢查註冊狀態時發生錯誤'
      });
    }
  }
}

export default new RegistrationController();