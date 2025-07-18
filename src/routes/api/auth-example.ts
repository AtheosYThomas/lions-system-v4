import express from 'express';
import { authMiddleware, optionalAuthMiddleware, guestOnly } from '../../middleware/authMiddleware';
import { 
  adminOnly, 
  presidentOrAdmin, 
  officersOrAbove, 
  membersOrAbove,
  leadershipOnly,
  financialAccess,
  requireMinRole,
  requireAnyRole
} from '../../middleware/roleMiddleware';
import { Role, roleDisplayNames, hasMinimumRole, isInRoleGroup } from '../types/role';

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
router.get('/admin/reports', authMiddleware, officersOrAbove, (req, res) => {
  res.json({ message: '報告頁面 - 幹部或以上權限' });
});

// 範例 5: 財務相關權限
router.get('/finance/budget', authMiddleware, financialAccess, (req, res) => {
  res.json({ message: '預算管理 - 財務群組權限' });
});

// 範例 6: 領導層權限
router.get('/leadership/decisions', authMiddleware, leadershipOnly, (req, res) => {
  res.json({ message: '重要決策頁面 - 領導層權限' });
});

// 範例 7: 最低會員權限
router.get('/members/directory', authMiddleware, membersOrAbove, (req, res) => {
  res.json({ message: '會員名錄 - 會員或以上權限' });
});

// 範例 8: 多角色權限（秘書或財務）
router.get('/admin/documents', 
  authMiddleware, 
  requireAnyRole([Role.Secretary, Role.Treasurer, Role.Admin]), 
  (req, res) => {
    res.json({ message: '文件管理 - 秘書或財務權限' });
  }
);

// 範例 9: 最低副會長權限
router.get('/admin/policy', 
  authMiddleware, 
  requireMinRole(Role.VicePresident), 
  (req, res) => {
    res.json({ message: '政策管理 - 副會長或以上權限' });
  }
);

// 範例 10: 訪客專用（如註冊頁面）
router.get('/register-page', guestOnly, (req, res) => {
  res.json({ message: '註冊頁面 - 僅限訪客' });
});

// 範例 11: 測試新的角色系統
router.get('/test/role-system', authMiddleware, (req, res) => {
  const member = req.member!;
  const userRole = member.role as Role;

  res.json({
    message: '角色系統測試',
    user: {
      name: member.name,
      role: userRole,
      roleDisplayName: roleDisplayNames[userRole],
      roleRank: roleRank[userRole]
    },
    permissions: {
      isOfficer: hasMinimumRole(userRole, Role.Officer),
      isPresident: hasMinimumRole(userRole, Role.President),
      isAdmin: userRole === Role.Admin,
      inLeadership: isInRoleGroup(userRole, 'leadership'),
      inFinancial: isInRoleGroup(userRole, 'financial')
    }
  });
});ge: '註冊頁面 - 僅限未登入用戶' });
});

// 範例 11: 可選認證（登入與未登入都可訪問，但有不同內容）
router.get('/public/events', optionalAuthMiddleware, (req, res) => {
  if (req.member) {
    res.json({ 
      message: '活動列表 - 會員版',
      member: req.member.name,
      events: ['會員專屬活動', '公開活動']
    });
  } else {
    res.json({ 
      message: '活動列表 - 公開版',
      events: ['公開活動']
    });
  }
});

export default router;