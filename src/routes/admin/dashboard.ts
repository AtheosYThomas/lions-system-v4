import express from 'express';
import adminController from '../../controllers/adminController';

const router = express.Router();

// 📈 統計儀表板路由
router.get('/registration-stats', adminController.getRegistrationStats);
router.get('/member-stats', adminController.getMemberStats);
router.get('/event-stats', adminController.getEventStats);
router.get('/checkin-stats', adminController.getCheckinStats);

export default router;