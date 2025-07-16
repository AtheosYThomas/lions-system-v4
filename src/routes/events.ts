
import express from 'express';
import Event from '../models/event';

const router = express.Router();

// 取得所有活動
router.get('/events', async (req, res) => {
  try {
    const events = await Event.findAll({
      order: [['date', 'DESC']]
    });
    res.json(events);
  } catch (error) {
    console.error('❌ 獲取活動列表錯誤:', error);
    res.status(500).json({ 
      error: '無法獲取活動列表',
      message: error instanceof Error ? error.message : '未知錯誤'
    });
  }
});

// 取得單一活動
router.get('/events/:id(\\d+)', async (req, res) => {
  try {
    const { id } = req.params;
    const event = await Event.findByPk(id);
    if (!event) {
      return res.status(404).json({ error: '活動不存在' });
    }
    res.json(event);
  } catch (error) {
    console.error('❌ 獲取活動錯誤:', error);
    res.status(500).json({ 
      error: '無法獲取活動',
      message: error instanceof Error ? error.message : '未知錯誤'
    });
  }
});

export default router;
