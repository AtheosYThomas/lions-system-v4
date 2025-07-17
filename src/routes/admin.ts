
import express from 'express';
import Member from '../models/member';
import Registration from '../models/registration';
import Event from '../models/event';
import sequelize from '../config/database';

const router = express.Router();

// 系統總覽
router.get('/summary', async (req, res) => {
  try {
    const memberCount = await Member.count();
    const activeMembers = await Member.count({ where: { status: 'active' } });
    const registrationCount = await Registration.count();
    const eventCount = await Event.count();
    
    res.json({ 
      memberCount, 
      activeMembers, 
      registrationCount, 
      eventCount,
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    console.error('❌ 系統總覽錯誤:', err);
    res.status(500).json({ 
      error: 'Summary failed', 
      details: err instanceof Error ? err.message : '未知錯誤'
    });
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
