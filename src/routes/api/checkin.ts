
import express from 'express';
import checkinController from '../../controllers/checkinController';

const router = express.Router();

// 活動簽到
router.post('/checkin/:eventId', checkinController.checkinToEvent);

// 查詢活動簽到列表
router.get('/checkin/:eventId', checkinController.getEventCheckins);

// 會員簽到歷史
router.get('/member/:lineUserId/checkins', checkinController.getMemberCheckinHistory);

export default router;
