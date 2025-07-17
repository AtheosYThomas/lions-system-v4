
import express from 'express';
import Member from '../models/member';
import Registration from '../models/registration';
import Event from '../models/event';
import sequelize from '../config/database';

// 快速查詢函數
async function getQuickStats() {
  try {
    // 使用 raw SQL 查詢以提升速度
    const [memberResult] = await sequelize.query(
      'SELECT COUNT(*) as count FROM members',
      { type: sequelize.QueryTypes.SELECT }
    );
    
    const [activeResult] = await sequelize.query(
      "SELECT COUNT(*) as count FROM members WHERE status = 'active'",
      { type: sequelize.QueryTypes.SELECT }
    );
    
    const [registrationResult] = await sequelize.query(
      'SELECT COUNT(*) as count FROM registrations',
      { type: sequelize.QueryTypes.SELECT }
    );
    
    const [eventResult] = await sequelize.query(
      'SELECT COUNT(*) as count FROM events',
      { type: sequelize.QueryTypes.SELECT }
    );
    
    return {
      memberCount: parseInt(memberResult.count as string) || 0,
      activeMembers: parseInt(activeResult.count as string) || 0,
      registrationCount: parseInt(registrationResult.count as string) || 0,
      eventCount: parseInt(eventResult.count as string) || 0
    };
  } catch (error) {
    console.error('❌ 快速查詢失敗:', error);
    return {
      memberCount: 0,
      activeMembers: 0,
      registrationCount: 0,
      eventCount: 0
    };
  }
}

const router = express.Router();

// 系統總覽
router.get('/summary', async (req, res) => {
  console.log('📊 收到系統總覽請求，開始處理...');
  const startTime = Date.now();
  
  // 設定請求超時處理（增加到5秒以匹配前端）
  const timeout = setTimeout(() => {
    if (!res.headersSent) {
      console.log('⏱️ 請求超時，回傳預設數據');
      res.status(200).json({ 
        memberCount: 0,
        activeMembers: 0,
        registrationCount: 0,
        eventCount: 0,
        timestamp: new Date().toISOString(),
        status: 'timeout_fallback',
        message: '查詢中，請稍後重新整理'
      });
    }
  }, 4500); // 比前端超時稍短

  try {
    console.log('🔍 開始資料庫連線測試...');
    await sequelize.authenticate();
    console.log('✅ 資料庫連線正常');

    console.log('📊 開始快速查詢統計數據...');
    
    // 使用快速查詢函數
    const stats = await getQuickStats();
    console.log('✅ 快速查詢結果:', stats);
    
    const { memberCount, activeMembers, registrationCount, eventCount } = stats;
    
    const endTime = Date.now();
    const queryTime = endTime - startTime;
    
    const result = { 
      memberCount, 
      activeMembers, 
      registrationCount, 
      eventCount,
      timestamp: new Date().toISOString(),
      queryTime: `${queryTime}ms`,
      status: 'success'
    };
    
    clearTimeout(timeout);
    
    if (!res.headersSent) {
      console.log(`✅ 系統總覽完成 (${queryTime}ms):`, result);
      res.json(result);
    }
  } catch (err) {
    clearTimeout(timeout);
    const endTime = Date.now();
    const queryTime = endTime - startTime;
    
    console.error(`❌ 系統總覽錯誤 (${queryTime}ms):`, err);
    
    if (!res.headersSent) {
      // 即使發生錯誤，也回傳基本結構避免前端崩潰
      res.status(200).json({ 
        memberCount: 0,
        activeMembers: 0,
        registrationCount: 0,
        eventCount: 0,
        timestamp: new Date().toISOString(),
        queryTime: `${queryTime}ms`,
        status: 'error',
        error: err instanceof Error ? err.message : '未知錯誤'
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

// 簡化版統計（用於測試和快速回應）
router.get('/quick-summary', async (req, res) => {
  console.log('⚡ 收到快速統計請求');
  try {
    res.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      message: '系統運作正常',
      uptime: process.uptime(),
      memory: process.memoryUsage()
    });
  } catch (err) {
    res.status(500).json({ 
      error: 'Quick summary failed',
      details: err instanceof Error ? err.message : '未知錯誤'
    });
  }
});

export default router;
