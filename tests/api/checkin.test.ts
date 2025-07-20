
import request from 'supertest';
import app from '../../src/app';

describe('Checkin API', () => {
  let testEventId: string;
  let testMemberId: string;

  beforeAll(async () => {
    // 建立測試活動
    const eventRes = await request(app)
      .post('/api/events/create')
      .send({
        title: '簽到測試活動',
        date: '2025-07-30T10:00:00Z',
        location: '測試地點'
      });
    testEventId = eventRes.body.event.id;

    // 建立測試會員
    const memberRes = await request(app)
      .post('/api/members')
      .send({
        name: '簽到測試會員',
        email: 'checkin@test.com',
        lineUserId: 'U' + Date.now()
      });
    testMemberId = memberRes.body.member.id;
  });

  describe('POST /api/checkin', () => {
    it('應成功簽到', async () => {
      const checkinData = {
        eventId: testEventId,
        memberId: testMemberId
      };

      const res = await request(app)
        .post('/api/checkin')
        .send(checkinData);

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('success', true);
      expect(res.body).toHaveProperty('checkin');
    });

    it('重複簽到應回傳錯誤', async () => {
      const checkinData = {
        eventId: testEventId,
        memberId: testMemberId
      };

      const res = await request(app)
        .post('/api/checkin')
        .send(checkinData);

      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty('error');
    });
  });

  describe('GET /api/checkin/event/:eventId', () => {
    it('應回傳活動簽到紀錄', async () => {
      const res = await request(app).get(`/api/checkin/event/${testEventId}`);
      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('success', true);
      expect(Array.isArray(res.body.checkins)).toBe(true);
    });
  });
});
