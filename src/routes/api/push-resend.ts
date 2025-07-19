
import express from 'express';
import { authMiddleware } from '../../middleware/authMiddleware';
import { requireAnyRole } from '../../middleware/roleMiddleware';
import { Role } from '../../types/role';
import { PushRecordWithRelations } from '../../types';
import PushRecord from '../../models/pushRecord';
import Member from '../../models/member';
import Event from '../../models/event';
import lineService from '../../integrations/line/lineService';
import pushService from '../../services/pushService';

const router = express.Router();

/**
 * 重推單筆或多筆推播記錄
 * POST /api/push/resend
 */
router.post('/', authMiddleware, requireAnyRole([Role.Admin, Role.President]), async (req, res) => {
  try {
    const { pushRecordIds } = req.body;

    // 驗證參數
    if (!Array.isArray(pushRecordIds) || pushRecordIds.length === 0) {
      return res.status(400).json({
        error: 'pushRecordIds 必須是非空陣列',
        code: 'INVALID_PUSH_RECORD_IDS'
      });
    }

    // 查找推播記錄
    const pushRecords = await PushRecord.findAll({
      where: {
        id: pushRecordIds
      },
      include: [
        {
          model: Member,
          as: 'member',
          attributes: ['id', 'name', 'line_user_id']
        },
        {
          model: Event,
          as: 'event',
          attributes: ['id', 'title', 'date', 'location']
        }
      ]
    });

    if (pushRecords.length === 0) {
      return res.status(404).json({
        error: '找不到指定的推播記錄',
        code: 'PUSH_RECORDS_NOT_FOUND'
      });
    }

    let successCount = 0;
    let failedCount = 0;
    const results = [];

    // 逐一重推
    for (const record of (pushRecords as PushRecordWithRelations[])) {
      try {
        const member = record.member;
        const event = record.event;

        if (!member || !member.line_user_id) {
          throw new Error('會員未綁定 LINE 帳號或會員資料不存在');
        }

        if (!event) {
          throw new Error('活動資料不存在');
        }

        // 發送 LINE 推播
        const messageText = `🦁 北大獅子會活動提醒\n\n📅 活動：${event.title}\n⏰ 時間：${new Date(event.date).toLocaleString('zh-TW')}\n${event.location ? `📍 地點：${event.location}` : ''}\n\n請準時參加！`;

        await lineService.pushMessage(member.line_user_id, messageText);

        // 更新原記錄狀態為成功
        await PushRecord.update({ status: 'success' }, { where: { id: record.id } });

        // 記錄新的推播結果
        await pushService.recordPushResult({
          member_id: member.id,
          event_id: event.id,
          message_type: 'manual_resend',
          status: 'success'
        });

        successCount++;
        results.push({
          pushRecordId: record.id,
          memberId: member.id,
          memberName: member.name,
          eventTitle: event.title,
          status: 'success'
        });

      } catch (error) {
        console.error(`重推推播記錄 ${record.id} 失敗:`, error);

        // 記錄失敗結果
        await pushService.recordPushResult({
          member_id: record.member?.id || record.member_id,
          event_id: record.event?.id || record.event_id,
          message_type: 'manual_resend',
          status: 'failed'
        });

        failedCount++;
        results.push({
          pushRecordId: record.id,
          memberId: record.member?.id || record.member_id,
          memberName: record.member?.name || '未知成員',
          eventTitle: record.event?.title || '未知活動',
          status: 'failed',
          error: error instanceof Error ? error.message : '未知錯誤'
        });
      }
    }

    res.json({
      success: true,
      successCount,
      failedCount,
      totalCount: pushRecords.length,
      results,
      message: `重推完成！成功：${successCount}，失敗：${failedCount}`
    });

  } catch (error) {
    console.error('❌ 重推推播記錄失敗:', error);
    res.status(500).json({
      error: '重推推播記錄失敗',
      details: error instanceof Error ? error.message : '未知錯誤',
      code: 'RESEND_PUSH_FAILED'
    });
  }
});

export default router;
