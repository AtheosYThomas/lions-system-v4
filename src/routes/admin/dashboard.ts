
import express from 'express';
import adminController from '../../controllers/adminController';

const router = express.Router();

// 報名統計
router.get('/stats', adminController.getRegistrationStats);

// 會員狀態統計
router.get('/member-stats', adminController.getMemberStats);

// 活動統計
router.get('/event-stats', adminController.getEventStats);

// 簽到統計
router.get('/checkin-stats', adminController.getCheckinStats);

export default router;
import express from 'express';
import adminController from '../../controllers/adminController';

const router = express.Router();

// 📈 統計儀表板路由
router.get('/registration-stats', adminController.getRegistrationStats);
router.get('/member-stats', adminController.getMemberStats);
router.get('/event-stats', adminController.getEventStats);
router.get('/checkin-stats', adminController.getCheckinStats);

export default router;
