import request from 'supertest';
import app from '../../src/app';
import { db } from '../utils/testDatabase';

describe('GET /api/events', () => {
  beforeEach(async () => {
    // 每個測試前清理資料
    await db.clean();
  });

  afterEach(async () => {
    // 每個測試後清理資料
    await db.clean();
    console.log('🧽 測試結束，資料已清除');
  });

  it('應回傳活動列表', async () => {
    // 建立測試資料
    await db.createTestEvent({
      title: '測試活動 1',
      date: new Date('2024-12-31'),
    });
    await db.createTestEvent({
      title: '測試活動 2',
      date: new Date('2024-11-30'),
    });

    const res = await request(app).get('/api/events');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBe(2);
  });

  it('應能建立新活動', async () => {
    const eventData = {
      title: '新測試活動',
      description: '活動描述',
      date: new Date('2024-12-31'),
      location: '測試地點',
      max_attendees: 50,
    };

    const res = await request(app)
      .post('/api/events')
      .send(eventData);

    expect(res.statusCode).toBe(201);
    expect(res.body.title).toBe(eventData.title);
  });
});