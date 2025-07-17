
import express from 'express';
import { Announcement, Member, Event } from '../models';
import { Op } from 'sequelize';

const router = express.Router();

// 獲取公告列表
router.get('/', async (req, res) => {
  try {
    const {
      status = 'published',
      category,
      audience,
      limit = 10,
      offset = 0
    } = req.query;

    const whereClause: any = {
      is_visible: true
    };

    // 狀態篩選
    if (status) {
      whereClause.status = status;
    }

    // 分類篩選
    if (category) {
      whereClause.category = category;
    }

    // 對象篩選
    if (audience) {
      whereClause.audience = audience;
    }

    // 如果是已發布狀態，檢查發布時間
    if (status === 'published') {
      whereClause.published_at = {
        [Op.not]: null,
        [Op.lte]: new Date()
      };
    }

    const announcements = await Announcement.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: Member,
          as: 'creator',
          attributes: ['id', 'name', 'email']
        },
        {
          model: Event,
          as: 'relatedEvent',
          attributes: ['id', 'title', 'date', 'location']
        }
      ],
      order: [['created_at', 'DESC']],
      limit: parseInt(limit as string),
      offset: parseInt(offset as string)
    });

    res.json({
      success: true,
      data: announcements.rows,
      total: announcements.count,
      pagination: {
        limit: parseInt(limit as string),
        offset: parseInt(offset as string),
        total: announcements.count
      }
    });
  } catch (error) {
    console.error('獲取公告失敗:', error);
    res.status(500).json({
      success: false,
      message: '獲取公告失敗',
      error: error instanceof Error ? error.message : '未知錯誤'
    });
  }
});

// 獲取單一公告
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const announcement = await Announcement.findByPk(id, {
      include: [
        {
          model: Member,
          as: 'creator',
          attributes: ['id', 'name', 'email']
        },
        {
          model: Event,
          as: 'relatedEvent',
          attributes: ['id', 'title', 'date', 'location']
        }
      ]
    });

    if (!announcement) {
      return res.status(404).json({
        success: false,
        message: '公告不存在'
      });
    }

    res.json({
      success: true,
      data: announcement
    });
  } catch (error) {
    console.error('獲取公告詳情失敗:', error);
    res.status(500).json({
      success: false,
      message: '獲取公告詳情失敗',
      error: error instanceof Error ? error.message : '未知錯誤'
    });
  }
});

// 創建公告
router.post('/', async (req, res) => {
  try {
    const {
      title,
      content,
      related_event_id,
      created_by,
      audience = 'all',
      category = 'event',
      status = 'draft',
      scheduled_at,
      is_visible = true
    } = req.body;

    // 驗證必填欄位
    if (!title || !content) {
      return res.status(400).json({
        success: false,
        message: '標題和內容為必填欄位'
      });
    }

    // 如果狀態是已發布，設定發布時間
    const published_at = status === 'published' ? new Date() : null;

    const announcement = await Announcement.create({
      title,
      content,
      related_event_id,
      created_by,
      audience,
      category,
      status,
      scheduled_at,
      published_at,
      is_visible
    });

    res.status(201).json({
      success: true,
      message: '公告創建成功',
      data: announcement
    });
  } catch (error) {
    console.error('創建公告失敗:', error);
    res.status(500).json({
      success: false,
      message: '創建公告失敗',
      error: error instanceof Error ? error.message : '未知錯誤'
    });
  }
});

// 更新公告
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const announcement = await Announcement.findByPk(id);
    if (!announcement) {
      return res.status(404).json({
        success: false,
        message: '公告不存在'
      });
    }

    // 如果狀態變更為已發布，設定發布時間
    if (updateData.status === 'published' && announcement.status !== 'published') {
      updateData.published_at = new Date();
    }

    await announcement.update({
      ...updateData,
      updated_at: new Date()
    });

    res.json({
      success: true,
      message: '公告更新成功',
      data: announcement
    });
  } catch (error) {
    console.error('更新公告失敗:', error);
    res.status(500).json({
      success: false,
      message: '更新公告失敗',
      error: error instanceof Error ? error.message : '未知錯誤'
    });
  }
});

// 刪除公告
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const announcement = await Announcement.findByPk(id);
    if (!announcement) {
      return res.status(404).json({
        success: false,
        message: '公告不存在'
      });
    }

    await announcement.destroy();

    res.json({
      success: true,
      message: '公告刪除成功'
    });
  } catch (error) {
    console.error('刪除公告失敗:', error);
    res.status(500).json({
      success: false,
      message: '刪除公告失敗',
      error: error instanceof Error ? error.message : '未知錯誤'
    });
  }
});

// 發布公告
router.post('/:id/publish', async (req, res) => {
  try {
    const { id } = req.params;

    const announcement = await Announcement.findByPk(id);
    if (!announcement) {
      return res.status(404).json({
        success: false,
        message: '公告不存在'
      });
    }

    await announcement.update({
      status: 'published',
      published_at: new Date(),
      updated_at: new Date()
    });

    res.json({
      success: true,
      message: '公告發布成功',
      data: announcement
    });
  } catch (error) {
    console.error('發布公告失敗:', error);
    res.status(500).json({
      success: false,
      message: '發布公告失敗',
      error: error instanceof Error ? error.message : '未知錯誤'
    });
  }
});

export default router;
