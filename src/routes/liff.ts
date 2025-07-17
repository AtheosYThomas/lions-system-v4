
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
      display_name: display_name || null,
      picture_url: picture_url || null,
      event_id: event_id || null,
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
    
  } catch (error) {
    console.error('❌ LIFF init 錯誤詳情:', error);
    console.error('❌ 錯誤堆疊:', error.stack);
    return res.status(500).json({ 
      error: '系統錯誤',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

export default router;
