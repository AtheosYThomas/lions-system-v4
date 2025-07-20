
import { Announcement, AnnouncementAttributes } from '../models/announcement';
import Member from '../models/member';
import Event from '../models/event';
import { Op } from 'sequelize';

interface AnnouncementCreationData {
  title: string;
  content: string;
  related_event_id?: string;
  created_by?: string;
  audience?: 'all' | 'officers' | 'members';
  category?: 'event' | 'system' | 'personnel';
  status?: 'draft' | 'scheduled' | 'published';
  scheduled_at?: Date;
  is_visible?: boolean;
}

interface AnnouncementUpdateData extends Partial<AnnouncementCreationData> {
  id: string;
  published_at?: Date;
}

interface AnnouncementSearchOptions {
  title?: string;
  content?: string;
  audience?: 'all' | 'officers' | 'members';
  category?: 'event' | 'system' | 'personnel';
  status?: 'draft' | 'scheduled' | 'published';
  created_by?: string;
  related_event_id?: string;
  is_visible?: boolean;
  dateFrom?: Date;
  dateTo?: Date;
  limit?: number;
  offset?: number;
}

class AnnouncementService {
  /**
   * 創建公告
   */
  async createAnnouncement(announcementData: AnnouncementCreationData): Promise<Announcement> {
    try {
      // 驗證創建者是否存在（如果提供）
      if (announcementData.created_by) {
        const creator = await Member.findByPk(announcementData.created_by);
        if (!creator) {
          throw new Error('創建者不存在');
        }
      }

      // 驗證相關活動是否存在（如果提供）
      if (announcementData.related_event_id) {
        const event = await Event.findByPk(announcementData.related_event_id);
        if (!event) {
          throw new Error('相關活動不存在');
        }
      }

      // 如果是排程發布，檢查排程時間
      if (announcementData.status === 'scheduled') {
        if (!announcementData.scheduled_at) {
          throw new Error('排程發布需要設定排程時間');
        }

        const now = new Date();
        if (announcementData.scheduled_at <= now) {
          throw new Error('排程時間必須是未來時間');
        }
      }

      // 如果是立即發布，設定發布時間
      const announcementPayload: any = {
        ...announcementData,
        audience: announcementData.audience || 'all',
        category: announcementData.category || 'event',
        status: announcementData.status || 'draft',
        is_visible: announcementData.is_visible !== false
      };

      if (announcementData.status === 'published') {
        announcementPayload.published_at = new Date();
      }

      const announcement = await Announcement.create(announcementPayload);

      // 回傳完整的公告資料
      return await Announcement.findByPk(announcement.id, {
        include: [
          { model: Member, as: 'creator', attributes: ['id', 'name', 'email'] },
          { model: Event, as: 'relatedEvent', attributes: ['id', 'title', 'date', 'location'] }
        ]
      }) as Announcement;

    } catch (error) {
      console.error('創建公告失敗:', error);
      throw error;
    }
  }

  /**
   * 根據 ID 獲取公告
   */
  async getAnnouncementById(id: string): Promise<Announcement | null> {
    try {
      return await Announcement.findByPk(id, {
        include: [
          { model: Member, as: 'creator', attributes: ['id', 'name', 'email'] },
          { model: Event, as: 'relatedEvent', attributes: ['id', 'title', 'date', 'location'] }
        ]
      });
    } catch (error) {
      console.error('獲取公告失敗:', error);
      throw error;
    }
  }

  /**
   * 搜尋公告
   */
  async searchAnnouncements(options: AnnouncementSearchOptions) {
    try {
      const whereClause: any = {};

      if (options.title) {
        whereClause.title = {
          [Op.iLike]: `%${options.title}%`
        };
      }

      if (options.content) {
        whereClause.content = {
          [Op.iLike]: `%${options.content}%`
        };
      }

      if (options.audience) {
        whereClause.audience = options.audience;
      }

      if (options.category) {
        whereClause.category = options.category;
      }

      if (options.status) {
        whereClause.status = options.status;
      }

      if (options.created_by) {
        whereClause.created_by = options.created_by;
      }

      if (options.related_event_id) {
        whereClause.related_event_id = options.related_event_id;
      }

      if (options.is_visible !== undefined) {
        whereClause.is_visible = options.is_visible;
      }

      if (options.dateFrom || options.dateTo) {
        whereClause.created_at = {};
        if (options.dateFrom) {
          whereClause.created_at[Op.gte] = options.dateFrom;
        }
        if (options.dateTo) {
          whereClause.created_at[Op.lte] = options.dateTo;
        }
      }

      const result = await Announcement.findAndCountAll({
        where: whereClause,
        include: [
          { model: Member, as: 'creator', attributes: ['id', 'name', 'email'], required: false },
          { model: Event, as: 'relatedEvent', attributes: ['id', 'title', 'date', 'location'], required: false }
        ],
        order: [
          ['published_at', 'DESC'],
          ['created_at', 'DESC']
        ],
        limit: options.limit || 20,
        offset: options.offset || 0
      });

      return {
        announcements: result.rows,
        total: result.count,
        limit: options.limit || 20,
        offset: options.offset || 0
      };
    } catch (error) {
      console.error('搜尋公告失敗:', error);
      throw error;
    }
  }

  /**
   * 更新公告
   */
  async updateAnnouncement(updateData: AnnouncementUpdateData): Promise<Announcement> {
    try {
      const announcement = await Announcement.findByPk(updateData.id);
      
      if (!announcement) {
        throw new Error('公告不存在');
      }

      // 驗證相關活動是否存在（如果要更新）
      if (updateData.related_event_id) {
        const event = await Event.findByPk(updateData.related_event_id);
        if (!event) {
          throw new Error('相關活動不存在');
        }
      }

      // 如果要設定為排程發布，檢查排程時間
      if (updateData.status === 'scheduled') {
        if (!updateData.scheduled_at) {
          throw new Error('排程發布需要設定排程時間');
        }

        const now = new Date();
        if (updateData.scheduled_at <= now) {
          throw new Error('排程時間必須是未來時間');
        }
      }

      // 如果從其他狀態變為發布狀態，設定發布時間
      if (updateData.status === 'published' && announcement.status !== 'published') {
        updateData.published_at = new Date();
      }

      await announcement.update(updateData);
      
      // 回傳更新後的完整資料
      return await Announcement.findByPk(announcement.id, {
        include: [
          { model: Member, as: 'creator', attributes: ['id', 'name', 'email'] },
          { model: Event, as: 'relatedEvent', attributes: ['id', 'title', 'date', 'location'] }
        ]
      }) as Announcement;

    } catch (error) {
      console.error('更新公告失敗:', error);
      throw error;
    }
  }

  /**
   * 刪除公告
   */
  async deleteAnnouncement(id: string): Promise<void> {
    try {
      const announcement = await Announcement.findByPk(id);
      
      if (!announcement) {
        throw new Error('公告不存在');
      }

      await announcement.destroy();
    } catch (error) {
      console.error('刪除公告失敗:', error);
      throw error;
    }
  }

  /**
   * 發布公告
   */
  async publishAnnouncement(id: string): Promise<Announcement> {
    try {
      const announcement = await Announcement.findByPk(id);
      
      if (!announcement) {
        throw new Error('公告不存在');
      }

      if (announcement.status === 'published') {
        throw new Error('公告已經發布過了');
      }

      await announcement.update({
        status: 'published',
        published_at: new Date()
      });

      return announcement;
    } catch (error) {
      console.error('發布公告失敗:', error);
      throw error;
    }
  }

  /**
   * 隱藏公告
   */
  async hideAnnouncement(id: string): Promise<Announcement> {
    try {
      const announcement = await Announcement.findByPk(id);
      
      if (!announcement) {
        throw new Error('公告不存在');
      }

      await announcement.update({ is_visible: false });
      return announcement;
    } catch (error) {
      console.error('隱藏公告失敗:', error);
      throw error;
    }
  }

  /**
   * 顯示公告
   */
  async showAnnouncement(id: string): Promise<Announcement> {
    try {
      const announcement = await Announcement.findByPk(id);
      
      if (!announcement) {
        throw new Error('公告不存在');
      }

      await announcement.update({ is_visible: true });
      return announcement;
    } catch (error) {
      console.error('顯示公告失敗:', error);
      throw error;
    }
  }

  /**
   * 獲取公開公告（給一般用戶看的）
   */
  async getPublicAnnouncements(audience: 'all' | 'officers' | 'members' = 'all', limit: number = 10) {
    try {
      const whereClause: any = {
        status: 'published',
        is_visible: true,
        [Op.or]: [
          { audience: 'all' },
          { audience }
        ]
      };

      // 檢查是否有已排程但時間已到的公告需要發布
      await this.processScheduledAnnouncements();

      const announcements = await Announcement.findAll({
        where: whereClause,
        include: [
          { model: Event, as: 'relatedEvent', attributes: ['id', 'title', 'date', 'location'], required: false }
        ],
        order: [['published_at', 'DESC']],
        limit
      });

      return announcements;
    } catch (error) {
      console.error('獲取公開公告失敗:', error);
      throw error;
    }
  }

  /**
   * 獲取最新公告
   */
  async getLatestAnnouncements(limit: number = 5) {
    try {
      await this.processScheduledAnnouncements();

      return await Announcement.findAll({
        where: {
          status: 'published',
          is_visible: true
        },
        include: [
          { model: Event, as: 'relatedEvent', attributes: ['id', 'title', 'date'], required: false }
        ],
        order: [['published_at', 'DESC']],
        limit
      });
    } catch (error) {
      console.error('獲取最新公告失敗:', error);
      throw error;
    }
  }

  /**
   * 處理排程公告（將到期的排程公告自動發布）
   */
  async processScheduledAnnouncements(): Promise<number> {
    try {
      const now = new Date();
      
      const [affectedCount] = await Announcement.update(
        {
          status: 'published',
          published_at: now
        },
        {
          where: {
            status: 'scheduled',
            scheduled_at: {
              [Op.lte]: now
            }
          }
        }
      );

      if (affectedCount > 0) {
        console.log(`已自動發布 ${affectedCount} 則排程公告`);
      }

      return affectedCount;
    } catch (error) {
      console.error('處理排程公告失敗:', error);
      throw error;
    }
  }

  /**
   * 獲取公告統計
   */
  async getAnnouncementStats() {
    try {
      const [total, published, draft, scheduled, hidden] = await Promise.all([
        Announcement.count(),
        Announcement.count({ where: { status: 'published' } }),
        Announcement.count({ where: { status: 'draft' } }),
        Announcement.count({ where: { status: 'scheduled' } }),
        Announcement.count({ where: { is_visible: false } })
      ]);

      // 按分類統計
      const [eventAnnouncements, systemAnnouncements, personnelAnnouncements] = await Promise.all([
        Announcement.count({ where: { category: 'event' } }),
        Announcement.count({ where: { category: 'system' } }),
        Announcement.count({ where: { category: 'personnel' } })
      ]);

      // 按對象統計
      const [allAudience, officersAudience, membersAudience] = await Promise.all([
        Announcement.count({ where: { audience: 'all' } }),
        Announcement.count({ where: { audience: 'officers' } }),
        Announcement.count({ where: { audience: 'members' } })
      ]);

      return {
        total,
        byStatus: {
          published,
          draft,
          scheduled,
          hidden
        },
        byCategory: {
          event: eventAnnouncements,
          system: systemAnnouncements,
          personnel: personnelAnnouncements
        },
        byAudience: {
          all: allAudience,
          officers: officersAudience,
          members: membersAudience
        }
      };
    } catch (error) {
      console.error('獲取公告統計失敗:', error);
      throw error;
    }
  }

  /**
   * 獲取活動相關公告
   */
  async getEventAnnouncements(eventId: string): Promise<Announcement[]> {
    try {
      return await Announcement.findAll({
        where: {
          related_event_id: eventId,
          status: 'published',
          is_visible: true
        },
        include: [
          { model: Member, as: 'creator', attributes: ['id', 'name'] }
        ],
        order: [['published_at', 'DESC']]
      });
    } catch (error) {
      console.error('獲取活動相關公告失敗:', error);
      throw error;
    }
  }

  /**
   * 批量發布公告
   */
  async batchPublishAnnouncements(announcementIds: string[]): Promise<number> {
    try {
      const [affectedCount] = await Announcement.update(
        {
          status: 'published',
          published_at: new Date()
        },
        {
          where: {
            id: { [Op.in]: announcementIds },
            status: { [Op.not]: 'published' }
          }
        }
      );

      return affectedCount;
    } catch (error) {
      console.error('批量發布公告失敗:', error);
      throw error;
    }
  }

  /**
   * 批量隱藏公告
   */
  async batchHideAnnouncements(announcementIds: string[]): Promise<number> {
    try {
      const [affectedCount] = await Announcement.update(
        { is_visible: false },
        {
          where: {
            id: { [Op.in]: announcementIds },
            is_visible: true
          }
        }
      );

      return affectedCount;
    } catch (error) {
      console.error('批量隱藏公告失敗:', error);
      throw error;
    }
  }
}

export default new AnnouncementService();
