import express from 'express';
import announcementController from '../../controllers/announcementController';

const router = express.Router();

// 🔍 查詢所有公告（可加篩選條件）
router.get('/', announcementController.getAnnouncements);

// 獲取單一公告
router.get('/:id', announcementController.getAnnouncementById);

// 📥 建立公告
router.post('/', announcementController.createAnnouncement);

// 📝 更新公告
router.put('/:id', announcementController.updateAnnouncement);

// 刪除公告
router.delete('/:id', announcementController.deleteAnnouncement);

// 發布公告
router.post('/:id/publish', announcementController.publishAnnouncement);

export default router;
