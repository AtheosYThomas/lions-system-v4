
import request from 'supertest';
import app from '../../src/app';

describe('Events API', () => {
  describe('GET /api/events', () => {
    it('應回傳活動列表', async () => {
      const res = await request(app).get('/api/events');
      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('success');
      expect(res.body).toHaveProperty('events');
      expect(Array.isArray(res.body.events)).toBe(true);
    });
  });

  describe('POST /api/events/create', () => {
    it('應成功建立活動', async () => {
      const eventData = {
        title: '測試活動',
        description: '這是一個測試活動',
        date: '2025-07-30T10:00:00Z',
        location: '線上會議',
        max_attendees: 50
      };

      const res = await request(app)
        .post('/api/events/create')
        .send(eventData);

      expect(res.statusCode).toBe(201);
      expect(res.body).toHaveProperty('success', true);
      expect(res.body).toHaveProperty('event');
      expect(res.body.event.title).toBe('測試活動');
    });

    it('缺少必要欄位時應回傳錯誤', async () => {
      const eventData = {
        description: '缺少標題和日期'
      };

      const res = await request(app)
        .post('/api/events/create')
        .send(eventData);

      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty('error');
    });
  });

  describe('GET /api/events/:eventId', () => {
    it('應回傳指定活動詳情', async () => {
      // 先建立一個測試活動
      const createRes = await request(app)
        .post('/api/events/create')
        .send({
          title: '測試活動詳情',
          date: '2025-07-30T10:00:00Z',
          location: '測試地點'
        });

      const eventId = createRes.body.event.id;

      const res = await request(app).get(`/api/events/${eventId}`);
      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('success', true);
      expect(res.body).toHaveProperty('event');
      expect(res.body).toHaveProperty('qrCode');
      expect(res.body.event.id).toBe(eventId);
    });

    it('活動不存在時應回傳 404', async () => {
      const res = await request(app).get('/api/events/non-existent-id');
      expect(res.statusCode).toBe(404);
      expect(res.body).toHaveProperty('error');
    });
  });
});
