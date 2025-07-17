
import express from 'express';
import liffController from '../../controllers/liffController';

const router = express.Router();

router.post('/init', liffController.initSession);

// 會員註冊 API
router.post('/register', liffController.registerMember);

// 查詢會員資料 API
router.get('/profile/:line_uid', liffController.getMemberProfile);
router.get('/profile/:lineUid', liffController.getMemberProfileByUid);

export default router;
