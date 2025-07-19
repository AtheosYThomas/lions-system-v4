import express from 'express';
import checkinService from '../../services/checkinService';
import eventService from '../../services/eventService';
import adminController from '../../controllers/adminController';

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

    // 獲取活動報到記錄（包含會員資料）
    const checkinData = await checkinService.getEventCheckins(eventId, {
      limit: 1000,
      offset: 0
    });

    // 獲取活動統計資料
    const stats = await checkinService.getCheckinStats(eventId);

    // 獲取活動報名記錄（包含會員資料）
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

// 建立新活動
router.post('/event/create', async (req, res) => {
  try {
    const { title, description, date, location, max_attendees } = req.body;

    // 驗證必要欄位
    if (!title || !date) {
      return res.status(400).json({
        error: '缺少必要欄位',
        details: '活動標題和日期為必填項目'
      });
    }

    // 建立活動
    const eventData = {
      title: title.trim(),
      description: description?.trim() || null,
      date: new Date(date),
      location: location?.trim() || null,
      max_attendees: max_attendees || null
    };

    const event = await eventService.createEvent(eventData);

    res.json({
      success: true,
      event,
      message: '活動建立成功'
    });

  } catch (error) {
    console.error('建立活動失敗:', error);
    res.status(500).json({
      error: '建立活動失敗',
      details: error instanceof Error ? error.message : '未知錯誤'
    });
  }
});

// 更新活動
router.patch('/event/:id/update', async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, date, location, max_attendees } = req.body;

    // 驗證必要欄位
    if (!title || !date) {
      return res.status(400).json({
        error: '缺少必要欄位',
        details: '活動標題和日期為必填項目'
      });
    }

    // 更新活動
    const updateData = {
      id,
      title: title.trim(),
      description: description?.trim() || null,
      date: new Date(date),
      location: location?.trim() || null,
      max_attendees: max_attendees || null
    };

    const event = await eventService.updateEvent(updateData);

    res.json({
      success: true,
      event,
      message: '活動更新成功'
    });

  } catch (error) {
    console.error('更新活動失敗:', error);
    res.status(500).json({
      error: '更新活動失敗',
      details: error instanceof Error ? error.message : '未知錯誤'
    });
  }
});

// 獲取所有活動列表
router.get('/events', async (req, res) => {
  try {
    const { status, limit = 50, offset = 0, keyword = '', month = '' } = req.query;

    // 建立查詢條件
    const searchOptions: any = {
      limit: parseInt(limit as string),
      offset: parseInt(offset as string)
    };

    if (status && status !== 'all') {
      searchOptions.status = status;
    }

    // 搜尋關鍵字
    if (typeof keyword === 'string' && keyword.trim()) {
      searchOptions.title = keyword.trim();
    }

    // 月份篩選
    if (typeof month === 'string' && /^\d{4}-\d{2}$/.test(month)) {
      const startDate = new Date(`${month}-01T00:00:00`);
      const endDate = new Date(`${month}-31T23:59:59`);
      searchOptions.dateFrom = startDate;
      searchOptions.dateTo = endDate;
    }

    // 獲取活動列表
    const events = await eventService.searchEvents(searchOptions);

    res.json({
      success: true,
      events: events.events,
      total: events.total,
      limit: events.limit,
      offset: events.offset
    });

  } catch (error) {
    console.error('獲取活動列表失敗:', error);
    res.status(500).json({ 
      error: '獲取活動列表失敗',
      details: error instanceof Error ? error.message : '未知錯誤'
    });
  }
});

// 推送活動報到通知
router.post('/event/:id/notify', async (req, res) => {
  try {
    const { id: eventId } = req.params;
    const { targetType = 'all' } = req.body; // all, registered, specific

    // 檢查活動是否存在
    const event = await eventService.getEventById(eventId);
    if (!event) {
      return res.status(404).json({
        error: '活動不存在',
        code: 'EVENT_NOT_FOUND'
      });
    }

    // 根據推播對象類型獲取會員列表
    let targetMembers: any[] = [];
    
    if (targetType === 'all') {
      // 推播給所有有 LINE ID 的會員
      const { Op } = require('sequelize');
      const Member = require('../../models/member').default;
      
      targetMembers = await Member.findAll({
        where: {
          line_user_id: {
            [Op.not]: null
          }
        },
        attributes: ['id', 'name', 'line_user_id']
      });
    } else if (targetType === 'registered') {
      // 推播給已報名該活動的會員
      const registrations = await checkinService.getEventRegistrations(eventId);
      targetMembers = registrations.registrations
        .filter((reg: any) => reg.member?.line_user_id)
        .map((reg: any) => ({
          id: reg.member.id,
          name: reg.member.name,
          line_user_id: reg.member.line_user_id
        }));
    }

    if (targetMembers.length === 0) {
      return res.status(400).json({
        error: '找不到推播對象',
        code: 'NO_TARGET_MEMBERS'
      });
    }

    // 執行批量推播
    const lineService = require('../../integrations/line/lineService').default;
    const userIds = targetMembers.map((member: any) => member.line_user_id);
    
    const pushResult = await lineService.pushBulkCheckinNotification(
      userIds,
      event.title,
      event.date.toISOString(),
      eventId
    );

    // 記錄推播結果（可選）
    console.log(`📢 活動通知推播完成 - ${event.title}`);
    console.log(`📊 推播統計 - 成功: ${pushResult.success}, 失敗: ${pushResult.failed}`);

    res.json({
      success: true,
      message: '推播完成',
      statistics: {
        totalTargets: targetMembers.length,
        successCount: pushResult.success,
        failedCount: pushResult.failed,
        eventTitle: event.title,
        targetType: targetType
      },
      details: pushResult.results
    });

  } catch (error) {
    console.error('推播活動通知失敗:', error);
    res.status(500).json({
      error: '推播失敗',
      details: error instanceof Error ? error.message : '未知錯誤'
    });
  }
});

export default router;