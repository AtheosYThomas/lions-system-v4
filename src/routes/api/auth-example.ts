
import express from 'express';
import { authMiddleware } from '../../middleware/authMiddleware';
import { roleMiddleware, adminOnly, presidentOrAdmin, officerOrAbove } from '../../middleware/roleMiddleware';

const router = express.Router();

// 範例 1: 只需要登入的路由
router.get('/profile', authMiddleware, (req, res) => {
  res.json({
    message: '個人資料',
    member: {
      id: req.member!.id,
      name: req.member!.name,
      email: req.member!.email,
      role: req.member!.role
    }
  });
});

// 範例 2: 只有管理員可以存取
router.get('/admin/users', authMiddleware, adminOnly, (req, res) => {
  res.json({ message: '用戶管理頁面 - 僅限管理員' });
});

// 範例 3: 會長或管理員可以存取
router.get('/admin/announcements', authMiddleware, presidentOrAdmin, (req, res) => {
  res.json({ message: '公告審核頁面 - 會長或管理員' });
});

// 範例 4: 幹部或以上權限
router.get('/admin/reports', authMiddleware, officerOrAbove, (req, res) => {
  res.json({ message: '報告頁面 - 幹部或以上權限' });
});

// 範例 5: 自定義角色權限
router.get('/treasurer/finance', authMiddleware, roleMiddleware('treasurer'), (req, res) => {
  res.json({ message: '財務頁面 - 僅限財務長' });
});

// 範例 6: 秘書專用功能
router.post('/secretary/minutes', authMiddleware, roleMiddleware('secretary'), (req, res) => {
  res.json({ message: '會議記錄功能 - 僅限秘書' });
});

export default router;
