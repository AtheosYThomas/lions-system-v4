import express from 'express';
import pushService from '../../services/pushService';
import { authMiddleware } from '../../middleware/authMiddleware';
import { requireAnyRole } from '../../middleware/roleMiddleware';
import { Role } from '../../types/role';
import PushRecord from '../../models/pushRecord';
import Event from '../../models/event';

// 定義包含 event 關聯的 PushRecord 型別
type PushRecordWithEvent = PushRecord & {
  event: Event | null;
};

const router = express.Router();

/**
 * 匯出會員推播記錄為 CSV
 * GET /api/push-records/export
 */
router.get(
  '/',
  authMiddleware,
  requireAnyRole([Role.Admin, Role.President]),
  async (req, res) => {
    try {
      const { memberId, startDate, endDate } = req.query;

      // 驗證參數
      if (!memberId || typeof memberId !== 'string') {
        return res.status(400).json({
          error: 'memberId 必填且必須是字串',
          code: 'MISSING_MEMBER_ID',
        });
      }

      // 驗證日期參數
      if (startDate && typeof startDate !== 'string') {
        return res.status(400).json({
          error: 'startDate 必須是字串',
          code: 'INVALID_START_DATE',
        });
      }

      if (endDate && typeof endDate !== 'string') {
        return res.status(400).json({
          error: 'endDate 必須是字串',
          code: 'INVALID_END_DATE',
        });
      }

      // 獲取會員推播記錄 (直接查詢以包含關聯)
      const { Op } = require('sequelize');
      const PushRecord = require('../../models/pushRecord').default;
      const Event = require('../../models/event').default;

      const whereClause: any = {
        member_id: memberId,
      };

      // 加入日期篩選
      if (startDate || endDate) {
        whereClause.pushed_at = {};
        if (startDate) {
          whereClause.pushed_at[Op.gte] = new Date(startDate);
        }
        if (endDate) {
          whereClause.pushed_at[Op.lte] = new Date(endDate + ' 23:59:59');
        }
      }

      const records = await PushRecord.findAll({
        where: whereClause,
        include: [
          {
            model: Event,
            as: 'event',
            required: false,
          },
        ],
        order: [['pushed_at', 'DESC']],
        limit: 10000,
      });

      // 轉換為 CSV 格式
      const csvHeader = '活動名稱,活動日期,推播時間,狀態,類型\n';
      const csvRows = records.map((record: PushRecordWithEvent) => {
        const eventTitle = record.event?.title || 'N/A';
        const eventDate = record.event?.date
          ? new Date(record.event.date).toISOString().split('T')[0]
          : 'N/A';
        const pushedAt = new Date(record.pushed_at).toISOString();
        const status = record.status === 'success' ? '成功' : '失敗';
        const messageType = record.message_type || 'N/A';

        // 處理 CSV 特殊字元（逗號、引號等）
        const escapeCSV = (str: string) => {
          if (str.includes(',') || str.includes('"') || str.includes('\n')) {
            return `"${str.replace(/"/g, '""')}"`;
          }
          return str;
        };

        return [
          escapeCSV(eventTitle),
          escapeCSV(eventDate),
          escapeCSV(pushedAt),
          escapeCSV(status),
          escapeCSV(messageType),
        ].join(',');
      });

      const csvContent = csvHeader + csvRows.join('\n');

      // 設定回應標頭
      const filename = `push_records_${memberId}_${new Date().toISOString().split('T')[0]}.csv`;
      res.setHeader('Content-Type', 'text/csv; charset=utf-8');
      res.setHeader(
        'Content-Disposition',
        `attachment; filename="${filename}"`
      );

      // 加入 BOM 以確保中文字在 Excel 中正確顯示
      res.send('\uFEFF' + csvContent);
    } catch (error) {
      console.error('❌ 匯出推播記錄失敗:', error);
      res.status(500).json({
        error: '匯出推播記錄失敗',
        details: error instanceof Error ? error.message : '未知錯誤',
        code: 'EXPORT_FAILED',
      });
    }
  }
);

export default router;
