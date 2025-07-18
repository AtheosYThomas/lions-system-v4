import { Request, Response } from 'express';
import Member from '../models/member';

interface LiffCheckMemberRequest {
  line_user_id: string;
  display_name?: string;
  picture_url?: string;
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
          member_name: member.name,
          member_id: member.id,
          message: `歡迎回來，${member.name}！`
        });
      } else {
        console.log('❌ 未找到會員，需要註冊');
        res.json({
          success: true,
          is_member: false,
          message: '您尚未註冊會員，請完成註冊程序'
        });
      }

    } catch (error) {
      console.error('❌ LIFF 檢查會員失敗:', error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : '伺服器錯誤'
      });
    }
  }

  /**
   * 處理會員註冊
   */
  async registerMember(req: Request, res: Response): Promise<void> {
    try {
      const memberData = req.body;
      console.log('📝 LIFF 註冊會員請求:', memberData);

      // 檢查必要欄位
      if (!memberData.line_user_id) {
        res.status(400).json({
          success: false,
          error: '缺少 line_user_id 參數'
        });
        return;
      }

      // 檢查是否已註冊
      const existingMember = await Member.findOne({
        where: { line_user_id: memberData.line_user_id }
      });

      if (existingMember) {
        res.status(400).json({
          success: false,
          error: '此 LINE 帳號已註冊會員'
        });
        return;
      }

      // 檢查 email 是否已存在
      if (memberData.email) {
        const existingEmail = await Member.findOne({
          where: { email: memberData.email }
        });

        if (existingEmail) {
          res.status(400).json({
            success: false,
            error: '此 Email 已被使用'
          });
          return;
        }
      }

      // 創建新會員
      const newMember = await Member.create({
        ...memberData,
        status: 'active',
        role: 'member'
      });

      console.log('✅ 會員註冊成功:', newMember.name);
      res.json({
        success: true,
        message: '會員註冊成功！',
        member: {
          id: newMember.id,
          name: newMember.name,
          email: newMember.email,
          line_user_id: newMember.line_user_id
        }
      });

    } catch (error) {
      console.error('❌ LIFF 註冊會員失敗:', error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : '註冊失敗'
      });
    }
  }
}

export default new LiffController();