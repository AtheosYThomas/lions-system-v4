import express from 'express';
import liffController from '../../controllers/liffController';

const router = express.Router();

/**
 * POST /api/liff/check-member
 * 檢查 LINE 用戶是否為會員
 */
router.post('/check-member', async (req, res) => {
  try {
    await liffController.checkMember(req, res);
  } catch (error) {
    console.error('❌ LIFF check-member 錯誤:', error);
    res.status(500).json({
      success: false,
      error: 'LIFF 服務錯誤',
      details: error instanceof Error ? error.message : '未知錯誤'
    });
  }
});

/**
 * POST /api/liff/register
 * 註冊新會員
 */
router.post('/register', async (req, res) => {
  try {
    await liffController.registerMember(req, res);
  } catch (error) {
    console.error('❌ LIFF register 錯誤:', error);
    res.status(500).json({
      success: false,
      error: 'LIFF 註冊服務錯誤',
      details: error instanceof Error ? error.message : '未知錯誤'
    });
  }
});

// 檢查當前的 LIFF 路由實作
// 確保路由正確對應到 LIFF 應用程式 ID
export default router;