import { Sequelize, Op } from 'sequelize';
import PushRecord from '../models/pushRecord';
import Member from '../models/member';
import Event from '../models/event';

interface PushStatistics {
  total: number;
  success: number;
  failed: number;
  successRate: number;
}

interface PushRecordData {
  member_id: string;
  event_id: string;
  message_type: string;
  status: 'success' | 'failed';
}

class PushService {
  /**
   * 記錄推播結果
   */
  async recordPushResult(data: PushRecordData): Promise<PushRecord> {
    try {
      return await PushRecord.create(data);
    } catch (error) {
      console.error('❌ 記錄推播結果失敗:', error);
      throw error;
    }
  }

  /**
   * 批量記錄推播結果
   */
  async recordBulkPushResults(records: PushRecordData[]): Promise<PushRecord[]> {
    try {
      return await PushRecord.bulkCreate(records);
    } catch (error) {
      console.error('❌ 批量記錄推播結果失敗:', error);
      throw error;
    }
  }

  /**
   * 獲取推播統計
   */
  async getPushStatistics(eventId: string): Promise<PushStatistics> {
    try {
      const total = await PushRecord.count({
        where: { event_id: eventId }
      });

      const success = await PushRecord.count({
        where: { 
          event_id: eventId,
          status: 'success'
        }
      });

      const failed = total - success;
      const successRate = total > 0 ? Math.round((success / total) * 100 * 100) / 100 : 0;

      return {
        total,
        success,
        failed,
        successRate
      };
    } catch (error) {
      console.error('❌ 獲取推播統計失敗:', error);
      throw error;
    }
  }

  /**
   * 獲取活動推播記錄
   */
  async getEventPushRecords(eventId: string, options: {
    limit?: number;
    offset?: number;
    messageType?: string;
  } = {}) {
    try {
      const { limit = 50, offset = 0, messageType } = options;

      const whereClause: any = { event_id: eventId };
      if (messageType) {
        whereClause.message_type = messageType;
      }

      const records = await PushRecord.findAndCountAll({
        where: whereClause,
        include: [
          {
            model: Member,
            as: 'member',
            attributes: ['id', 'name', 'phone', 'email']
          }
        ],
        order: [['pushed_at', 'DESC']],
        limit,
        offset
      });

      return {
        records: records.rows,
        total: records.count,
        limit,
        offset
      };
    } catch (error) {
      console.error('❌ 獲取活動推播記錄失敗:', error);
      throw error;
    }
  }

  /**
   * 檢查會員是否已收到特定類型推播
   */
  async checkMemberPushStatus(memberId: string, eventId: string, messageType: string): Promise<boolean> {
    try {
      const record = await PushRecord.findOne({
        where: {
          member_id: memberId,
          event_id: eventId,
          message_type: messageType,
          status: 'success'
        }
      });

      return !!record;
    } catch (error) {
      console.error('❌ 檢查會員推播狀態失敗:', error);
      return false;
    }
  }

  /**
   * 獲取會員推播記錄
   */
  async getMemberPushRecords(memberId: string, options: {
    limit?: number;
    offset?: number;
    messageType?: string;
  } = {}) {
    try {
      const { limit = 50, offset = 0, messageType } = options;

      const whereClause: any = { member_id: memberId };
      if (messageType) {
        whereClause.message_type = messageType;
      }

      const records = await PushRecord.findAll({
        where: whereClause,
        include: [
          {
            model: Event,
            as: 'event',
            attributes: ['id', 'title', 'date', 'status']
          }
        ],
        order: [['pushed_at', 'DESC']],
        limit,
        offset
      });

      return records;
    } catch (error) {
      console.error('❌ 獲取會員推播記錄失敗:', error);
      throw error;
    }
  }

  /**
   * 獲取明日活動（用於排程推播）
   */
  async getTomorrowEvents(): Promise<Event[]> {
    try {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(0, 0, 0, 0);

      const tomorrowEnd = new Date(tomorrow);
      tomorrowEnd.setHours(23, 59, 59, 999);

      return await Event.findAll({
        where: {
          date: {
            [Op.gte]: tomorrow,
            [Op.lte]: tomorrowEnd
          },
          status: 'active'
        }
      });
    } catch (error) {
      console.error('❌ 獲取明日活動失敗:', error);
      throw error;
    }
  }
}

export default new PushService();