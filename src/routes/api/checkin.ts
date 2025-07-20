import express from 'express';
import checkinController from '../../controllers/checkinController';

const router = express.Router();

// 活動簽到
router.post('/checkin/:eventId', checkinController.checkinToEvent);

// 查詢活動簽到列表
router.get('/checkin/:eventId', checkinController.getEventCheckins);

// 會員簽到歷史
router.get('/member/:lineUserId/checkins', checkinController.getMemberCheckinHistory);

/**
 * POST /api/checkin/:eventId
 * 執行特定活動的簽到
 */
router.post('/:eventId', async (req, res) => {
  try {
    const { eventId } = req.params;
    const { lineUserId, deviceInfo } = req.body;

    if (!lineUserId) {
      return res.status(400).json({
        success: false,
        error: '缺少 LINE 用戶 ID'
      });
    }

    // 根據 LINE UID 查找會員
    const member = await prisma.member.findUnique({
      where: { line_user_id: lineUserId }
    });

    if (!member) {
      return res.status(404).json({
        success: false,
        error: '找不到對應的會員資料'
      });
    }

    // 使用 checkinService 執行簽到
    const checkinResult = await checkinService.performCheckin({
      member_id: member.id,
      event_id: eventId,
      device_info: deviceInfo
    });

    res.json({
      success: true,
      message: '簽到成功',
      checkin: checkinResult,
      member: {
        id: member.id,
        name: member.name
      },
      event: checkinResult.event
    });

  } catch (error) {
    console.error('簽到失敗:', error);

    if (error instanceof Error) {
      if (error.message.includes('已經簽到過了')) {
        return res.status(409).json({
          success: false,
          error: error.message
        });
      }
    }

    res.status(500).json({
      success: false,
      error: '簽到失敗',
      message: error instanceof Error ? error.message : '未知錯誤'
    });
  }
});

/**
 * POST /api/checkin
 * 執行簽到（向後相容）
 */
router.post('/', async (req, res) => {
  // TODO: 向後相容的邏輯（如果需要）
  res.status(501).json({
    success: false,
    error: '尚未實作向後相容的簽到端點'
  });
});

export default router;