import express from 'express';
import dotenv from 'dotenv';
import liffController from '../../controllers/liffController';

dotenv.config();

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
      details: error instanceof Error ? error.message : '未知錯誤',
    });
  }
});

/**
 * POST /api/liff/checkMember
 * 檢查會員身份 - V4.0 修正版
 * 請求格式: { "lineUserId": "Uxxxxxxxxxxxxxxxxxxxx" }
 * 回應格式: { "member": { "name": "...", "email": "...", "events": [...] } } 或 { "member": null }
 */
router.post('/checkMember', async (req, res) => {
  try {
    await liffController.checkMember(req, res);
  } catch (error) {
    console.error('❌ LIFF checkMember 錯誤:', error);
    res.status(500).json({
      error: 'Server error',
      details: error instanceof Error ? error.message : '未知錯誤',
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
      details: error instanceof Error ? error.message : '未知錯誤',
    });
  }
});

/**
 * GET /api/liff/config
 * 取得 LIFF 配置
 */
router.get('/config', (req, res) => {
  try {
    // 從環境變數讀取 LIFF_ID
    const liffId = process.env.LIFF_ID;
    const defaultLiffId = '2007739371-aKePV20l';
    
    if (!liffId) {
      console.warn('⚠️ LIFF_ID 環境變數未設定，使用預設值');
    }

    const finalLiffId = liffId || defaultLiffId;
    const isDefault = finalLiffId === defaultLiffId;

    console.log('📱 LIFF 配置請求:', {
      liffId: finalLiffId,
      isDefault,
      fromEnv: !!liffId,
    });

    res.json({
      success: true,
      liffId: finalLiffId,
      isDefault,
    });
  } catch (error) {
    console.error('❌ LIFF config 錯誤:', error);
    res.status(500).json({
      success: false,
      error: 'LIFF 配置服務錯誤',
    });
  }
});

// 檢查當前的 LIFF 路由實作
// 確保路由正確對應到 LIFF 應用程式 ID
export default router;
