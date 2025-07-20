import express from 'express';
import { authMiddleware } from '../../middleware/authMiddleware';
import { requireAnyRole } from '../../middleware/roleMiddleware';
import { Role } from '../../types/role';
import PushTemplate from '../../models/pushTemplate';
import lineService from '../../integrations/line/lineService';
import Member from '../../models/member';

const router = express.Router();

/**
 * 儲存推播樣板
 * POST /api/push-template/save
 */
router.post(
  '/save',
  authMiddleware,
  requireAnyRole([Role.Admin, Role.President]),
  async (req, res) => {
    try {
      const { name, description, json } = req.body;

      if (!name || !json) {
        return res.status(400).json({
          error: '缺少必要欄位',
          details: 'name 和 json 為必填項目',
        });
      }

      // 驗證 JSON 格式
      try {
        if (typeof json === 'string') {
          JSON.parse(json);
        }
      } catch (error) {
        return res.status(400).json({
          error: 'JSON 格式錯誤',
          details: error instanceof Error ? error.message : '無效的 JSON 格式',
        });
      }

      const template = await PushTemplate.create({
        name: name.trim(),
        description: description?.trim() || null,
        json: typeof json === 'string' ? JSON.parse(json) : json,
      });

      res.json({
        success: true,
        template: {
          id: template.id,
          name: template.name,
          description: template.description,
          json: template.json,
          created_at: template.created_at,
        },
        message: '樣板儲存成功',
      });
    } catch (error) {
      console.error('❌ 儲存推播樣板失敗:', error);
      res.status(500).json({
        error: '儲存樣板失敗',
        details: error instanceof Error ? error.message : '未知錯誤',
      });
    }
  }
);

/**
 * 測試推播
 * POST /api/push-template/test
 */
router.post(
  '/test',
  authMiddleware,
  requireAnyRole([Role.Admin, Role.President]),
  async (req, res) => {
    try {
      const { userId, messageJson, testType = 'user_id' } = req.body;

      if (!messageJson) {
        return res.status(400).json({
          error: '缺少 messageJson 參數',
        });
      }

      let targetUserId = userId;

      // 如果是測試模式，可以使用自己的 LINE ID
      if (testType === 'self') {
        // 這裡可以設定測試用的 LINE User ID
        // 或從當前管理員的資料中取得
        if (!userId) {
          return res.status(400).json({
            error: '請提供測試用的 LINE User ID',
          });
        }
        targetUserId = userId;
      } else if (testType === 'member_search') {
        // 根據會員姓名或手機搜尋
        const member = await Member.findOne({
          where: {
            name: userId,
          },
        });

        if (!member || !member.line_user_id) {
          return res.status(404).json({
            error: '找不到該會員或會員未綁定 LINE',
          });
        }

        targetUserId = member.line_user_id;
      }

      if (!targetUserId) {
        return res.status(400).json({
          error: '缺少 userId 參數',
        });
      }

      // 建立 Flex Message
      const flexMessage = {
        type: 'flex' as const,
        altText: 'Flex 推播測試',
        contents: messageJson,
      };

      // 發送測試推播
      await lineService.pushFlexMessage(targetUserId, flexMessage);

      res.json({
        success: true,
        message: '測試推播發送成功',
        targetUserId: testType === 'user_id' ? targetUserId : '***隱藏***',
      });
    } catch (error) {
      console.error('❌ 測試推播失敗:', error);
      res.status(500).json({
        error: '測試推播失敗',
        details: error instanceof Error ? error.message : '未知錯誤',
      });
    }
  }
);

/**
 * 獲取所有樣板
 * GET /api/push-template/list
 */
router.get(
  '/list',
  authMiddleware,
  requireAnyRole([Role.Admin, Role.President]),
  async (req, res) => {
    try {
      const { limit = 20, offset = 0 } = req.query;

      const templates = await PushTemplate.findAndCountAll({
        limit: parseInt(limit as string),
        offset: parseInt(offset as string),
        order: [['created_at', 'DESC']],
        attributes: ['id', 'name', 'description', 'created_at'],
      });

      res.json({
        success: true,
        templates: templates.rows,
        total: templates.count,
        limit: parseInt(limit as string),
        offset: parseInt(offset as string),
      });
    } catch (error) {
      console.error('❌ 獲取樣板列表失敗:', error);
      res.status(500).json({
        error: '獲取樣板列表失敗',
        details: error instanceof Error ? error.message : '未知錯誤',
      });
    }
  }
);

/**
 * 獲取單一樣板
 * GET /api/push-template/:id
 */
router.get(
  '/:id',
  authMiddleware,
  requireAnyRole([Role.Admin, Role.President]),
  async (req, res) => {
    try {
      const { id } = req.params;

      const template = await PushTemplate.findByPk(id);

      if (!template) {
        return res.status(404).json({
          error: '找不到指定樣板',
        });
      }

      res.json({
        success: true,
        template: {
          id: template.id,
          name: template.name,
          description: template.description,
          json: template.json,
          created_at: template.created_at,
        },
      });
    } catch (error) {
      console.error('❌ 獲取樣板失敗:', error);
      res.status(500).json({
        error: '獲取樣板失敗',
        details: error instanceof Error ? error.message : '未知錯誤',
      });
    }
  }
);

export default router;
