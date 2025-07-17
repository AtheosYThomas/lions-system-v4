
import express from 'express';
import LiffSession from '../models/liffSession';
import Member from '../models/member';

const router = express.Router();

router.post('/init', async (req, res) => {
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
    // 使用原始 SQL 查詢來確保正確的欄位名稱
    const member = await Member.findOne({ 
      where: { 
        line_uid: line_uid  // 這會自動映射到 line_user_id 欄位
      } 
    });
    console.log('👤 查詢結果:', member ? '找到會員' : '未找到會員');

    console.log('💾 建立 LIFF session...');
    const session = await LiffSession.create({
      line_uid,
      display_name: display_name || undefined,
      picture_url: picture_url || undefined,
      event_id: event_id || undefined,
      status: member ? 'signed_in' : 'pending',
      last_seen_at: new Date()
    });
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
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// 會員註冊 API
router.post('/register', async (req, res) => {
  console.log('📝 LIFF /register 請求:', req.body);
  
  const { line_uid, name, email, phone } = req.body;

  if (!line_uid || !name || !email) {
    console.log('❌ 必填欄位缺失');
    return res.status(400).json({ error: '姓名、email 和 line_uid 為必填欄位' });
  }

  try {
    // 檢查是否已經註冊
    const existingMember = await Member.findOne({ where: { line_uid } });
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
    const newMember = await Member.create({
      name,
      email,
      line_uid,
      phone: phone || undefined,
      role: 'member',
      status: 'active'
    });

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
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// 查詢會員資料 API
router.get('/profile/:line_uid', async (req, res) => {
  console.log('👤 LIFF /profile 請求:', req.params.line_uid);
  
  const { line_uid } = req.params;

  try {
    const member = await Member.findOne({ 
      where: { line_uid },
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
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

export default router;
