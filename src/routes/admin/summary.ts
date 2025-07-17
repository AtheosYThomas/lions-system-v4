
import express from 'express';
import adminController from '../../controllers/adminController';

const router = express.Router();

// 系統總覽 API
router.get('/', adminController.getSystemSummary);

export default router;
import express from 'express';
import adminController from '../../controllers/adminController';

const router = express.Router();

// 📊 系統總覽路由
router.get('/', adminController.getSystemSummary);

export default router;
