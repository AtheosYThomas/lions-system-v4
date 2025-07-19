import { Registration } from '../models/registration';
import Event from '../models/event';
import { Member } from '../models/member';
import { RegistrationInput } from '../types/entities';
import { Op } from 'sequelize';

interface RegistrationData {
  member_id: string;
  event_id: string;
  status?: string;
}

interface RegistrationSearchOptions {
  event_id?: string;
  member_id?: string;
  status?: string;
  dateFrom?: Date;
  dateTo?: Date;
  limit?: number;
  offset?: number;
}

class RegistrationService {
  /**
   * 創建報名
   */
  async createRegistration(registrationData: RegistrationData): Promise<Registration> {
    try {
      // 驗證活動是否存在且有效
      const event = await Event.findByPk(registrationData.event_id);
      if (!event) {
        throw new Error('活動不存在');
      }

      if (event.status !== 'active') {
        throw new Error('活動已取消或不開放報名');
      }

      // 檢查活動時間是否已過
      const now = new Date();
      if (event.date < now) {
        throw new Error('活動已結束，無法報名');
      }

      // 驗證會員是否存在且有效
      const member = await Member.findByPk(registrationData.member_id);
      if (!member) {
        throw new Error('會員不存在');
      }

      if (member.status !== 'active') {
        throw new Error('會員帳號已停用，無法報名');
      }

      // 檢查是否已經報名過
      const existingRegistration = await Registration.findOne({
        where: {
          member_id: registrationData.member_id,
          event_id: registrationData.event_id
        }
      });

      if (existingRegistration) {
        if (existingRegistration.status === 'confirmed') {
          throw new Error('您已經報名過此活動了');
        } else if (existingRegistration.status === 'cancelled') {
          // 重新啟用已取消的報名
          await existingRegistration.update({
            status: 'confirmed',
            registration_date: new Date()
          });
          return existingRegistration;
        }
      }

      // 檢查活動名額限制
      if (event.max_attendees) {
        const currentRegistrations = await Registration.count({
          where: {
            event_id: registrationData.event_id,
            status: 'confirmed'
          }
        });

        if (currentRegistrations >= event.max_attendees) {
          throw new Error('活動名額已滿，無法報名');
        }
      }

      // 創建報名記錄
      const registration = await Registration.create({
        member_id: registrationData.member_id,
        event_id: registrationData.event_id,
        status: registrationData.status || 'confirmed',
        registration_date: new Date()
      });

      // 回傳完整的報名資料
      return await Registration.findByPk(registration.id, {
        include: [
          { model: Member, as: 'member', attributes: ['id', 'name', 'email', 'phone'] },
          { model: Event, as: 'event', attributes: ['id', 'title', 'date', 'location', 'max_attendees'] }
        ]
      }) as Registration;

    } catch (error) {
      console.error('創建報名失敗:', error);
      throw error;
    }
  }

  /**
   * 根據 ID 獲取報名記錄
   */
  async getRegistrationById(id: string): Promise<Registration | null> {
    try {
      return await Registration.findByPk(id, {
        include: [
          { model: Member, as: 'member', attributes: ['id', 'name', 'email', 'phone'] },
          { model: Event, as: 'event', attributes: ['id', 'title', 'date', 'location', 'max_attendees'] }
        ]
      });
    } catch (error) {
      console.error('獲取報名記錄失敗:', error);
      throw error;
    }
  }

  /**
   * 檢查會員是否已報名活動
   */
  async isRegistered(memberId: string, eventId: string): Promise<{
    registered: boolean;
    registration?: Registration;
    status?: string;
  }> {
    try {
      const registration = await Registration.findOne({
        where: {
          member_id: memberId,
          event_id: eventId
        },
        include: [
          { model: Event, as: 'event', attributes: ['id', 'title', 'date'] }
        ]
      });

      if (!registration) {
        return { registered: false };
      }

      return {
        registered: registration.status === 'confirmed',
        registration,
        status: registration.status
      };
    } catch (error) {
      console.error('檢查報名狀態失敗:', error);
      throw error;
    }
  }

  /**
   * 搜尋報名記錄
   */
  async searchRegistrations(options: RegistrationSearchOptions) {
    try {
      const whereClause: Record<string, any> = {};

      if (options.event_id) {
        whereClause.event_id = options.event_id;
      }

      if (options.member_id) {
        whereClause.member_id = options.member_id;
      }

      if (options.status) {
        whereClause.status = options.status;
      }

      if (options.dateFrom || options.dateTo) {
        whereClause.registration_date = {};
        if (options.dateFrom) {
          whereClause.registration_date[Op.gte] = options.dateFrom;
        }
        if (options.dateTo) {
          whereClause.registration_date[Op.lte] = options.dateTo;
        }
      }

      const result = await Registration.findAndCountAll({
        where: whereClause,
        include: [
          { model: Member, as: 'member', attributes: ['id', 'name', 'email', 'phone'] },
          { model: Event, as: 'event', attributes: ['id', 'title', 'date', 'location'] }
        ],
        order: [['registration_date', 'DESC']],
        limit: options.limit || 20,
        offset: options.offset || 0
      });

      return {
        registrations: result.rows,
        total: result.count,
        limit: options.limit || 20,
        offset: options.offset || 0
      };
    } catch (error) {
      console.error('搜尋報名記錄失敗:', error);
      throw error;
    }
  }

  /**
   * 取消報名
   */
  async cancelRegistration(registrationId: string): Promise<Registration> {
    try {
      const registration = await Registration.findByPk(registrationId, {
        include: [
          { model: Event, as: 'event', attributes: ['id', 'title', 'date'] }
        ]
      });

      if (!registration) {
        throw new Error('報名記錄不存在');
      }

      if (registration.status === 'cancelled') {
        throw new Error('報名已經取消過了');
      }

      // 檢查是否還能取消報名（活動前24小時）
      const event = (registration as any).event;
      if (event) {
        const now = new Date();
        const eventDate = new Date(event.date);
        const twentyFourHoursBefore = new Date(eventDate.getTime() - 24 * 60 * 60 * 1000);

        if (now > twentyFourHoursBefore) {
          throw new Error('活動前24小時內無法取消報名');
        }
      }

      await registration.update({ status: 'cancelled' });
      return registration;
    } catch (error) {
      console.error('取消報名失敗:', error);
      throw error;
    }
  }

  /**
   * 更新報名狀態
   */
  async updateRegistrationStatus(registrationId: string, status: string): Promise<Registration> {
    try {
      const registration = await Registration.findByPk(registrationId);

      if (!registration) {
        throw new Error('報名記錄不存在');
      }

      const validStatuses = ['confirmed', 'pending', 'cancelled', 'waitlist'];
      if (!validStatuses.includes(status)) {
        throw new Error('無效的報名狀態');
      }

      await registration.update({ status });
      return registration;
    } catch (error) {
      console.error('更新報名狀態失敗:', error);
      throw error;
    }
  }

  /**
   * 獲取會員的報名記錄
   */
  async getMemberRegistrations(memberId: string, options: Partial<RegistrationSearchOptions> = {}) {
    try {
      const registrations = await Registration.findAll({
        where: { member_id: memberId },
        include: [{ model: Event, as: 'event' }],
        order: [['created_at', 'DESC']]
      });
      return registrations;
    } catch (error) {
      console.error('獲取會員報名記錄失敗:', error);
      throw error;
    }
  }

  /**
   * 獲取活動的報名記錄
   */
  async getEventRegistrations(eventId: string, options: Partial<RegistrationSearchOptions> = {}) {
    try {
      return await this.searchRegistrations({
        ...options,
        event_id: eventId
      });
    } catch (error) {
      console.error('獲取活動報名記錄失敗:', error);
      throw error;
    }
  }

  /**
   * 獲取報名統計
   */
  async getRegistrationStats(eventId?: string) {
    try {
      if (eventId) {
        // 單一活動報名統計
        const [confirmed, pending, cancelled, waitlist] = await Promise.all([
          Registration.count({ where: { event_id: eventId, status: 'confirmed' } }),
          Registration.count({ where: { event_id: eventId, status: 'pending' } }),
          Registration.count({ where: { event_id: eventId, status: 'cancelled' } }),
          Registration.count({ where: { event_id: eventId, status: 'waitlist' } })
        ]);

        const event = await Event.findByPk(eventId, { attributes: ['title', 'max_attendees'] });
        const availableSlots = event?.max_attendees ? event.max_attendees - confirmed : null;

        return {
          eventId,
          eventTitle: event?.title,
          maxAttendees: event?.max_attendees,
          confirmed,
          pending,
          cancelled,
          waitlist,
          total: confirmed + pending + cancelled + waitlist,
          availableSlots,
          isFull: event?.max_attendees ? confirmed >= event.max_attendees : false
        };
      } else {
        // 全體報名統計
        const [totalRegistrations, confirmedRegistrations, pendingRegistrations, cancelledRegistrations] = await Promise.all([
          Registration.count(),
          Registration.count({ where: { status: 'confirmed' } }),
          Registration.count({ where: { status: 'pending' } }),
          Registration.count({ where: { status: 'cancelled' } })
        ]);

        return {
          totalRegistrations,
          confirmedRegistrations,
          pendingRegistrations,
          cancelledRegistrations,
          cancellationRate: totalRegistrations > 0 ? (cancelledRegistrations / totalRegistrations) * 100 : 0
        };
      }
    } catch (error) {
      console.error('獲取報名統計失敗:', error);
      throw error;
    }
  }

  /**
   * 驗證報名資格
   */
  async validateRegistrationEligibility(memberId: string, eventId: string): Promise<{
    eligible: boolean;
    reason?: string;
    event?: Event;
    member?: Member;
    capacityInfo?: any;
  }> {
    try {
      // 檢查活動
      const event = await Event.findByPk(eventId);
      if (!event) {
        return { eligible: false, reason: '活動不存在' };
      }

      if (event.status !== 'active') {
        return { eligible: false, reason: '活動已取消或不開放報名', event };
      }

      // 檢查活動時間
      const now = new Date();
      if (event.date < now) {
        return { eligible: false, reason: '活動已結束，無法報名', event };
      }

      // 檢查會員
      const member = await Member.findByPk(memberId);
      if (!member) {
        return { eligible: false, reason: '會員不存在', event };
      }

      if (member.status !== 'active') {
        return { eligible: false, reason: '會員帳號已停用，無法報名', event, member };
      }

      // 檢查是否已報名
      const { registered, status } = await this.isRegistered(memberId, eventId);
      if (registered) {
        return { eligible: false, reason: '您已經報名過此活動了', event, member };
      } else if (status === 'cancelled') {
        // 已取消的報名可以重新報名
      }

      // 檢查名額
      const capacityInfo = await this.getRegistrationStats(eventId);
      if (capacityInfo.isFull) {
        return { 
          eligible: false, 
          reason: '活動名額已滿，無法報名', 
          event, 
          member, 
          capacityInfo 
        };
      }

      return { eligible: true, event, member, capacityInfo };
    } catch (error) {
      console.error('驗證報名資格失敗:', error);
      throw error;
    }
  }

  /**
   * 批量確認報名
   */
  async batchConfirmRegistrations(registrationIds: string[]): Promise<number> {
    try {
      const [affectedCount] = await Registration.update(
        { status: 'confirmed' },
        {
          where: {
            id: { [Op.in]: registrationIds },
            status: 'pending'
          }
        }
      );

      return affectedCount;
    } catch (error) {
      console.error('批量確認報名失敗:', error);
      throw error;
    }
  }

  /**
   * 批量取消報名
   */
  async batchCancelRegistrations(registrationIds: string[]): Promise<number> {
    try {
      const [affectedCount] = await Registration.update(
        { status: 'cancelled' },
        {
          where: {
            id: { [Op.in]: registrationIds },
            status: { [Op.not]: 'cancelled' }
          }
        }
      );

      return affectedCount;
    } catch (error) {
      console.error('批量取消報名失敗:', error);
      throw error;
    }
  }
}

export default new RegistrationService();