import express from 'express';
import { PrismaClient } from '@prisma/client';
import memberController from '../../controllers/memberController';

const router = express.Router();
const prisma = new PrismaClient();

// 會員管理路由
router.get('/members', memberController.getMembers);
router.get('/members/:id', memberController.getMemberById);
router.post('/members', memberController.createMember);
router.put('/members/:id', memberController.updateMember);
router.delete('/members/:id', memberController.deactivateMember);
router.get('/members/stats', memberController.getMemberStats);

/**
 * GET /api/members/:id/events
 * 獲取會員的活動資訊（包含報名和簽到狀態）
 */
router.get('/:id/events', async (req, res) => {
  try {
    const { id: memberId } = req.params;

    // 檢查會員是否存在
    const member = await prisma.member.findUnique({
      where: { id: memberId },
    });

    if (!member) {
      return res.status(404).json({
        success: false,
        error: '會員不存在',
      });
    }

    // 獲取所有活動
    const events = await prisma.event.findMany({
      where: { status: 'active' },
      orderBy: { date: 'desc' },
    });

    // 分別獲取該會員的報名和簽到記錄
    const [registrations, checkins] = await Promise.all([
      prisma.eventRegistration.findMany({
        where: { member_id: memberId },
        select: {
          id: true,
          event_id: true,
          status: true,
          registration_date: true,
        },
      }),
      prisma.checkin.findMany({
        where: { member_id: memberId },
        select: { id: true, event_id: true, checkin_time: true },
      }),
    ]);

    // 格式化活動資料
    const formattedEvents = events.map(event => {
      const registration = registrations.find(r => r.event_id === event.id);
      const checkin = checkins.find(c => c.event_id === event.id);
      const now = new Date();
      const eventDate = new Date(event.date);

      let eventStatus: 'upcoming' | 'ongoing' | 'completed';
      if (eventDate > now) {
        eventStatus = 'upcoming';
      } else if (eventDate.toDateString() === now.toDateString()) {
        eventStatus = 'ongoing';
      } else {
        eventStatus = 'completed';
      }

      return {
        id: event.id,
        title: event.title,
        date: event.date.toISOString(),
        location: event.location,
        status: eventStatus,
        registration_status: registration ? 'registered' : 'not_registered',
        checkin_status: checkin ? 'checked_in' : 'not_checked_in',
        checkin_time: checkin?.checkin_time?.toISOString(),
      };
    });

    res.json({
      success: true,
      member: {
        id: member.id,
        name: member.name,
        email: member.email,
        role: member.role,
        events: formattedEvents,
      },
    });
  } catch (error) {
    console.error('獲取會員活動失敗:', error);
    res.status(500).json({
      success: false,
      error: '獲取活動資訊失敗',
      message: error instanceof Error ? error.message : '未知錯誤',
    });
  }
});

export default router;
