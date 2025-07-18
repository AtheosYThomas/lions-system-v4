import express from 'express';
import memberController from '../../controllers/memberController';

const router = express.Router();

router.get('/members', memberController.getMembers);

// 會員註冊路由
router.post('/register', async (req: Request, res: Response) => {
  try {
    const memberData = {
      ...req.body,
      id: require('crypto').randomUUID(),
      role: 'member',
      status: 'pending', // 待審核狀態
      created_at: new Date()
    };

    const member = await memberService.createMember(memberData);

    res.status(201).json({
      success: true,
      message: '註冊申請已提交，請等待審核',
      member: {
        id: member.id,
        name: member.name,
        email: member.email,
        status: member.status
      }
    });
  } catch (error: any) {
    console.error('會員註冊失敗:', error);
    res.status(400).json({
      success: false,
      message: error.message || '註冊失敗'
    });
  }
});

// 創建新會員
router.post('/', async (req: Request, res: Response) => {

});

export default router;