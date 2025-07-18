
import express from 'express';
import liffController from '../../controllers/liffController';

const router = express.Router();

/**
 * POST /api/liff/check-member
 * 檢查 LINE 用戶是否為會員
 */
router.post('/check-member', async (req, res) => {
  await liffController.checkMember(req, res);
});

/**
 * POST /api/liff/register
 * 註冊新會員
 */
router.post('/register', async (req, res) => {
  await liffController.registerMember(req, res);
});

export default router;
