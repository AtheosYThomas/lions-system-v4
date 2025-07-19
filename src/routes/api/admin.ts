
import express from 'express';
import checkinService from '../../services/checkinService';
import eventService from '../../services/eventService';

const router = express.Router();

// 獲取指定活動的報到統計
router.get('/event/:eventId/checkin', async (req, res) => {
  const { eventId } = req.params;
  
  try {
    // 獲取活動資訊
    const event = await eventService.getEventById(eventId);
    if (!event) {
      return res.status(404).json({ 
        error: '活動不存在',
        code: 'EVENT_NOT_FOUND' 
      });
    }

    // 獲取活動報到記錄
    const checkinData = await checkinService.getEventCheckins(eventId, {
      limit: 1000, // 設定較大的限制以獲取所有記錄
      offset: 0
    });

    // 獲取活動統計資料
    const stats = await checkinService.getCheckinStats(eventId);

    // 格式化報到會員資料
    const attendees = checkinData.checkins.map((checkin: any) => ({
      id: checkin.member?.id || 'unknown',
      name: checkin.member?.name || '未知會員',
      email: checkin.member?.email || '',
      phone: checkin.member?.phone || '',
      checkedInAt: checkin.checkin_time,
      deviceInfo: checkin.device_info || ''
    }));

    res.json({
      success: true,
      data: {
        eventId: event.id,
        eventTitle: event.title,
        eventDate: event.date,
        eventLocation: event.location,
        totalCheckins: checkinData.total,
        attendanceRate: stats.attendanceRate || 0,
        maxAttendees: event.max_attendees,
        attendees: attendees
      }
    });

  } catch (error) {
    console.error('獲取活動報到統計失敗:', error);
    res.status(500).json({ 
      error: '獲取報到統計失敗',
      details: error instanceof Error ? error.message : '未知錯誤'
    });
  }
});

export default router;
