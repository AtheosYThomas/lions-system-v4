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
      limit: 1000,
      offset: 0
    });

    // 獲取活動統計資料
    const stats = await checkinService.getCheckinStats(eventId);

    // 獲取活動報名記錄
    const registrationData = await checkinService.getEventRegistrations(eventId);

    // 建立報到會員 Map
    const checkinMap = new Map(
      checkinData.checkins.map((checkin: any) => [checkin.member?.id, checkin])
    );

    // 格式化已報到會員資料
    const attendees = checkinData.checkins.map((checkin: any) => ({
      id: checkin.member?.id || 'unknown',
      name: checkin.member?.name || '未知會員',
      email: checkin.member?.email || '',
      phone: checkin.member?.phone || '',
      checkedInAt: checkin.checkin_time,
      deviceInfo: checkin.device_info || ''
    }));

    // 計算未報到會員
    const notCheckedIn = registrationData.registrations
      .filter((reg: any) => !checkinMap.has(reg.member?.id))
      .map((reg: any) => ({
        id: reg.member?.id || 'unknown',
        name: reg.member?.name || '未知會員',
        email: reg.member?.email || '',
        phone: reg.member?.phone || '',
        registeredAt: reg.created_at
      }));

    // 按小時統計報到分布
    const hourlyStats: { [hour: string]: number } = {};
    checkinData.checkins.forEach((checkin: any) => {
      const hour = new Date(checkin.checkin_time).getHours().toString().padStart(2, '0');
      hourlyStats[hour] = (hourlyStats[hour] || 0) + 1;
    });

    // 計算報到率
    const totalRegistrations = registrationData.total;
    const attendanceRate = totalRegistrations > 0 
      ? Math.round((checkinData.total / totalRegistrations) * 100 * 100) / 100
      : 0;

    res.json({
      success: true,
      data: {
        eventId: event.id,
        eventTitle: event.title,
        eventDate: event.date,
        eventLocation: event.location,
        totalCheckins: checkinData.total,
        totalRegistrations: totalRegistrations,
        attendanceRate: attendanceRate,
        maxAttendees: event.max_attendees,
        attendees: attendees,
        notCheckedIn: notCheckedIn,
        hourlyDistribution: hourlyStats,
        statistics: {
          onTimeCheckins: checkinData.total,
          lateCheckins: 0, // 可以根據活動時間計算
          earlyCheckins: 0  // 可以根據活動時間計算
        }
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

// 匯出活動報到 CSV
router.get('/event/:eventId/checkin/export', async (req, res) => {
  const { eventId } = req.params;
  const { type = 'checkin' } = req.query;

  try {
    const event = await eventService.getEventById(eventId);
    if (!event) {
      return res.status(404).json({ error: '活動不存在' });
    }

    let csvData: any[] = [];
    let filename = '';

    if (type === 'checkin') {
      const checkinData = await checkinService.getEventCheckins(eventId, { limit: 1000 });
      csvData = checkinData.checkins.map((checkin: any) => ({
        '姓名': checkin.member?.name || '',
        '手機': checkin.member?.phone || '',
        'Email': checkin.member?.email || '',
        '報到時間': new Date(checkin.checkin_time).toLocaleString('zh-TW'),
        '裝置資訊': checkin.device_info || ''
      }));
      filename = `${event.title}_報到名單.csv`;
    } else if (type === 'not-checkin') {
      const registrationData = await checkinService.getEventRegistrations(eventId);
      const checkinData = await checkinService.getEventCheckins(eventId, { limit: 1000 });

      const checkinMap = new Map(
        checkinData.checkins.map((checkin: any) => [checkin.member?.id, true])
      );

      csvData = registrationData.registrations
        .filter((reg: any) => !checkinMap.has(reg.member?.id))
        .map((reg: any) => ({
          '姓名': reg.member?.name || '',
          '手機': reg.member?.phone || '',
          'Email': reg.member?.email || '',
          '報名時間': new Date(reg.created_at).toLocaleString('zh-TW'),
          '狀態': '未報到'
        }));
      filename = `${event.title}_未報到名單.csv`;
    }

    // 使用 csv-stringify 產生 CSV
    const { stringify } = require('csv-stringify/sync');
    const csvString = stringify(csvData, {
      header: true,
      bom: true // 支援中文字符
    });

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(filename)}"`);
    res.send(csvString);

  } catch (error) {
    console.error('匯出 CSV 失敗:', error);
    res.status(500).json({ 
      error: '匯出失敗',
      details: error instanceof Error ? error.message : '未知錯誤'
    });
  }
});

export default router;