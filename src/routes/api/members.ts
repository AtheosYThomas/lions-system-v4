
import express from 'express';
import memberController from '../../controllers/memberController';

const router = express.Router();

router.get('/members', memberController.getMembers);

export default router;
