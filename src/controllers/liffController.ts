import { Request, Response } from 'express';
import Member from '../models/member';

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
   * 檢查 LINE 用戶是否為會員
   */
  async checkMember(req: Request, res: Response): Promise<void> {
    try {
      const { line_user_id, display_name, picture_url }: LiffCheckMemberRequest = req.body;

      console.log('📱 LIFF 檢查會員請求:', {
        line_user_id,
        display_name,
        picture_url: picture_url ? 'Present' : 'None'
      });

      if (!line_user_id) {
        res.status(400).json({
          success: false,
          error: '缺少 line_user_id 參數'
        });
        return;
      }

      // 查詢會員資料
      const member = await Member.findOne({
        where: { line_user_id }
      });

      if (member) {
        console.log('✅ 找到會員:', member.name);
        res.json({
          success: true,
          is_member: true,
          isMember: true, // 新增相容性欄位
          member_name: member.name,
          member_id: member.id,
          message: `歡迎回來，${member.name}！`
        });
      } else {
        console.log('❌ 未找到會員，需要註冊');
        res.json({
          success: true,
          is_member: false,
          isMember: false, // 新增相容性欄位
          message: '您尚未註冊會員，請完成註冊程序'
        });
      }

    } catch (error) {
      console.error('❌ LIFF 檢查會員失敗:', error);
      res.status(500).json({
        success: false,
        error: 'LIFF 服務暫時無法使用，請稍後再試',
        details: error instanceof Error ? error.message : '未知錯誤'
      });
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
        email
      } = req.body;

      console.log('📝 收到註冊請求:', {
        line_user_id,
        name,
        email,
        birthday,
        job_title,
        mobile,
        address
      });

      // 基本驗證 - 檢查必要欄位
      if (!line_user_id || !name || !birthday || !job_title || !mobile || !address || !email) {
        res.status(400).json({
          success: false,
          error: '缺少必要欄位 (line_user_id, name, birthday, job_title, mobile, address, email)'
        });
        return;
      }

      // 檢查是否已註冊
      const existingMember = await Member.findOne({
        where: { line_user_id }
      });

      if (existingMember) {
        console.log('⚠️ LINE 帳號已存在:', line_user_id);
        res.status(409).json({
          success: false,
          error: '此 LINE 帳號已註冊'
        });
        return;
      }

      // 檢查 email 是否已被使用
      const existingEmail = await Member.findOne({
        where: { email }
      });

      if (existingEmail) {
        console.log('⚠️ Email 已存在:', email);
        res.status(409).json({
          success: false,
          error: '此 Email 已被註冊'
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
        created_at: new Date()
      });

      console.log('✅ 會員註冊成功:', {
        id: newMember.id,
        name: newMember.name,
        email: newMember.email
      });

      res.status(201).json({
        success: true,
        message: '註冊成功，請等待管理員審核',
        member_id: newMember.id
      });

    } catch (error) {
      console.error('❌ 註冊會員失敗:', error);
      res.status(500).json({
        success: false,
        error: '系統錯誤，請稍後再試'
      });
    }
  }
}

export default new LiffController();