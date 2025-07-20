import express from 'express';
import { PrismaClient } from '@prisma/client';
import checkinController from '../../controllers/checkinController';
import checkinService from '../../services/checkinService';

const prisma = new PrismaClient();
const router = express.Router();

// 活動簽到
router.post('/checkin/:eventId', async (req, res) => {
  try {
    const { eventId } = req.params;
    const { lineUserId, deviceInfo } = req.body;

    if (!lineUserId) {
      return res.status(400).json({ success: false, error: '缺少 LINE 用戶 ID' });
    }

    const member = await prisma.member.findUnique({
      where: { line_user_id: lineUserId }
    });

    if (!member) {
      return res.status(404).json({ success: false, error: '找不到會員' });
    }

    const checkin = await checkinService.performCheckin({
      member_id: member.id,
      event_id: eventId,
      device_info: deviceInfo
    });

    res.json({
      success: true,
      message: '簽到成功',
      checkin,
      member: { id: member.id, name: member.name },
      event: checkin.event
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : '未知錯誤';
    res.status(errorMessage.includes('已經簽到') ? 409 : 500).json({
      success: false,
      error: errorMessage
    });
  }
});

// 查詢活動簽到列表
router.get('/checkin/:eventId', checkinController.getEventCheckins);

// 會員簽到歷史
router.get('/member/:lineUserId/checkins', checkinController.getMemberCheckinHistory);

export default router;