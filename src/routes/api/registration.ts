
import express from 'express';
import registrationController from '../../controllers/registrationController';

const router = express.Router();

// 會員註冊
router.post('/register', registrationController.registerMember);

// 檢查註冊狀態
router.get('/status/:line_uid', registrationController.checkRegistrationStatus);

export default router;
