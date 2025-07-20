import { Request, Response } from 'express';
import Member from '../models/member';
import Event from '../models/event';
import Checkin from '../models/checkin';

class CheckinController {
  async checkinToEvent(req: Request, res: Response) {
    const { lineUserId, deviceInfo } = req.body;
    const { eventId } = req.params;

    try {
      // 檢查活動是否存在
      const event = await Event.findByPk(eventId);
      if (!event) {
        return res.status(404).json({ error: '活動不存在' });
      }

      // 查找會員
      const member = await Member.findOne({
        where: { line_user_id: lineUserId },
      });
      if (!member) {
        return res.status(404).json({ error: '會員不存在' });
      }

      // 檢查是否已簽到
      const existingCheckin = await Checkin.findOne({
        where: {
          member_id: member.id,
          event_id: eventId,
        },
      });

      if (existingCheckin) {
        return res.json({
          success: false,
          message: '已經簽到過了',
          checkin: existingCheckin,
        });
      }

      // 建立簽到記錄
      const checkin = await Checkin.create({
        member_id: member.id,
        event_id: eventId,
        device_info: deviceInfo || 'Unknown',
      });

      res.json({
        success: true,
        message: '簽到成功',
        checkin,
        member: {
          name: member.name,
          role: member.role,
        },
        event: {
          id: event.id,
          title: event.title,
          date: event.date,
        },
      });
    } catch (err) {
      console.error('❌ 簽到失敗:', err);
      res.status(500).json({
        error: 'Check-in failed',
        details: err instanceof Error ? err.message : '未知錯誤',
      });
    }
  }

  async getEventCheckins(req: Request, res: Response) {
    const { eventId } = req.params;

    try {
      const checkins = await Checkin.findAll({
        where: { event_id: eventId },
        include: [
          {
            model: Member,
            attributes: ['name', 'role', 'phone'],
            required: false,
          },
        ],
        order: [['checkin_time', 'DESC']],
      });

      res.json({
        eventId,
        checkinCount: checkins.length,
        checkins,
      });
    } catch (err) {
      console.error('❌ 查詢簽到列表錯誤:', err);
      res.status(500).json({
        error: 'Get checkin list failed',
        details: err instanceof Error ? err.message : '未知錯誤',
      });
    }
  }

  async getMemberCheckinHistory(req: Request, res: Response) {
    const { lineUserId } = req.params;

    try {
      const member = await Member.findOne({
        where: { line_user_id: lineUserId },
      });
      if (!member) {
        return res.status(404).json({ error: '會員不存在' });
      }

      const checkins = await Checkin.findAll({
        where: { member_id: member.id },
        include: [
          {
            model: Event,
            attributes: ['title', 'date', 'location'],
            required: false,
          },
        ],
        order: [['checkin_time', 'DESC']],
      });

      res.json({
        member: {
          name: member.name,
          lineUid: member.line_user_id,
        },
        checkinHistory: checkins,
      });
    } catch (err) {
      console.error('❌ 查詢會員簽到歷史錯誤:', err);
      res.status(500).json({
        error: 'Get member checkin history failed',
        details: err instanceof Error ? err.message : '未知錯誤',
      });
    }
  }
}

export default new CheckinController();
