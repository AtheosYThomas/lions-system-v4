
import express from 'express';
import Member from '../models/member';
import Registration from '../models/registration';
import Event from '../models/event';
import sequelize from '../config/database';

const router = express.Router();

// 系統總覽 (已暫停)
router.get('/summary', async (req, res) => {
  console.log('⏸️ 收到系統總覽請求 - 功能已暫停');
  
  // 返回暫停狀態而不執行資料庫查詢
  const result = { 
    memberCount: '---',
    activeMembers: '---', 
    registrationCount: '---',
    eventCount: '---',
    timestamp: new Date().toISOString(),
    status: 'paused',
    message: '統計功能已暫停，避免系統超時'
  };
  
  console.log('✅ 系統總覽已暫停:', result);
  res.json(result);
});

// 報名統計
router.get('/stats', async (req, res) => {
  try {
    const stats = await Registration.findAll({
      attributes: [
        'event_id', 
        [sequelize.fn('COUNT', '*'), 'count']
      ],
      group: ['event_id', 'Event.id', 'Event.title', 'Event.date'],
      include: [{
        model: Event,
        attributes: ['title', 'date'],
        required: false
      }]
    });
    res.json(stats);
  } catch (err) {
    console.error('❌ 統計錯誤:', err);
    res.status(500).json({ 
      error: 'Stats failed', 
      details: err instanceof Error ? err.message : '未知錯誤'
    });
  }
});

// 會員狀態統計
router.get('/member-stats', async (req, res) => {
  try {
    const memberStats = await Member.findAll({
      attributes: [
        'status',
        [sequelize.fn('COUNT', '*'), 'count']
      ],
      group: ['status']
    });
    res.json(memberStats);
  } catch (err) {
    console.error('❌ 會員統計錯誤:', err);
    res.status(500).json({ 
      error: 'Member stats failed', 
      details: err instanceof Error ? err.message : '未知錯誤'
    });
  }
});

export default router;
