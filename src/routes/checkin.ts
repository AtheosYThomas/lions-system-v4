
import express from 'express';
import Member from '../models/member';
import Checkin from '../models/checkin';
import Event from '../models/event';

const router = express.Router();

// 活動簽到
router.post('/checkin/:eventId', async (req, res) => {
  const { lineUserId, deviceInfo } = req.body;
  const { eventId } = req.params;

  try {
    // 檢查活動是否存在
    const event = await Event.findByPk(eventId);
    if (!event) {
      return res.status(404).json({ error: '活動不存在' });
    }

    // 查找會員
    const member = await Member.findOne({ where: { line_uid: lineUserId } });
    if (!member) {
      return res.status(404).json({ error: '會員不存在' });
    }

    // 檢查是否已簽到
    const existingCheckin = await Checkin.findOne({
      where: { 
        member_id: member.id, 
        event_id: eventId 
      }
    });

    if (existingCheckin) {
      return res.json({ 
        success: false, 
        message: '已經簽到過了',
        checkin: existingCheckin 
      });
    }

    // 建立簽到記錄
    const checkin = await Checkin.create({
      member_id: member.id,
      event_id: eventId,
      device_info: deviceInfo || 'Unknown'
    });

    res.json({ 
      success: true, 
      message: '簽到成功',
      checkin,
      member: {
        name: member.name,
        role: member.role
      }
    });
  } catch (err) {
    console.error('❌ 簽到失敗:', err);
    res.status(500).json({ 
      error: 'Check-in failed', 
      details: err instanceof Error ? err.message : '未知錯誤'
    });
  }
});

// 查詢活動簽到列表
router.get('/checkin/:eventId', async (req, res) => {
  const { eventId } = req.params;

  try {
    const checkins = await Checkin.findAll({
      where: { event_id: eventId },
      include: [{
        model: Member,
        attributes: ['name', 'role', 'phone'],
        required: false
      }],
      order: [['checkin_time', 'DESC']]
    });

    res.json({
      eventId,
      checkinCount: checkins.length,
      checkins
    });
  } catch (err) {
    console.error('❌ 查詢簽到列表錯誤:', err);
    res.status(500).json({ 
      error: 'Get checkin list failed', 
      details: err instanceof Error ? err.message : '未知錯誤'
    });
  }
});

// 會員簽到歷史
router.get('/member/:lineUserId/checkins', async (req, res) => {
  const { lineUserId } = req.params;

  try {
    const member = await Member.findOne({ where: { line_uid: lineUserId } });
    if (!member) {
      return res.status(404).json({ error: '會員不存在' });
    }

    const checkins = await Checkin.findAll({
      where: { member_id: member.id },
      include: [{
        model: Event,
        attributes: ['title', 'date', 'location'],
        required: false
      }],
      order: [['checkin_time', 'DESC']]
    });

    res.json({
      member: {
        name: member.name,
        lineUid: member.line_uid
      },
      checkinHistory: checkins
    });
  } catch (err) {
    console.error('❌ 查詢會員簽到歷史錯誤:', err);
    res.status(500).json({ 
      error: 'Get member checkin history failed', 
      details: err instanceof Error ? err.message : '未知錯誤'
    });
  }
});

export default router;
