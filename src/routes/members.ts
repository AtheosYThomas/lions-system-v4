
import express from 'express';
import Member from '../models/member';

const router = express.Router();

router.get('/members', async (req, res) => {
  const members = await Member.findAll();
  res.json(members);
});

export default router;
