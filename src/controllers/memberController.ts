
import { Request, Response } from 'express';
import Member from '../models/member';

class MemberController {
  async getMembers(req: Request, res: Response) {
    try {
      const members = await Member.findAll();
      res.json(members);
    } catch (error) {
      console.error('❌ 獲取會員列表錯誤:', error);
      res.status(500).json({ 
        error: '無法獲取會員列表',
        message: error instanceof Error ? error.message : '未知錯誤'
      });
    }
  }
}

export default new MemberController();
