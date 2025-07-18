import Member from '../models/member';
import Event from '../models/event';
import Registration from '../models/registration';
import Checkin from '../models/checkin';
import sequelize from '../config/database';
import { Op } from 'sequelize';

interface ReportFilters {
  status?: string;
  eventId?: string;
  dateFrom?: Date;
  dateTo?: Date;
}

class AdminService {
  async getDashboardStats() {
    // Implementation for dashboard stats
    return {
      totalMembers: 0,
      totalEvents: 0,
      totalAnnouncements: 0,
      totalRegistrations: 0
    };
  }

  async getSystemOverview() {
    return this.getSystemSummary();
  }

  async getEventReport() {
    return this.exportEventsReport({});
  }
  // 系統總覽統計
  async getSystemSummary() {
    try {
      console.log('📊 開始獲取系統總覽...');

      // 並行查詢各項統計
      const [
        memberCount,
        activeMembers,
        registrationCount,
        eventCount,
        checkinCount
      ] = await Promise.all([
        Member.count(),
        Member.count({ where: { status: 'active' } }),
        Registration.count(),
        Event.count(),
        Checkin.count()
      ]);

      const summary = {
        memberCount,
        activeMembers,
        registrationCount,
        eventCount,
        checkinCount,
        timestamp: new Date().toISOString(),
        status: 'active'
      };

      console.log('✅ 系統總覽統計完成:', summary);
      return summary;
    } catch (error) {
      console.error('❌ 系統總覽統計失敗:', error);
      throw error;
    }
  }

  // 報名統計
  async getRegistrationStats() {
    try {
      const stats = await Registration.findAll({
        attributes: [
          'event_id',
          [sequelize.fn('COUNT', '*'), 'count']
        ],
        group: ['event_id', 'Event.id', 'Event.title', 'Event.date'],
        include: [{
          model: Event,
          attributes: ['title', 'date'],
          required: false
        }]
      });

      return stats;
    } catch (error) {
      console.error('❌ 報名統計失敗:', error);
      throw error;
    }
  }

  // 會員統計
  async getMemberStats() {
    try {
      console.log('📊 開始計算會員統計...');

      // 分別查詢各項統計，確保準確性
      const [total, active, inactive, officers, members, withLineAccount] = await Promise.all([
        Member.count(),
        Member.count({ where: { status: 'active' } }),
        Member.count({ where: { status: 'inactive' } }),
        Member.count({ where: { role: 'officer' } }),
        Member.count({ where: { role: 'member' } }),
        Member.count({ 
          where: { 
            line_user_id: { [Op.ne]: null },
            status: 'active'
          }
        })
      ]);

      const stats = {
        total,
        active,
        inactive,
        officers,
        members,
        withLineAccount
      };

      console.log('✅ 會員統計結果:', stats);
      return stats;
    } catch (error) {
      console.error('❌ 會員統計失敗:', error);
      throw error;
    }
  }

  // 活動統計
  async getEventStats() {
    try {
      const eventStats = await Event.findAll({
        attributes: [
          'status',
          [sequelize.fn('COUNT', '*'), 'count'],
          [sequelize.fn('AVG', sequelize.col('max_participants')), 'avgCapacity']
        ],
        group: ['status']
      });

      return eventStats;
    } catch (error) {
      console.error('❌ 活動統計失敗:', error);
      throw error;
    }
  }

  // 簽到統計
  async getCheckinStats() {
    try {
      const checkinStats = await Checkin.findAll({
        attributes: [
          [sequelize.fn('DATE', sequelize.col('created_at')), 'date'],
          [sequelize.fn('COUNT', '*'), 'count']
        ],
        group: [sequelize.fn('DATE', sequelize.col('created_at'))],
        order: [[sequelize.fn('DATE', sequelize.col('created_at')), 'DESC']],
        limit: 30
      });

      return checkinStats;
    } catch (error) {
      console.error('❌ 簽到統計失敗:', error);
      throw error;
    }
  }

  // 匯出會員報表
  async exportMembersReport(filters: ReportFilters, format: string = 'json') {
    try {
      const whereClause: any = {};

      if (filters.status) {
        whereClause.status = filters.status;
      }

      if (filters.dateFrom || filters.dateTo) {
        whereClause.created_at = {};
        if (filters.dateFrom) {
          whereClause.created_at[Op.gte] = filters.dateFrom;
        }
        if (filters.dateTo) {
          whereClause.created_at[Op.lte] = filters.dateTo;
        }
      }

      const members = await Member.findAll({
        where: whereClause,
        order: [['created_at', 'DESC']]
      });

      if (format === 'csv') {
        return this.convertToCSV(members, [
          'id', 'name', 'email', 'phone', 'status', 'line_user_id', 'created_at'
        ]);
      }

      return members;
    } catch (error) {
      console.error('❌ 會員報表匯出失敗:', error);
      throw error;
    }
  }

  // 匯出活動報表
  async exportEventsReport(filters: ReportFilters, format: string = 'json') {
    try {
      const whereClause: any = {};

      if (filters.status) {
        whereClause.status = filters.status;
      }

      if (filters.dateFrom || filters.dateTo) {
        whereClause.date = {};
        if (filters.dateFrom) {
          whereClause.date[Op.gte] = filters.dateFrom;
        }
        if (filters.dateTo) {
          whereClause.date[Op.lte] = filters.dateTo;
        }
      }

      const events = await Event.findAll({
        where: whereClause,
        include: [
          {
            model: Registration,
            attributes: [],
            required: false
          }
        ],
        attributes: [
          'id', 'title', 'description', 'date', 'location', 
          'max_participants', 'status', 'created_at',
          [sequelize.fn('COUNT', sequelize.col('Registrations.id')), 'registrationCount']
        ],
        group: ['Event.id'],
        order: [['date', 'DESC']]
      });

      if (format === 'csv') {
        return this.convertToCSV(events, [
          'id', 'title', 'date', 'location', 'max_participants', 
          'status', 'registrationCount', 'created_at'
        ]);
      }

      return events;
    } catch (error) {
      console.error('❌ 活動報表匯出失敗:', error);
      throw error;
    }
  }

  // 匯出報名報表
  async exportRegistrationsReport(filters: ReportFilters, format: string = 'json') {
    try {
      const whereClause: any = {};

      if (filters.eventId) {
        whereClause.event_id = filters.eventId;
      }

      if (filters.status) {
        whereClause.status = filters.status;
      }

      if (filters.dateFrom || filters.dateTo) {
        whereClause.created_at = {};
        if (filters.dateFrom) {
          whereClause.created_at[Op.gte] = filters.dateFrom;
        }
        if (filters.dateTo) {
          whereClause.created_at[Op.lte] = filters.dateTo;
        }
      }

      const registrations = await Registration.findAll({
        where: whereClause,
        include: [
          {
            model: Member,
            attributes: ['name', 'email', 'phone']
          },
          {
            model: Event,
            attributes: ['title', 'date', 'location']
          }
        ],
        order: [['created_at', 'DESC']]
      });

      if (format === 'csv') {
        return this.convertToCSV(registrations, [
          'id', 'Member.name', 'Member.email', 'Event.title', 
          'Event.date', 'status', 'created_at'
        ]);
      }

      return registrations;
    } catch (error) {
      console.error('❌ 報名報表匯出失敗:', error);
      throw error;
    }
  }

  // 匯出簽到報表
  async exportCheckinsReport(filters: ReportFilters, format: string = 'json') {
    try {
      const whereClause: any = {};

      if (filters.eventId) {
        whereClause.event_id = filters.eventId;
      }

      if (filters.dateFrom || filters.dateTo) {
        whereClause.created_at = {};
        if (filters.dateFrom) {
          whereClause.created_at[Op.gte] = filters.dateFrom;
        }
        if (filters.dateTo) {
          whereClause.created_at[Op.lte] = filters.dateTo;
        }
      }

      const checkins = await Checkin.findAll({
        where: whereClause,
        include: [
          {
            model: Member,
            attributes: ['name', 'email', 'line_user_id']
          },
          {
            model: Event,
            attributes: ['title', 'date', 'location']
          }
        ],
        order: [['created_at', 'DESC']]
      });

      if (format === 'csv') {
        return this.convertToCSV(checkins, [
          'id', 'Member.name', 'Member.email', 'Event.title', 
          'Event.date', 'checkin_time', 'created_at'
        ]);
      }

      return checkins;
    } catch (error) {
      console.error('❌ 簽到報表匯出失敗:', error);
      throw error;
    }
  }

  // 綜合報表
  async exportComprehensiveReport(filters: ReportFilters, format: string = 'json') {
    try {
      const [
        systemSummary,
        memberStats,
        eventStats,
        registrationStats,
        checkinStats
      ] = await Promise.all([
        this.getSystemSummary(),
        this.getMemberStats(),
        this.getEventStats(),
        this.getRegistrationStats(),
        this.getCheckinStats()
      ]);

      const comprehensiveReport = {
        timestamp: new Date().toISOString(),
        systemSummary,
        memberStats,
        eventStats,
        registrationStats,
        checkinStats,
        filters
      };

      if (format === 'csv') {
        // 對於綜合報表，我們創建一個簡化的 CSV 格式
        const csvData = [
          ['報表類型', '數值', '描述'],
          ['總會員數', systemSummary.memberCount, '系統中所有會員'],
          ['活躍會員數', systemSummary.activeMembers, '狀態為活躍的會員'],
          ['總報名數', systemSummary.registrationCount, '所有活動報名總數'],
          ['總活動數', systemSummary.eventCount, '系統中所有活動'],
          ['總簽到數', systemSummary.checkinCount, '所有簽到記錄']
        ];

        return csvData.map(row => row.join(',')).join('\n');
      }

      return comprehensiveReport;
    } catch (error) {
      console.error('❌ 綜合報表匯出失敗:', error);
      throw error;
    }
  }

  // 輔助方法：轉換為 CSV 格式
  private convertToCSV(data: any[], fields: string[]): string {
    try {
      if (!data || data.length === 0) {
        return fields.join(',') + '\n';
      }

      const headers = fields.join(',');
      const rows = data.map(item => {
        return fields.map(field => {
          // 處理嵌套屬性 (如 Member.name)
          const value = field.includes('.') ? 
            field.split('.').reduce((obj, key) => obj?.[key], item) : 
            item[field];

          // 處理 CSV 中的特殊字符
          const stringValue = String(value || '');
          return stringValue.includes(',') || stringValue.includes('\n') || stringValue.includes('"') ?
            `"${stringValue.replace(/"/g, '""')}"` : stringValue;
        }).join(',');
      });

      return [headers, ...rows].join('\n');
    } catch (error) {
      console.error('❌ CSV 轉換失敗:', error);
      throw error;
    }
  }
}

export default new AdminService();