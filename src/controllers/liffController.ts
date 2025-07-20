import { Request, Response } from 'express';
import Member from '../models/member';
import { getMemberWithEventsByLineUserId } from '../services/liffService';

interface LiffCheckMemberRequest {
  line_user_id: string;
  display_name?: string;
  picture_url?: string;
}

interface LiffRegisterMemberRequest {
  line_user_id: string;
  name: string;
  email: string;
  english_name?: string;
  birthday: string;
  job_title: string;
  mobile: string;
  phone?: string;
  fax?: string;
  address: string;
}

class LiffController {
  /**
   * 檢查 LINE 用戶是否為會員 - V4.0 修正版
   */
  async checkMember(req: Request, res: Response): Promise<void> {
    const { lineUserId } = req.body;

    if (!lineUserId) {
      res.status(400).json({ error: 'lineUserId is required' });
      return;
    }

    try {
      const member = await getMemberWithEventsByLineUserId(lineUserId);
      if (!member) {
        res.status(200).json({ member: null }); // 未註冊
        return;
      }

      res.json({ member });
    } catch (err) {
      console.error('checkMember error:', err);
      res.status(500).json({ error: 'Server error' });
    }
  }

  /**
   * 處理會員註冊
   */
  async registerMember(req: Request, res: Response): Promise<void> {
    try {
      const {
        line_user_id,
        name,
        english_name,
        birthday,
        job_title,
        mobile,
        fax,
        address,
        email,
      } = req.body;

      console.log('📝 收到註冊請求:', {
        line_user_id,
        name,
        email,
        birthday,
        job_title,
        mobile,
        address,
      });

      // 基本驗證 - 檢查必要欄位
      if (
        !line_user_id ||
        !name ||
        !birthday ||
        !job_title ||
        !mobile ||
        !address ||
        !email
      ) {
        res.status(400).json({
          success: false,
          error:
            '缺少必要欄位 (line_user_id, name, birthday, job_title, mobile, address, email)',
        });
        return;
      }

      // 檢查是否已註冊
      const existingMember = await Member.findOne({
        where: { line_user_id },
      });

      if (existingMember) {
        console.log('⚠️ LINE 帳號已存在:', line_user_id);
        res.status(409).json({
          success: false,
          error: '此 LINE 帳號已註冊',
        });
        return;
      }

      // 檢查 email 是否已被使用
      const existingEmail = await Member.findOne({
        where: { email },
      });

      if (existingEmail) {
        console.log('⚠️ Email 已存在:', email);
        res.status(409).json({
          success: false,
          error: '此 Email 已被註冊',
        });
        return;
      }

      // 建立新會員
      const newMember = await Member.create({
        id: require('crypto').randomUUID(),
        line_user_id,
        name,
        english_name: english_name || null,
        birthday,
        job_title,
        mobile,
        fax: fax || null,
        address,
        email,
        status: 'pending', // 預設為待審核狀態
        role: 'member',
        created_at: new Date(),
      });

      console.log('✅ 會員註冊成功:', {
        id: newMember.id,
        name: newMember.name,
        email: newMember.email,
      });

      res.status(201).json({
        success: true,
        message: '註冊成功，請等待管理員審核',
        member_id: newMember.id,
      });
    } catch (error) {
      console.error('❌ 註冊會員失敗:', error);
      res.status(500).json({
        success: false,
        error: '系統錯誤，請稍後再試',
      });
    }
  }
}

export default new LiffController();
