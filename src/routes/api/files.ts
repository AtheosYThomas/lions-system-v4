
import express from 'express';
import fileService from '../../services/fileService';

const router = express.Router();

/**
 * POST /api/files
 * 上傳檔案記錄
 */
router.post('/', async (req, res) => {
  try {
    const { original_name, mime_type, size, url, usage, uploaded_by, related_id } = req.body;

    if (!original_name || !url || !usage) {
      return res.status(400).json({
        success: false,
        message: '缺少必要參數：original_name, url, usage'
      });
    }

    const file = await fileService.uploadFile({
      original_name,
      mime_type,
      size,
      url,
      usage,
      uploaded_by,
      related_id
    });

    res.json({
      success: true,
      message: '檔案上傳成功',
      data: file
    });
  } catch (error) {
    console.error('檔案上傳 API 錯誤:', error);
    res.status(500).json({
      success: false,
      message: '檔案上傳失敗',
      error: error instanceof Error ? error.message : '未知錯誤'
    });
  }
});

/**
 * GET /api/files
 * 搜尋檔案
 */
router.get('/', async (req, res) => {
  try {
    const { usage, uploaded_by, related_id, status, limit, offset } = req.query;

    const result = await fileService.searchFiles({
      usage: usage as string,
      uploaded_by: uploaded_by as string,
      related_id: related_id as string,
      status: status as string,
      limit: limit ? parseInt(limit as string) : undefined,
      offset: offset ? parseInt(offset as string) : undefined
    });

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('檔案搜尋 API 錯誤:', error);
    res.status(500).json({
      success: false,
      message: '檔案搜尋失敗',
      error: error instanceof Error ? error.message : '未知錯誤'
    });
  }
});

/**
 * GET /api/files/:id
 * 根據 ID 獲取檔案
 */
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const file = await fileService.getFileById(id);

    if (!file) {
      return res.status(404).json({
        success: false,
        message: '檔案不存在'
      });
    }

    res.json({
      success: true,
      data: file
    });
  } catch (error) {
    console.error('獲取檔案 API 錯誤:', error);
    res.status(500).json({
      success: false,
      message: '獲取檔案失敗',
      error: error instanceof Error ? error.message : '未知錯誤'
    });
  }
});

/**
 * PUT /api/files/:id
 * 更新檔案資訊
 */
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const file = await fileService.updateFile(id, updateData);

    res.json({
      success: true,
      message: '檔案更新成功',
      data: file
    });
  } catch (error) {
    console.error('更新檔案 API 錯誤:', error);
    res.status(500).json({
      success: false,
      message: '更新檔案失敗',
      error: error instanceof Error ? error.message : '未知錯誤'
    });
  }
});

/**
 * DELETE /api/files/:id
 * 刪除檔案
 */
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await fileService.deleteFile(id);

    res.json({
      success: true,
      message: '檔案刪除成功'
    });
  } catch (error) {
    console.error('刪除檔案 API 錯誤:', error);
    res.status(500).json({
      success: false,
      message: '刪除檔案失敗',
      error: error instanceof Error ? error.message : '未知錯誤'
    });
  }
});

/**
 * GET /api/files/usage/:usage
 * 根據用途獲取檔案
 */
router.get('/usage/:usage', async (req, res) => {
  try {
    const { usage } = req.params;
    const { related_id } = req.query;

    const files = await fileService.getFilesByUsage(
      usage,
      related_id as string
    );

    res.json({
      success: true,
      data: files
    });
  } catch (error) {
    console.error('根據用途獲取檔案 API 錯誤:', error);
    res.status(500).json({
      success: false,
      message: '獲取檔案失敗',
      error: error instanceof Error ? error.message : '未知錯誤'
    });
  }
});

/**
 * GET /api/files/stats
 * 獲取檔案統計
 */
router.get('/stats/overview', async (req, res) => {
  try {
    const stats = await fileService.getFileStats();

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('檔案統計 API 錯誤:', error);
    res.status(500).json({
      success: false,
      message: '獲取檔案統計失敗',
      error: error instanceof Error ? error.message : '未知錯誤'
    });
  }
});

export default router;
