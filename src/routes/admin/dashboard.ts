import express from 'express';
import adminController from '../../controllers/adminController';
import { authMiddleware } from '../../middleware/authMiddleware';
import { roleMiddleware } from '../../middleware/roleMiddleware';

const router = express.Router();

// 📊 管理介面主頁面 - 僅限會長與管理員
router.get('/', authMiddleware, roleMiddleware('president'), async (req, res) => {
  try {
    res.json({
      message: '歡迎來到後台管理介面',
      user: req.member!.name,
      role: req.member!.role,
    });
  } catch (error) {
    res.status(500).json({ error: '無法載入後台資料' });
  }
});

// 📈 統計儀表板路由 - 需要認證與會長權限
router.get('/registration-stats', authMiddleware, roleMiddleware('president'), adminController.getRegistrationStats);
router.get('/member-stats', authMiddleware, roleMiddleware('president'), adminController.getMemberStats);
router.get('/event-stats', authMiddleware, roleMiddleware('president'), adminController.getEventStats);
router.get('/checkin-stats', authMiddleware, roleMiddleware('president'), adminController.getCheckinStats);

export default router;