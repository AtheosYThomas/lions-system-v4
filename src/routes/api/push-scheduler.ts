
import express from 'express';
import pushService from '../../services/pushService';
import lineService from '../../integrations/line/lineService';
import Member from '../../models/member';
import { Op } from 'sequelize';

const router = express.Router();

/**
 * 推播明日活動提醒
 * 供外部 cron job 調用
 */
router.post('/checkin-reminder', async (req, res) => {
  try {
    // 簡單的安全檢查
    const cronToken = req.headers['x-cron-token'];
    if (cronToken !== process.env.CRON_TOKEN && cronToken !== 'cron-secret-token') {
      return res.status(401).json({
        error: '未授權的排程請求',
        code: 'UNAUTHORIZED_CRON'
      });
    }

    console.log('🕐 開始執行明日活動推播提醒...');

    // 獲取明日活動
    const tomorrowEvents = await pushService.getTomorrowEvents();
    
    if (tomorrowEvents.length === 0) {
      console.log('📅 明日無活動，跳過推播');
      return res.json({
        success: true,
        message: '明日無活動',
        eventsCount: 0
      });
    }

    console.log(`📅 發現 ${tomorrowEvents.length} 個明日活動`);

    // 獲取所有有 LINE ID 的會員
    const members = await Member.findAll({
      where: {
        line_user_id: {
          [Op.not]: null
        }
      },
      attributes: ['id', 'name', 'line_user_id']
    });

    if (members.length === 0) {
      return res.json({
        success: true,
        message: '無可推播的會員',
        eventsCount: tomorrowEvents.length,
        membersCount: 0
      });
    }

    console.log(`👥 發現 ${members.length} 個可推播會員`);

    let totalSuccessful = 0;
    let totalFailed = 0;
    const pushResults = [];

    // 逐一處理每個活動
    for (const event of tomorrowEvents) {
      console.log(`📢 推播活動：${event.title}`);

      // 檢查是否已推播過（避免重複推播）
      const alreadyPushed = await Promise.all(
        members.map(async (member: any) => {
          const pushed = await pushService.checkMemberPushStatus(
            member.id,
            event.id,
            'checkin_reminder'
          );
          return { memberId: member.id, pushed };
        })
      );

      // 過濾掉已推播的會員
      const membersToPush = members.filter((member: any) => {
        const status = alreadyPushed.find(p => p.memberId === member.id);
        return !status?.pushed;
      });

      if (membersToPush.length === 0) {
        console.log(`⏭️ 活動 ${event.title} 所有會員已推播過，跳過`);
        continue;
      }

      const userIds = membersToPush.map((member: any) => member.line_user_id);

      // 執行推播
      const pushResult = await lineService.pushBulkCheckinNotification(
        userIds,
        event.title,
        event.date.toISOString(),
        event.id,
        'checkin_reminder'
      );

      totalSuccessful += pushResult.success;
      totalFailed += pushResult.failed;

      pushResults.push({
        eventId: event.id,
        eventTitle: event.title,
        targetCount: membersToPush.length,
        successCount: pushResult.success,
        failedCount: pushResult.failed
      });

      console.log(`✅ 活動 ${event.title} 推播完成 - 成功: ${pushResult.success}, 失敗: ${pushResult.failed}`);

      // 避免過快推送
      await new Promise(resolve => setTimeout(resolve, 2000));
    }

    console.log(`🎉 排程推播完成 - 總成功: ${totalSuccessful}, 總失敗: ${totalFailed}`);

    res.json({
      success: true,
      message: '排程推播完成',
      summary: {
        eventsCount: tomorrowEvents.length,
        membersCount: members.length,
        totalSuccessful,
        totalFailed,
        successRate: totalSuccessful + totalFailed > 0 
          ? Math.round((totalSuccessful / (totalSuccessful + totalFailed)) * 100 * 100) / 100 
          : 0
      },
      details: pushResults
    });

  } catch (error) {
    console.error('❌ 排程推播失敗:', error);
    res.status(500).json({
      error: '排程推播失敗',
      details: error instanceof Error ? error.message : '未知錯誤'
    });
  }
});

/**
 * 手動觸發排程推播（測試用）
 */
router.post('/test-checkin-reminder', async (req, res) => {
  try {
    // 重定向到實際的排程 API
    req.headers['x-cron-token'] = 'cron-secret-token';
    
    // 呼叫排程推播邏輯
    const reminderRequest = req;
    reminderRequest.url = '/checkin-reminder';
    
    return router.handle(reminderRequest, res, () => {});

  } catch (error) {
    console.error('❌ 測試排程推播失敗:', error);
    res.status(500).json({
      error: '測試推播失敗',
      details: error instanceof Error ? error.message : '未知錯誤'
    });
  }
});

export default router;
