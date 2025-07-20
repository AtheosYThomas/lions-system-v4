import express from 'express';
import adminController from '../../controllers/adminController';
import { authMiddleware } from '../../middleware/authMiddleware';
import { presidentOrAdmin } from '../../middleware/roleMiddleware';

const router = express.Router();

// 📊 管理介面主頁面 - 僅限會長與管理員
router.get('/', authMiddleware, presidentOrAdmin, async (req, res) => {
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

// 📈 統計儀表板路由 - 需要認證與會長或管理員權限
router.get(
  '/registration-stats',
  authMiddleware,
  presidentOrAdmin,
  adminController.getRegistrationStats
);
router.get(
  '/member-stats',
  authMiddleware,
  presidentOrAdmin,
  adminController.getMemberStats
);
router.get(
  '/event-stats',
  authMiddleware,
  presidentOrAdmin,
  adminController.getEventStats
);
router.get(
  '/checkin-stats',
  authMiddleware,
  presidentOrAdmin,
  adminController.getCheckinStats
);

export default router;
