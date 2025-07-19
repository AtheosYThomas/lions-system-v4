import express from 'express';
import summaryRoutes from './admin/summary';
import dashboardRoutes from './admin/dashboard';
import reportsRoutes from './admin/reports';
import announcementsRouter from './api/announcements';
import checkinRouter from './api/checkin';
import liffRouter from './api/liff';
import membersRouter from './api/members';
import filesRouter from './api/files';

const router = express.Router();

// 📊 系統總覽路由
router.use('/summary', summaryRoutes);

// 📈 統計儀表板路由
router.use('/dashboard', dashboardRoutes);

// 📋 報表匯出路由
router.use('/reports', reportsRoutes);

// API 路由
router.use('/api/announcements', announcementsRouter);
router.use('/api/checkin', checkinRouter);
router.use('/api/liff', liffRouter);
router.use('/api/members', membersRouter);
router.use('/api/files', filesRouter);

export default router;