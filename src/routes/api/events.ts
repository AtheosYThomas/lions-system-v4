
import express from 'express';
import Event from '../../models/event';
import { generateQRCode } from '../../utils/qrcode';

const router = express.Router();

// 建立新活動
router.post('/create', async (req, res) => {
  try {
    const { title, description, date, location, max_attendees } = req.body;

    if (!title || !date) {
      return res.status(400).json({ 
        error: '缺少必要資料',
        details: '標題和日期為必填欄位'
      });
    }

    // 建立活動
    const newEvent = await Event.create({
      title,
      description,
      date: new Date(date),
      location,
      max_attendees: max_attendees || null,
      status: 'active'
    });

    // 生成 QR Code
    const baseUrl = process.env.BASE_URL || `http://localhost:5000`;
    const qrCodeDataUrl = await generateQRCode(newEvent.id, baseUrl);

    res.status(201).json({
      success: true,
      event: newEvent.getPublicData(),
      qrCode: qrCodeDataUrl,
      checkinUrl: `${baseUrl}/checkin/${newEvent.id}`
    });

  } catch (error) {
    console.error('建立活動失敗:', error);
    res.status(500).json({ 
      error: '建立活動失敗',
      details: error instanceof Error ? error.message : '未知錯誤'
    });
  }
});

// 取得活動詳情（包含 QR Code）
router.get('/:eventId', async (req, res) => {
  try {
    const { eventId } = req.params;
    
    const event = await Event.findByPk(eventId);
    if (!event) {
      return res.status(404).json({ error: '活動不存在' });
    }

    // 重新生成 QR Code
    const baseUrl = process.env.BASE_URL || `http://localhost:5000`;
    const qrCodeDataUrl = await generateQRCode(eventId, baseUrl);

    res.json({
      success: true,
      event: event.getPublicData(),
      qrCode: qrCodeDataUrl,
      checkinUrl: `${baseUrl}/checkin/${eventId}`
    });

  } catch (error) {
    console.error('取得活動失敗:', error);
    res.status(500).json({ 
      error: '取得活動失敗',
      details: error instanceof Error ? error.message : '未知錯誤'
    });
  }
});

// 取得所有活動
router.get('/', async (req, res) => {
  try {
    const events = await Event.findAll({
      where: { status: 'active' },
      order: [['date', 'DESC']],
      limit: 50
    });

    res.json({
      success: true,
      events: events.map(event => event.getPublicData())
    });

  } catch (error) {
    console.error('取得活動列表失敗:', error);
    res.status(500).json({ 
      error: '取得活動列表失敗',
      details: error instanceof Error ? error.message : '未知錯誤'
    });
  }
});

export default router;
