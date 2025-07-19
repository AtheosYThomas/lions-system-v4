
import express from 'express';
import pushService from '../../services/pushService';
import { authMiddleware } from '../../middleware/authMiddleware';
import { roleMiddleware } from '../../middleware/roleMiddleware';

const router = express.Router();

/**
 * 查詢推播記錄 API
 * GET /api/admin/push-records
 * 支援 Query 參數：eventId, memberId, limit
 */
router.get('/', authMiddleware, roleMiddleware(['admin', 'superadmin']), async (req, res) => {
  try {
    const { eventId, memberId, limit = '200' } = req.query;

    // 驗證參數
    if (!eventId && !memberId) {
      return res.status(400).json({
        error: '請提供 eventId 或 memberId 查詢',
        code: 'MISSING_QUERY_PARAMS'
      });
    }

    // 驗證參數型別
    if (eventId && typeof eventId !== 'string') {
      return res.status(400).json({
        error: 'eventId 必須是字串',
        code: 'INVALID_EVENT_ID'
      });
    }

    if (memberId && typeof memberId !== 'string') {
      return res.status(400).json({
        error: 'memberId 必須是字串',
        code: 'INVALID_MEMBER_ID'
      });
    }

    const limitNum = parseInt(limit as string);
    if (isNaN(limitNum) || limitNum <= 0 || limitNum > 1000) {
      return res.status(400).json({
        error: 'limit 必須是 1-1000 之間的數字',
        code: 'INVALID_LIMIT'
      });
    }

    let records;

    if (eventId) {
      // 查詢特定活動的推播記錄
      const result = await pushService.getEventPushRecords(eventId as string, {
        limit: limitNum,
        offset: 0
      });
      records = result.records;
    } else if (memberId) {
      // 查詢特定會員的推播記錄
      records = await pushService.getMemberPushRecords(memberId as string, {
        limit: limitNum,
        offset: 0
      });
    }

    res.json({
      success: true,
      data: records,
      count: records?.length || 0,
      query: {
        eventId: eventId || null,
        memberId: memberId || null,
        limit: limitNum
      }
    });

  } catch (error) {
    console.error('❌ 查詢推播記錄失敗:', error);
    res.status(500).json({
      error: '查詢推播記錄失敗',
      details: error instanceof Error ? error.message : '未知錯誤',
      code: 'QUERY_FAILED'
    });
  }
});

/**
 * 查詢推播統計 API
 * GET /api/admin/push-records/stats/:eventId
 */
router.get('/stats/:eventId', authMiddleware, roleMiddleware(['admin', 'superadmin']), async (req, res) => {
  try {
    const { eventId } = req.params;

    if (!eventId) {
      return res.status(400).json({
        error: '缺少 eventId 參數',
        code: 'MISSING_EVENT_ID'
      });
    }

    const stats = await pushService.getPushStatistics(eventId);

    res.json({
      success: true,
      data: stats,
      eventId
    });

  } catch (error) {
    console.error('❌ 查詢推播統計失敗:', error);
    res.status(500).json({
      error: '查詢推播統計失敗',
      details: error instanceof Error ? error.message : '未知錯誤',
      code: 'STATS_QUERY_FAILED'
    });
  }
});

export default router;
