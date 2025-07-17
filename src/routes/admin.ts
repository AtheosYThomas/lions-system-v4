
import express from 'express';
import Member from '../models/member';
import Registration from '../models/registration';
import Event from '../models/event';
import sequelize from '../config/database';

const router = express.Router();

// 系統總覽
router.get('/summary', async (req, res) => {
  console.log('📊 收到系統總覽請求');
  
  // 設定請求超時處理
  const timeout = setTimeout(() => {
    if (!res.headersSent) {
      res.status(408).json({ 
        error: '請求超時',
        message: '系統負載過高，請稍後再試'
      });
    }
  }, 4000);

  try {
    // 使用 Promise.all 並行查詢以提升性能
    const [memberCount, activeMembers, registrationCount, eventCount] = await Promise.all([
      Member.count().catch(() => 0),
      Member.count({ where: { status: 'active' } }).catch(() => 0),
      Registration.count().catch(() => 0),
      Event.count().catch(() => 0)
    ]);
    
    const result = { 
      memberCount, 
      activeMembers, 
      registrationCount, 
      eventCount,
      timestamp: new Date().toISOString()
    };
    
    clearTimeout(timeout);
    
    if (!res.headersSent) {
      console.log('✅ 系統總覽數據:', result);
      res.json(result);
    }
  } catch (err) {
    clearTimeout(timeout);
    console.error('❌ 系統總覽錯誤:', err);
    
    if (!res.headersSent) {
      res.status(500).json({ 
        error: 'Summary failed', 
        details: err instanceof Error ? err.message : '未知錯誤'
      });
    }
  }
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
