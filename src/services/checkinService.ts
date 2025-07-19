import Checkin from '../models/checkin';
import { Member } from '../models/member';
import Event from '../models/event';
import { Op } from 'sequelize';

interface CheckinRecord {
  id: number;
  member_id: string;
  event_id: string;
  checked_in_at: Date;
  qr_code?: string;
}

interface CheckinData {
  member_id: string;
  event_id: string;
  device_info?: string;
  checkin_time?: Date;
}

interface CheckinSearchOptions {
  event_id?: string;
  member_id?: string;
  dateFrom?: Date;
  dateTo?: Date;
  limit?: number;
  offset?: number;
}

class CheckinService {
  /**
   * 執行簽到
   */
  async performCheckin(checkinData: CheckinData): Promise<Checkin> {
    try {
      // 驗證活動是否存在且有效
      const event = await Event.findByPk(checkinData.event_id);
      if (!event) {
        throw new Error('活動不存在');
      }

      if (event.status !== 'active') {
        throw new Error('活動已取消或不可用');
      }

      // 驗證會員是否存在且有效
      const member = await Member.findByPk(checkinData.member_id);
      if (!member) {
        throw new Error('會員不存在');
      }

      if (member.status !== 'active') {
        throw new Error('會員帳號已停用');
      }

      // 檢查是否已經簽到過
      const existingCheckin = await Checkin.findOne({
        where: {
          member_id: checkinData.member_id,
          event_id: checkinData.event_id
        }
      });

      if (existingCheckin) {
        throw new Error('您已經簽到過了');
      }

      // 檢查活動時間（可以提前30分鐘簽到，延後2小時簽到）
      const now = new Date();
      const eventDate = new Date(event.date);
      const thirtyMinutesBefore = new Date(eventDate.getTime() - 30 * 60 * 1000);
      const twoHoursAfter = new Date(eventDate.getTime() + 2 * 60 * 60 * 1000);

      if (now < thirtyMinutesBefore) {
        throw new Error('活動尚未開放簽到，請於活動前30分鐘再試');
      }

      if (now > twoHoursAfter) {
        throw new Error('簽到時間已過，無法簽到');
      }

      // 檢查是否有報名（可選檢查，根據業務需求）
      const registration = await Registration.findOne({
        where: {
          member_id: checkinData.member_id,
          event_id: checkinData.event_id,
          status: 'confirmed'
        }
      });

      // 如果沒有報名記錄，記錄警告但仍允許簽到
      if (!registration) {
        console.warn(`會員 ${member.name} 沒有報名活動 ${event.title} 但進行了簽到`);
      }

      // 執行簽到
      const checkin = await Checkin.create({
        member_id: checkinData.member_id,
        event_id: checkinData.event_id,
        checkin_time: checkinData.checkin_time || new Date(),
        device_info: checkinData.device_info
      });

      // 回傳完整的簽到資料
      return await Checkin.findByPk(checkin.id, {
        include: [
          { model: Member, as: 'member', attributes: ['id', 'name', 'email'] },
          { model: Event, as: 'event', attributes: ['id', 'title', 'date', 'location'] }
        ]
      }) as Checkin;

    } catch (error) {
      console.error('簽到失敗:', error);
      throw error;
    }
  }

  /**
   * 根據 ID 獲取簽到記錄
   */
  async getCheckinById(id: string): Promise<Checkin | null> {
    try {
      return await Checkin.findByPk(id, {
        include: [
          { model: Member, as: 'member', attributes: ['id', 'name', 'email', 'line_uid'] },
          { model: Event, as: 'event', attributes: ['id', 'title', 'date', 'location'] }
        ]
      });
    } catch (error) {
      console.error('獲取簽到記錄失敗:', error);
      throw error;
    }
  }

  /**
   * 檢查會員是否已簽到
   */
  async isCheckedIn(memberId: string, eventId: string): Promise<boolean> {
    try {
      const checkin = await Checkin.findOne({
        where: {
          member_id: memberId,
          event_id: eventId
        }
      });

      return !!checkin;
    } catch (error) {
      console.error('檢查簽到狀態失敗:', error);
      throw error;
    }
  }

  /**
   * 獲取會員的簽到記錄
   */
  async getMemberCheckins(memberId: string, options: Partial<CheckinSearchOptions> = {}) {
    try {
      const whereClause: any = { member_id: memberId };

      if (options.event_id) {
        whereClause.event_id = options.event_id;
      }

      if (options.dateFrom || options.dateTo) {
        whereClause.checkin_time = {};
        if (options.dateFrom) {
          whereClause.checkin_time[Op.gte] = options.dateFrom;
        }
        if (options.dateTo) {
          whereClause.checkin_time[Op.lte] = options.dateTo;
        }
      }

      const result = await Checkin.findAndCountAll({
        where: whereClause,
        include: [
          { model: Event, as: 'event', attributes: ['id', 'title', 'date', 'location'] }
        ],
        order: [['checkin_time', 'DESC']],
        limit: options.limit || 20,
        offset: options.offset || 0
      });

      return {
        checkins: result.rows,
        total: result.count,
        limit: options.limit || 20,
        offset: options.offset || 0
      };
    } catch (error) {
      console.error('獲取會員簽到記錄失敗:', error);
      throw error;
    }
  }

  /**
   * 獲取活動的簽到記錄
   */
  async getEventCheckins(eventId: string, options: Partial<CheckinSearchOptions> = {}) {
    try {
      const whereClause: any = { event_id: eventId };

      if (options.dateFrom || options.dateTo) {
        whereClause.checkin_time = {};
        if (options.dateFrom) {
          whereClause.checkin_time[Op.gte] = options.dateFrom;
        }
        if (options.dateTo) {
          whereClause.checkin_time[Op.lte] = options.dateTo;
        }
      }

      const result = await Checkin.findAndCountAll({
        where: whereClause,
        include: [
          { model: Member, as: 'member', attributes: ['id', 'name', 'email', 'phone'] }
        ],
        order: [['checkin_time', 'ASC']],
        limit: options.limit || 100,
        offset: options.offset || 0
      });

      return {
        checkins: result.rows,
        total: result.count,
        limit: options.limit || 100,
        offset: options.offset || 0
      };
    } catch (error) {
      console.error('獲取活動簽到記錄失敗:', error);
      throw error;
    }
  }

  /**
   * 獲取簽到統計
   */
  async getCheckinStats(eventId?: string) {
    try {
      if (eventId) {
        // 單一活動簽到統計
        const [checkinCount, registrationCount] = await Promise.all([
          Checkin.count({ where: { event_id: eventId } }),
          Registration.count({ where: { event_id: eventId, status: 'confirmed' } })
        ]);

        const attendanceRate = registrationCount > 0 ? (checkinCount / registrationCount) * 100 : 0;

        // 按小時統計簽到分布
        const checkins = await Checkin.findAll({
          where: { event_id: eventId },
          attributes: ['checkin_time'],
          order: [['checkin_time', 'ASC']]
        });

        const hourlyStats: { [hour: string]: number } = {};
        checkins.forEach(checkin => {
          const hour = new Date(checkin.checkin_time).getHours().toString().padStart(2, '0');
          hourlyStats[hour] = (hourlyStats[hour] || 0) + 1;
        });

        return {
          eventId,
          totalCheckins: checkinCount,
          totalRegistrations: registrationCount,
          attendanceRate: Math.round(attendanceRate * 100) / 100,
          hourlyDistribution: hourlyStats
        };
      } else {
        // 全體簽到統計
        const [totalCheckins, todayCheckins, thisWeekCheckins] = await Promise.all([
          Checkin.count(),
          Checkin.count({
            where: {
              checkin_time: {
                [Op.gte]: new Date(new Date().setHours(0, 0, 0, 0))
              }
            }
          }),
          Checkin.count({
            where: {
              checkin_time: {
                [Op.gte]: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
              }
            }
          })
        ]);

        return {
          totalCheckins,
          todayCheckins,
          thisWeekCheckins
        };
      }
    } catch (error) {
      console.error('獲取簽到統計失敗:', error);
      throw error;
    }
  }

  /**
   * 驗證簽到資格
   */
  async validateCheckinEligibility(memberId: string, eventId: string): Promise<{
    eligible: boolean;
    reason?: string;
    event?: Event;
    member?: Member;
    alreadyCheckedIn?: boolean;
  }> {
    try {
      // 檢查活動
      const event = await Event.findByPk(eventId);
      if (!event) {
        return { eligible: false, reason: '活動不存在' };
      }

      if (event.status !== 'active') {
        return { eligible: false, reason: '活動已取消或不可用', event };
      }

      // 檢查會員
      const member = await Member.findByPk(memberId);
      if (!member) {
        return { eligible: false, reason: '會員不存在', event };
      }

      if (member.status !== 'active') {
        return { eligible: false, reason: '會員帳號已停用', event, member };
      }

      // 檢查是否已簽到
      const alreadyCheckedIn = await this.isCheckedIn(memberId, eventId);
      if (alreadyCheckedIn) {
        return { eligible: false, reason: '已經簽到過了', event, member, alreadyCheckedIn: true };
      }

      // 檢查時間
      const now = new Date();
      const eventDate = new Date(event.date);
      const thirtyMinutesBefore = new Date(eventDate.getTime() - 30 * 60 * 1000);
      const twoHoursAfter = new Date(eventDate.getTime() + 2 * 60 * 60 * 1000);

      if (now < thirtyMinutesBefore) {
        return { 
          eligible: false, 
          reason: '活動尚未開放簽到，請於活動前30分鐘再試', 
          event, 
          member 
        };
      }

      if (now > twoHoursAfter) {
        return { 
          eligible: false, 
          reason: '簽到時間已過，無法簽到', 
          event, 
          member 
        };
      }

      return { eligible: true, event, member };
    } catch (error) {
      console.error('驗證簽到資格失敗:', error);
      throw error;
    }
  }

  /**
   * 取消簽到（管理員功能）
   */
  async cancelCheckin(checkinId: string): Promise<void> {
    try {
      const checkin = await Checkin.findByPk(checkinId);
      if (!checkin) {
        throw new Error('簽到記錄不存在');
      }

      await checkin.destroy();
    } catch (error) {
      console.error('取消簽到失敗:', error);
      throw error;
    }
  }

  /**
   * 獲取活動的報名記錄
   */
  async getEventRegistrations(eventId: string, options: Partial<CheckinSearchOptions> = {}) {
    try {
      const whereClause: any = { event_id: eventId };

      if (options.dateFrom || options.dateTo) {
        whereClause.created_at = {};
        if (options.dateFrom) {
          whereClause.created_at[Op.gte] = options.dateFrom;
        }
        if (options.dateTo) {
          whereClause.created_at[Op.lte] = options.dateTo;
        }
      }

      const result = await Registration.findAndCountAll({
        where: whereClause,
        include: [
          { model: Member, as: 'member', attributes: ['id', 'name', 'email', 'phone'] }
        ],
        order: [['created_at', 'ASC']],
        limit: options.limit || 1000,
        offset: options.offset || 0
      });

      return {
        registrations: result.rows,
        total: result.count,
        limit: options.limit || 1000,
        offset: options.offset || 0
      };
    } catch (error) {
      console.error('獲取活動報名記錄失敗:', error);
      throw error;
    }
  }

  async searchCheckins(options: CheckinSearchOptions) {
    try {
      const whereClause: Record<string, any> = {};

    } catch (error) {
      console.error('搜索簽到記錄失敗:', error);
      throw error;
    }
  }
}

export default new CheckinService();