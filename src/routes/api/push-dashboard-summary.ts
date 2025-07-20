import express from 'express';
import { authMiddleware } from '../../middleware/authMiddleware';
import { requireAnyRole } from '../../middleware/roleMiddleware';
import { Role } from '../../types/role';
import PushRecord from '../../models/pushRecord';
import { Op, fn, col } from 'sequelize';
import { QueryTypes } from 'sequelize';
import sequelize from '../../config/database';

const router = express.Router();

/**
 * 獲取推播統計總覽
 * GET /api/admin/push-dashboard-summary
 */
router.get(
  '/',
  authMiddleware,
  requireAnyRole([Role.Admin, Role.President]),
  async (req, res) => {
    try {
      const { startDate, endDate, messageType } = req.query;

      // 建立日期篩選條件
      const pushedAt: any = {};
      if (typeof startDate === 'string') {
        pushedAt[Op.gte] = new Date(startDate);
      }
      if (typeof endDate === 'string') {
        pushedAt[Op.lte] = new Date(endDate + 'T23:59:59');
      }

      // 建立查詢條件
      const where: any = {};
      if (Object.keys(pushedAt).length > 0) {
        where.pushed_at = pushedAt;
      }
      if (messageType && typeof messageType === 'string') {
        where.message_type = messageType;
      }

      // 1. 趨勢資料 - 按日期分組
      const trendQuery = `
      SELECT 
        DATE(pushed_at) as date,
        COUNT(CASE WHEN status = 'success' THEN 1 END) as success,
        COUNT(CASE WHEN status = 'failed' THEN 1 END) as fail
      FROM push_records 
      ${Object.keys(where).length > 0 ? 'WHERE ' : ''}
      ${where.pushed_at ? `pushed_at >= '${startDate || '1900-01-01'}' AND pushed_at <= '${endDate ? endDate + 'T23:59:59' : '2099-12-31T23:59:59'}'` : ''}
      ${where.message_type ? (where.pushed_at ? ' AND ' : '') + `message_type = '${where.message_type}'` : ''}
      GROUP BY DATE(pushed_at)
      ORDER BY DATE(pushed_at) DESC
      LIMIT 30
    `;

      const trendResult = (await sequelize.query(trendQuery, {
        type: QueryTypes.SELECT,
      })) as any[];

      // 2. 總覽統計 - 成功/失敗數量
      const summaryResult = (await PushRecord.findAll({
        where,
        attributes: ['status', [fn('COUNT', col('*')), '_count']],
        group: ['status'],
        raw: true,
      })) as any[];

      // 3. 活動推播統計 - 各活動成功/失敗數量
      const topEventsResult = (await PushRecord.findAll({
        where,
        attributes: ['event_id', 'status', [fn('COUNT', col('*')), '_count']],
        group: ['event_id', 'status'],
        order: [[fn('COUNT', col('*')), 'DESC']],
        limit: 20,
        raw: true,
      })) as any[];

      // 獲取失敗推播的詳細 ID 列表
      const failedPushRecords = (await PushRecord.findAll({
        where: {
          ...where,
          status: 'failed',
        },
        attributes: ['id', 'event_id'],
        raw: true,
      })) as any[];

      // 將失敗 ID 按活動分組
      const failedIdsByEvent = failedPushRecords.reduce(
        (acc: any, record: any) => {
          if (!acc[record.event_id]) {
            acc[record.event_id] = [];
          }
          acc[record.event_id].push(record.id);
          return acc;
        },
        {}
      );

      // 為每個 topEvent 添加 pushRecordIds
      const topEventsWithIds = topEventsResult.map((event: any) => ({
        ...event,
        pushRecordIds:
          event.status === 'failed'
            ? failedIdsByEvent[event.event_id] || []
            : [],
      }));

      // 格式化回傳資料
      const trend = trendResult.map((item: any) => ({
        date: item.date,
        success: parseInt(item.success) || 0,
        fail: parseInt(item.fail) || 0,
      }));

      const summary = summaryResult.map((item: any) => ({
        status: item.status,
        _count: parseInt(item._count) || 0,
      }));

      const topEvents = topEventsWithIds
        .filter((item: any) => item.event_id) // 過濾空的 event_id
        .map((item: any) => ({
          eventId: item.event_id,
          status: item.status,
          _count: parseInt(item._count) || 0,
          pushRecordIds: item.pushRecordIds || [],
        }));

      res.json({
        success: true,
        data: {
          trend,
          summary,
          topEvents,
        },
        filters: {
          startDate: startDate || null,
          endDate: endDate || null,
          messageType: messageType || null,
        },
      });
    } catch (error) {
      console.error('❌ 獲取推播統計失敗:', error);
      res.status(500).json({
        error: '獲取推播統計失敗',
        details: error instanceof Error ? error.message : '未知錯誤',
      });
    }
  }
);

export default router;
