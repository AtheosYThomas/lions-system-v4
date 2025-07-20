
import express from 'express';
import { authMiddleware } from '../../middleware/authMiddleware';
import { requireAnyRole } from '../../middleware/roleMiddleware';
import { Role } from '../../types/role';
import pushService from '../../services/pushService';
import lineService from '../../integrations/line/lineService';
import Member from '../../models/member';
import Event from '../../models/event';

const router = express.Router();

/**
 * 重推失敗的推播訊息
 * POST /api/push/retry
 */
router.post('/', authMiddleware, requireAnyRole([Role.Admin, Role.President]), async (req, res) => {
  try {
    const { eventId, memberIds, messageType = 'manual_push' } = req.body;

    // 驗證參數
    if (!eventId || !Array.isArray(memberIds) || memberIds.length === 0) {
      return res.status(400).json({
        error: '缺少必要參數：eventId 和 memberIds',
        code: 'MISSING_PARAMS'
      });
    }

    // 檢查活動是否存在
    const event = await Event.findByPk(eventId);
    if (!event) {
      return res.status(404).json({
        error: '找不到指定活動',
        code: 'EVENT_NOT_FOUND'
      });
    }

    // 獲取要重推的會員資料
    const members = await Member.findAll({
      where: {
        id: memberIds
      }
    });

    if (members.length === 0) {
      return res.status(404).json({
        error: '找不到指定會員',
        code: 'MEMBERS_NOT_FOUND'
      });
    }

    let successCount = 0;
    let failedCount = 0;
    const results = [];

    // 逐一重推
    for (const member of members) {
      try {
        // 發送 LINE 推播
        const messageText = `🦁 北大獅子會活動提醒\n\n📅 活動：${event.title}\n⏰ 時間：${new Date(event.date).toLocaleString('zh-TW')}\n${event.location ? `📍 地點：${event.location}` : ''}\n\n請準時參加！`;

        if (member.line_user_id) {
          await lineService.pushMessage(member.line_user_id, messageText);
        }

        // 記錄推播結果
        await pushService.recordPushResult({
          member_id: member.id,
          event_id: eventId,
          message_type: messageType,
          status: 'success'
        });

        successCount++;
        results.push({
          memberId: member.id,
          memberName: member.name,
          status: 'success'
        });

      } catch (error) {
        console.error(`推播給會員 ${member.name} 失敗:`, error);

        // 記錄失敗結果
        await pushService.recordPushResult({
          member_id: member.id,
          event_id: eventId,
          message_type: messageType,
          status: 'failed'
        });

        failedCount++;
        results.push({
          memberId: member.id,
          memberName: member.name,
          status: 'failed',
          error: error instanceof Error ? error.message : '未知錯誤'
        });
      }
    }

    res.json({
      success: true,
      successCount,
      failedCount,
      totalCount: members.length,
      results,
      message: `重推完成！成功：${successCount}，失敗：${failedCount}`
    });

  } catch (error) {
    console.error('❌ 重推推播失敗:', error);
    res.status(500).json({
      error: '重推推播失敗',
      details: error instanceof Error ? error.message : '未知錯誤',
      code: 'RETRY_PUSH_FAILED'
    });
  }
});

export default router;
