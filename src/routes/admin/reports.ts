
import express from 'express';
import adminController from '../../controllers/adminController';

const router = express.Router();

// 匯出會員報表
router.get('/members', adminController.exportMembersReport);

// 匯出活動報表
router.get('/events', adminController.exportEventsReport);

// 匯出報名報表
router.get('/registrations', adminController.exportRegistrationsReport);

// 匯出簽到報表
router.get('/checkins', adminController.exportCheckinsReport);

// 綜合報表
router.get('/comprehensive', adminController.exportComprehensiveReport);

export default router;
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
