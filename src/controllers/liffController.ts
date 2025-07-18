import { Request, Response } from 'express';
import dotenv from 'dotenv';
import { LiffSession, LiffSessionCreationAttributes } from '../models/liffSession';
import { Member, MemberCreationAttributes } from '../models/member';

// 載入環境變數
dotenv.config();

class LiffController {
  async initSession(req: Request, res: Response) {
    console.log('📩 LIFF /init 請求:', req.body);

    const { line_uid, display_name, picture_url, event_id } = req.body;

    if (!line_uid) {
      console.log('❌ line_uid 缺失');
      return res.status(400).json({ error: 'line_uid 必填' });
    }

    // 驗證 event_id 格式（如果有提供的話）
    if (event_id && !event_id.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)) {
      console.log('❌ event_id 格式無效:', event_id);
      return res.status(400).json({ error: 'event_id 必須是有效的 UUID 格式' });
    }

    try {
      console.log('🔍 查詢會員:', line_uid);
      const member = await Member.findOne({ 
        where: { 
          line_user_id: line_uid
        } 
      });
      console.log('👤 查詢結果:', member ? '找到會員' : '未找到會員');

      console.log('💾 建立 LIFF session...');
      const sessionData: LiffSessionCreationAttributes = {
        line_uid,
        display_name: display_name || undefined,
        picture_url: picture_url || undefined,
        event_id: event_id || undefined,
        status: member ? 'signed_in' : 'pending',
        last_seen_at: new Date()
      };

      const session = await LiffSession.create(sessionData);
      console.log('✅ LIFF session 建立成功:', session.id);

      const response = {
        is_member: !!member,
        role: member?.role || 'guest',
        name: member?.name || display_name,
        message: member ? `歡迎回來，${member.name}` : '尚未註冊，請填寫會員資料'
      };

      console.log('📤 回應資料:', response);
      return res.json(response);

    } catch (error: any) {
      console.error('❌ LIFF init 錯誤詳情:', error);
      console.error('❌ 錯誤堆疊:', error.stack);
      return res.status(500).json({ 
        error: '系統錯誤',
        details: (process.env.NODE_ENV || '').toLowerCase() === 'development' ? error.message : undefined
      });
    }
  }

  async registerMember(req: Request, res: Response) {
    console.log('📝 LIFF /register 請求:', req.body);

    const { line_uid, name, email, phone } = req.body;

    if (!line_uid || !name || !email) {
      console.log('❌ 必填欄位缺失');
      return res.status(400).json({ error: '姓名、email 和 line_uid 為必填欄位' });
    }

    try {
      // 檢查是否已經註冊
      const existingMember = await Member.findOne({ where: { line_user_id: line_uid } });
      if (existingMember) {
        console.log('⚠️ 會員已存在');
        return res.status(400).json({ error: '此 LINE 帳號已經註冊過了' });
      }

      // 檢查 email 是否重複
      const emailExists = await Member.findOne({ where: { email } });
      if (emailExists) {
        console.log('⚠️ Email 已存在');
        return res.status(400).json({ error: '此 email 已被使用' });
      }

      // 建立新會員
      const memberData: MemberCreationAttributes = {
        name,
        email,
        line_user_id: line_uid,
        phone: phone || undefined,
        role: 'member',
        status: 'active',
        birthday: '', // Required field - can be updated later
        job_title: '', // Required field - can be updated later
        address: '', // Required field - can be updated later
        mobile: phone || '' // Use phone as mobile, or empty string
      };

      const newMember = await Member.create(memberData);

      console.log('✅ 新會員註冊成功:', newMember.name);

      // 更新 LIFF session 狀態
      await LiffSession.update(
        { status: 'signed_in' },
        { where: { line_uid } }
      );

      const response = {
        success: true,
        message: '註冊成功！歡迎加入北大獅子會',
        member: {
          id: newMember.id,
          name: newMember.name,
          email: newMember.email,
          role: newMember.role
        }
      };

      console.log('📤 註冊回應:', response);
      return res.json(response);

    } catch (error: any) {
      console.error('❌ 註冊錯誤:', error);
      return res.status(500).json({ 
        error: '註冊失敗',
        details: (process.env.NODE_ENV || '').toLowerCase() === 'development' ? error.message : undefined
      });
    }
  }

  async getMemberProfile(req: Request, res: Response) {
    console.log('👤 LIFF /profile 請求:', req.params.line_uid);

    const { line_uid } = req.params;

    try {
      const member = await Member.findOne({ 
        where: { line_user_id: line_uid },
        attributes: ['id', 'name', 'email', 'phone', 'role', 'status', 'created_at']
      });

      if (!member) {
        return res.status(404).json({ error: '找不到會員資料' });
      }

      console.log('✅ 會員資料查詢成功');
      return res.json({
        success: true,
        member: member
      });

    } catch (error: any) {
      console.error('❌ 查詢錯誤:', error);
      return res.status(500).json({ 
        error: '查詢失敗',
        details: (process.env.NODE_ENV || '').toLowerCase() === 'development' ? error.message : undefined
      });
    }
  }

  async getMemberProfileByUid(req: Request, res: Response) {
    console.log('👤 LIFF /profile 請求:', req.params.lineUid);

    const { lineUid } = req.params;

    try {
      const member = await Member.findOne({
        where: { line_user_id: lineUid }
      });

      if (!member) {
        return res.json({
          success: false,
          message: '未找到會員資料，請先完成註冊'
        });
      }

      res.json({
        success: true,
        member: {
          id: member.id,
          name: member.name,
          email: member.email,
          phone: member.phone,
          mobile: member.mobile,
          english_name: member.english_name,
          birthday: member.birthday,
          job_title: member.job_title,
          address: member.address,
          role: member.role,
          status: member.status,
          created_at: member.created_at
        }
      });
    } catch (error) {
      console.error('❌ 查詢錯誤:', error);
      return res.status(500).json({
        success: false,
        message: '查詢會員資料失敗',
        error: (process.env.NODE_ENV || '').toLowerCase() === 'development' ? error : undefined
      });
    }
  }
}

export default new LiffController();