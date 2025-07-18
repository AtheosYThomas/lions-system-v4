
import express from 'express';
import { authMiddleware } from '../../middleware/authMiddleware';
import { 
  adminOnly, 
  presidentOrAdmin, 
  officersOrAbove, 
  membersOrAbove,
  leadershipOnly,
  financialAccess,
  requireMinRole,
  requireAnyRole,
  roleMiddleware
} from '../../middleware/roleMiddleware';
import { Role, roleDisplayNames, roleRank } from '../../types/role';

const router = express.Router();

// 🔧 測試基本角色權限
router.get('/admin-only', authMiddleware, adminOnly, (req, res) => {
  res.json({ message: '✅ 管理員專用區域', role: req.member!.role });
});

router.get('/president-or-admin', authMiddleware, presidentOrAdmin, (req, res) => {
  res.json({ message: '✅ 會長或管理員區域', role: req.member!.role });
});

router.get('/officers-or-above', authMiddleware, officersOrAbove, (req, res) => {
  res.json({ message: '✅ 幹部或以上權限區域', role: req.member!.role });
});

router.get('/members-or-above', authMiddleware, membersOrAbove, (req, res) => {
  res.json({ message: '✅ 會員或以上權限區域', role: req.member!.role });
});

// 🎯 測試進階角色功能
router.get('/leadership-only', authMiddleware, leadershipOnly, (req, res) => {
  res.json({ message: '✅ 領導層專用區域', role: req.member!.role });
});

router.get('/financial-access', authMiddleware, financialAccess, (req, res) => {
  res.json({ message: '✅ 財務權限區域', role: req.member!.role });
});

// 🔥 測試彈性角色函數
router.get('/require-officer', 
  authMiddleware, 
  requireMinRole(Role.Officer), 
  (req, res) => {
    res.json({ message: '✅ 需要幹部或以上權限', role: req.member!.role });
  }
);

router.get('/secretary-or-treasurer', 
  authMiddleware, 
  requireAnyRole([Role.Secretary, Role.Treasurer]), 
  (req, res) => {
    res.json({ message: '✅ 秘書或財務權限', role: req.member!.role });
  }
);

// 📊 角色系統狀態檢查
router.get('/role-info', authMiddleware, (req, res) => {
  const member = req.member!;
  const userRole = member.role as Role;
  
  res.json({
    message: '📊 角色系統資訊',
    user: {
      name: member.name,
      role: userRole,
      displayName: roleDisplayNames[userRole],
      rank: roleRank[userRole]
    },
    systemInfo: {
      totalRoles: Object.keys(Role).length,
      roleHierarchy: Object.entries(roleRank).sort(([,a], [,b]) => a - b),
      availableMiddleware: [
        'adminOnly',
        'presidentOrAdmin', 
        'officersOrAbove',
        'membersOrAbove',
        'leadershipOnly',
        'financialAccess'
      ]
    }
  });
});

export default router;
