
import { Request, Response } from 'express';
import Member from '../models/member';
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
        line_uid
      } = req.body;

      // 驗證必要欄位
      if (!name || !email || !birthday || !job_title || !address || !mobile || !line_uid) {
        return res.status(400).json({
          success: false,
          error: '請填寫所有必要欄位'
        });
      }

      // 檢查 LINE UID 是否已經註冊
      const existingMember = await Member.findOne({
        where: { line_uid }
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
        line_uid,
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
      const { line_uid } = req.params;

      if (!line_uid) {
        return res.status(400).json({
          success: false,
          error: 'LINE UID 是必要參數'
        });
      }

      const member = await Member.findOne({
        where: { line_uid }
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
