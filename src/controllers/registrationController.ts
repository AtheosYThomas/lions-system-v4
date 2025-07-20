import { Request, Response } from 'express';
import { Member } from '../models/member';
import { Registration } from '../models/registration';
import memberService from '../services/memberService';

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
        birthday: birthday ? new Date(birthday) : null,
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
   * 活動報名
   */
  async registerForEvent(req: Request, res: Response): Promise<void> {
    try {
      const { event_id, line_user_id } = req.body;

      if (!event_id || !line_user_id) {
        res.status(400).json({
          success: false,
          message: '缺少必要參數：event_id 或 line_user_id'
        });
        return;
      }

      // 查找會員
      const member = await Member.findOne({
        where: { line_user_id }
      });

      if (!member) {
        res.status(404).json({
          success: false,
          message: '找不到對應的會員記錄'
        });
        return;
      }

      // 檢查是否已經報名
      const existingRegistration = await Registration.findOne({
        where: {
          event_id,
          member_id: member.id
        }
      });

      if (existingRegistration) {
        res.status(409).json({
          success: false,
          message: '您已經報名此活動'
        });
        return;
      }

      // 創建報名記錄
      const registration = await Registration.create({
        event_id,
        member_id: member.id,
        status: 'confirmed',
        registration_date: new Date()
      });

      res.status(201).json({
        success: true,
        message: '報名成功',
        data: registration
      });

    } catch (error) {
      console.error('活動報名錯誤:', error);
      res.status(500).json({
        success: false,
        message: '活動報名失敗',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
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