import express from 'express';
import summaryRoutes from './admin/summary';
import dashboardRoutes from './admin/dashboard';
import reportsRoutes from './admin/reports';

const router = express.Router();

// 健康檢查
router.get('/health', (req, res) => {
  res.json({ status: 'admin routes ok' });
});

// 📊 系統總覽路由
router.use('/summary', summaryRoutes);

// 📈 統計儀表板路由
router.use('/dashboard', dashboardRoutes);

// 📋 報表匯出路由
router.use('/reports', reportsRoutes);

export default router;
