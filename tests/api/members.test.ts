
import request from 'supertest';
import app from '../../src/app';

describe('Members API', () => {
  describe('GET /api/members', () => {
    it('應回傳會員清單', async () => {
      const res = await request(app).get('/api/members');
      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('success');
      expect(Array.isArray(res.body.members || res.body.data)).toBe(true);
    });
  });

  describe('POST /api/members', () => {
    it('應成功建立會員', async () => {
      const memberData = {
        name: '測試會員',
        email: 'test@example.com',
        phone: '0912345678',
        lineUserId: 'U' + Date.now()
      };

      const res = await request(app)
        .post('/api/members')
        .send(memberData);

      expect(res.statusCode).toBe(201);
      expect(res.body).toHaveProperty('success', true);
      expect(res.body.member.name).toBe('測試會員');
    });

    it('重複的 LINE User ID 應回傳錯誤', async () => {
      const memberData = {
        name: '重複測試',
        email: 'duplicate@example.com',
        lineUserId: 'U123456789'
      };

      // 第一次建立應該成功
      await request(app).post('/api/members').send(memberData);

      // 第二次建立相同 lineUserId 應該失敗
      const res = await request(app).post('/api/members').send(memberData);
      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty('error');
    });
  });
});
