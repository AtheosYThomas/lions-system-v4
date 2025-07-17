import express from 'express';
import Member from '../models/member';
import Registration from '../models/registration';
import Event from '../models/event';
import sequelize from '../config/database';

// 快速查詢函數
async function getQuickStats() {
  const startTime = Date.now();
  console.log('🔍 開始快速統計查詢...');
  
  try {
    // 使用 raw SQL 查詢以提升速度
    console.log('📊 查詢會員總數...');
    const [memberResult] = await sequelize.query(
      'SELECT COUNT(*) as count FROM members',
      { type: sequelize.QueryTypes.SELECT }
    );

    console.log('📊 查詢活躍會員數...');
    const [activeResult] = await sequelize.query(
      "SELECT COUNT(*) as count FROM members WHERE status = 'active'",
      { type: sequelize.QueryTypes.SELECT }
    );

    console.log('📊 查詢報名總數...');
    const [registrationResult] = await sequelize.query(
      'SELECT COUNT(*) as count FROM registrations',
      { type: sequelize.QueryTypes.SELECT }
    );

    console.log('📊 查詢活動總數...');
    const [eventResult] = await sequelize.query(
      'SELECT COUNT(*) as count FROM events',
      { type: sequelize.QueryTypes.SELECT }
    );

    const endTime = Date.now();
    const queryTime = endTime - startTime;
    
    const result = {
      memberCount: parseInt(memberResult.count as string) || 0,
      activeMembers: parseInt(activeResult.count as string) || 0,
      registrationCount: parseInt(registrationResult.count as string) || 0,
      eventCount: parseInt(eventResult.count as string) || 0,
      queryTime: `${queryTime}ms`
    };
    
    console.log(`✅ 快速統計完成 (${queryTime}ms):`, result);
    return result;
  } catch (error) {
    const endTime = Date.now();
    const queryTime = endTime - startTime;
    
    console.error(`❌ 快速查詢失敗 (${queryTime}ms):`, error);
    return {
      memberCount: 0,
      activeMembers: 0,
      registrationCount: 0,
      eventCount: 0,
      error: '查詢失敗',
      queryTime: `${queryTime}ms`
    };
  }
}

const router = express.Router();

// 添加路由調試
router.use((req, res, next) => {
  console.log(`🔍 Admin 路由: ${req.method} ${req.originalUrl}`);
  next();
});

// 建立測試資料
router.post('/seed-data', async (req, res) => {
  try {
    const seedData = await import('../tools/seedData');
    await seedData.default();
    
    res.json({ 
      success: true, 
      message: '測試資料建立成功' 
    });
  } catch (error) {
    console.error('建立測試資料失敗:', error);
    res.status(500).json({ 
      success: false, 
      message: '建立測試資料失敗',
      error: error instanceof Error ? error.message : '未知錯誤'
    });
  }
});

// 清除測試資料
router.delete('/clear-data', async (req, res) => {
  try {
    await Registration.destroy({ where: {} });
    await Event.destroy({ where: {} });
    await Member.destroy({ where: {} });
    
    res.json({ 
      success: true, 
      message: '測試資料清除成功' 
    });
  } catch (error) {
    console.error('清除測試資料失敗:', error);
    res.status(500).json({ 
      success: false, 
      message: '清除測試資料失敗',
      error: error instanceof Error ? error.message : '未知錯誤'
    });
  }
});

// 系統總覽
router.get('/summary', async (req, res) => {
  const startTime = Date.now();
  console.log('📊 收到統計請求:', req.ip);
  
  try {
    // 增加超時時間並添加進度記錄
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('操作超時 (6秒)')), 6000)
    );

    console.log('🔄 開始查詢統計資料...');
    const statsPromise = getQuickStats();
    const stats = await Promise.race([statsPromise, timeoutPromise]);

    const endTime = Date.now();
    const responseTime = endTime - startTime;
    
    console.log(`✅ 統計查詢完成 (${responseTime}ms):`, stats);
    
    res.json({
      ...stats,
      responseTime: `${responseTime}ms`,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    const endTime = Date.now();
    const responseTime = endTime - startTime;
    
    console.error(`❌ 統計查詢失敗 (${responseTime}ms):`, error);
    
    // 提供預設值作為後備
    res.status(200).json({ 
      memberCount: 0,
      activeMembers: 0,
      registrationCount: 0,
      eventCount: 0,
      error: '統計查詢失敗，顯示預設值',
      message: error instanceof Error ? error.message : '未知錯誤',
      responseTime: `${responseTime}ms`,
      timestamp: new Date().toISOString()
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