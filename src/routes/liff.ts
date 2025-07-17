
import express from 'express';
import LiffSession from '../models/liffSession';
import Member from '../models/member';

const router = express.Router();

router.post('/init', async (req, res) => {
  const { line_uid, display_name, picture_url, event_id } = req.body;

  if (!line_uid) return res.status(400).json({ error: 'line_uid 必填' });

  try {
    const member = await Member.findOne({ where: { line_uid } });

    // 建立 liff_sessions 紀錄
    await LiffSession.create({
      line_uid,
      display_name,
      picture_url,
      event_id: event_id || null,
      status: member ? 'signed_in' : 'pending',
      last_seen_at: new Date()
    });

    return res.json({
      is_member: !!member,
      role: member?.role || 'guest',
      name: member?.name || display_name,
      message: member ? `歡迎回來，${member.name}` : '尚未註冊，請填寫會員資料'
    });
  } catch (error) {
    console.error('LIFF init 錯誤:', error);
    return res.status(500).json({ error: '系統錯誤' });
  }
});

export default router;
