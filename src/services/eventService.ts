import Event from '../models/event';
import Registration from '../models/registration';
import Checkin from '../models/checkin';
import Payment from '../models/payment';
import Member from '../models/member';
import { Op } from 'sequelize';

interface EventCreationData {
  title: string;
  description?: string;
  date: Date;
  location?: string;
  max_attendees?: number;
  status?: string;
  created_at?: Date;
}

interface EventUpdateData extends Partial<EventCreationData> {
  id: string;
}

interface EventSearchOptions {
  title?: string;
  status?: string;
  dateFrom?: Date;
  dateTo?: Date;
  location?: string;
  limit?: number;
  offset?: number;
}

class EventService {
  /**
   * 創建新活動
   */
  async createEvent(eventData: EventCreationData): Promise<Event> {
    try {
      // 檢查活動時間是否有衝突
      const conflictingEvent = await Event.findOne({
        where: {
          date: eventData.date,
          status: 'active'
        }
      });

      if (conflictingEvent) {
        console.warn(`活動時間衝突警告: ${eventData.date} 已有活動 "${conflictingEvent.title}"`);
      }

      const event = await Event.create({
        id: require('crypto').randomUUID(),
        ...eventData,
        status: eventData.status || 'active',
        created_at: eventData.created_at || new Date()
      });

      return event;
    } catch (error) {
      console.error('創建活動失敗:', error);
      throw error;
    }
  }

  /**
   * 根據 ID 獲取活動
   */
  async getEventById(id: string, includeStats: boolean = false): Promise<Event | null> {
    try {
      const includeOptions = [];

      if (includeStats) {
        includeOptions.push(
          {
            model: Registration,
            as: 'registrations',
            include: [{ model: Member, as: 'member', attributes: ['id', 'name', 'email'] }]
          },
          {
            model: Checkin,
            as: 'checkins',
            include: [{ model: Member, as: 'member', attributes: ['id', 'name', 'email'] }]
          },
          {
            model: Payment,
            as: 'payments',
            include: [{ model: Member, as: 'member', attributes: ['id', 'name', 'email'] }]
          }
        );
      }

      return await Event.findByPk(id, {
        include: includeOptions
      });
    } catch (error) {
      console.error('獲取活動失敗:', error);
      throw error;
    }
  }

  /**
   * 搜尋活動
   */
  async searchEvents(options: EventSearchOptions) {
    try {
      const whereClause: any = {};

      if (options.title) {
        whereClause.title = {
          [Op.iLike]: `%${options.title}%`
        };
      }

      if (options.status) {
        whereClause.status = options.status;
      }

      if (options.location) {
        whereClause.location = {
          [Op.iLike]: `%${options.location}%`
        };
      }

      if (options.dateFrom || options.dateTo) {
        whereClause.date = {};
        if (options.dateFrom) {
          whereClause.date[Op.gte] = options.dateFrom;
        }
        if (options.dateTo) {
          whereClause.date[Op.lte] = options.dateTo;
        }
      }

      const result = await Event.findAndCountAll({
        where: whereClause,
        limit: options.limit || 20,
        offset: options.offset || 0,
        order: [['date', 'DESC']],
        include: [
          {
            model: Registration,
            as: 'registrations',
            attributes: ['id'],
            required: false
          }
        ]
      });

      return {
        events: result.rows,
        total: result.count,
        limit: options.limit || 20,
        offset: options.offset || 0
      };
    } catch (error) {
      console.error('搜尋活動失敗:', error);
      throw error;
    }
  }

  /**
   * 更新活動
   */
  async updateEvent(updateData: EventUpdateData): Promise<Event> {
    try {
      const event = await Event.findByPk(updateData.id);

      if (!event) {
        throw new Error('活動不存在');
      }

      // 如果要更新活動時間，檢查是否有衝突
      if (updateData.date && updateData.date.getTime() !== event.date.getTime()) {
        const conflictingEvent = await Event.findOne({
          where: {
            date: updateData.date,
            status: 'active',
            id: { [Op.not]: updateData.id }
          }
        });

        if (conflictingEvent) {
          console.warn(`活動時間衝突警告: ${updateData.date} 已有活動 "${conflictingEvent.title}"`);
        }
      }

      await event.update(updateData);
      return event;
    } catch (error) {
      console.error('更新活動失敗:', error);
      throw error;
    }
  }

  /**
   * 刪除活動
   */
  async deleteEvent(id: string): Promise<void> {
    try {
      const event = await Event.findByPk(id);

      if (!event) {
        throw new Error('活動不存在');
      }

      // 檢查是否有相關的報名或簽到記錄
      const [registrationCount, checkinCount] = await Promise.all([
        Registration.count({ where: { event_id: id } }),
        Checkin.count({ where: { event_id: id } })
      ]);

      if (registrationCount > 0 || checkinCount > 0) {
        // 軟刪除：設定狀態為 cancelled
        await event.update({ status: 'cancelled' });
      } else {
        // 硬刪除：沒有相關記錄時可以直接刪除
        await event.destroy();
      }
    } catch (error) {
      console.error('刪除活動失敗:', error);
      throw error;
    }
  }

  /**
   * 獲取活動統計資料
   */
  async getEventStats(eventId?: string) {
    try {
      if (eventId) {
        // 單一活動統計
        const [registrationCount, checkinCount, paymentCount] = await Promise.all([
          Registration.count({ where: { event_id: eventId, status: 'confirmed' } }),
          Checkin.count({ where: { event_id: eventId } }),
          Payment.count({ where: { event_id: eventId, status: 'completed' } })
        ]);

        const event = await Event.findByPk(eventId);
        const attendanceRate = registrationCount > 0 ? (checkinCount / registrationCount) * 100 : 0;

        const availableSlots = event?.max_attendees !== undefined ? event.max_attendees - registrationCount : null;

        return {
          eventId,
          eventTitle: event?.title,
          maxAttendees: event?.max_attendees ?? null,
          registrations: registrationCount,
          checkins: checkinCount,
          payments: paymentCount,
          attendanceRate: Math.round(attendanceRate * 100) / 100,
          availableSlots: availableSlots
        };
      } else {
        // 全體活動統計
        const [totalEvents, activeEvents, cancelledEvents, upcomingEvents] = await Promise.all([
          Event.count(),
          Event.count({ where: { status: 'active' } }),
          Event.count({ where: { status: 'cancelled' } }),
          Event.count({ 
            where: { 
              status: 'active',
              date: { [Op.gte]: new Date() }
            }
          })
        ]);

        return {
          totalEvents,
          activeEvents,
          cancelledEvents,
          upcomingEvents,
          pastEvents: activeEvents - upcomingEvents
        };
      }
    } catch (error) {
      console.error('獲取活動統計失敗:', error);
      throw error;
    }
  }

  /**
   * 獲取即將到來的活動
   */
  async getUpcomingEvents(limit: number = 5): Promise<Event[]> {
    try {
      return await Event.findAll({
        where: {
          status: 'active',
          date: { [Op.gte]: new Date() }
        },
        order: [['date', 'ASC']],
        limit,
        include: [
          {
            model: Registration,
            as: 'registrations',
            attributes: ['id'],
            required: false
          }
        ]
      });
    } catch (error) {
      console.error('獲取即將到來的活動失敗:', error);
      throw error;
    }
  }

  /**
   * 檢查活動名額
   */
  async checkEventCapacity(eventId: string): Promise<{
    maxAttendees: number | null;
    currentRegistrations: number;
    availableSlots: number | null;
    isFull: boolean;
  }> {
    try {
      const event = await Event.findByPk(eventId);
      if (!event) {
        throw new Error('活動不存在');
      }

      const currentRegistrations = await Registration.count({
        where: { 
          event_id: eventId,
          status: 'confirmed'
        }
      });

      const availableSlots: number | null = typeof event.max_attendees === 'number'
        ? event.max_attendees - currentRegistrations
        : null;
      const isFull = event.max_attendees ? currentRegistrations >= event.max_attendees : false;

      return {
        maxAttendees: event.max_attendees,
        currentRegistrations,
        availableSlots,
        isFull
      };
    } catch (error) {
      console.error('檢查活動名額失敗:', error);
      throw error;
    }
  }
}

export default new EventService();