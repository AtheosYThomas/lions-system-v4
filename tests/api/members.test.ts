import request from 'supertest';
import app from '../../src/app';
import { db } from '../utils/testDatabase';

describe('GET /api/members', () => {
  beforeEach(async () => {
    // 每個測試前清理資料
    await db.clean();
  });

  afterEach(async () => {
    // 每個測試後清理資料
    await db.clean();
    console.log('🧽 測試結束，資料已清除');
  });

  it('應回傳會員清單', async () => {
    // 建立測試會員
    await db.createTestMember({
      name: '張三',
      email: 'zhang@example.com',
      role: 'member',
    });
    await db.createTestMember({
      name: '李四',
      email: 'li@example.com',
      role: 'officer',
    });

    const res = await request(app).get('/api/members');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBe(2);
  });

  it('應能建立新會員', async () => {
    const memberData = {
      name: '新會員',
      email: 'new@example.com',
      line_uid: 'new_test_uid',
      role: 'member',
    };

    const res = await request(app)
      .post('/api/members')
      .send(memberData);

    expect(res.statusCode).toBe(201);
    expect(res.body.name).toBe(memberData.name);
  });
});