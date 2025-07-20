import express from 'express';
import adminController from '../../controllers/adminController';

const router = express.Router();

// 📋 報表匯出路由
router.get('/members', adminController.exportMembersReport);
router.get('/events', adminController.exportEventsReport);
router.get('/registrations', adminController.exportRegistrationsReport);
router.get('/checkins', adminController.exportCheckinsReport);
router.get('/comprehensive', adminController.exportComprehensiveReport);

export default router;
