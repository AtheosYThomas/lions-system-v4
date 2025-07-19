
import request from 'supertest';
import app from '../src/app';
import { TestUtils } from './utils';
import { Member } from '../src/models/member';
import { Event } from '../src/models/event';
import { Registration } from '../src/models/registration';
import { Checkin } from '../src/models/checkin';

describe('🦁 V4.0 北大獅子會系統完整流程測試', () => {
  let testLineUserId: string;
  let testMember: any;
  let testEvent: any;
  let registrationId: string;

  beforeAll(async () => {
    // 生成測試用 LINE User ID
    testLineUserId = TestUtils.generateTestLineUserId();
    console.log(`🧪 測試 LINE User ID: ${testLineUserId}`);
  });

  afterAll(async () => {
    // 清理測試資料
    await TestUtils.cleanupTestData(testLineUserId);
  });

  describe('📱 LIFF 會員註冊流程', () => {
    it('1️⃣ 檢查會員狀態 - 新用戶', async () => {
      const response = await request(app)
        .post('/api/liff/check-member')
        .send({
          line_user_id: testLineUserId,
          display_name: '測試用戶',
          picture_url: 'https://example.com/avatar.jpg'
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.is_member).toBe(false);
      expect(response.body.message).toBe('您尚未註冊會員，請完成註冊程序');

      console.log('✅ 新用戶檢查通過');
    });

    it('2️⃣ LIFF 會員註冊 - line_user_id 正確寫入', async () => {
      const memberData = TestUtils.generateTestMemberData(testLineUserId);

      const response = await request(app)
        .post('/api/liff/register')
        .send(memberData);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('註冊成功，請等待管理員審核');

      // 驗證資料庫中的記錄
      const dbMember = await Member.findOne({ 
        where: { line_user_id: testLineUserId } 
      });

      expect(dbMember).toBeTruthy();
      expect(dbMember!.line_user_id).toBe(testLineUserId);
      expect(dbMember!.name).toBe(memberData.name);
      expect(dbMember!.email).toBe(memberData.email);
      expect(dbMember!.status).toBe('pending');

      testMember = dbMember;
      console.log('✅ LIFF 註冊成功，line_user_id 正確寫入資料庫');
    });

    it('3️⃣ 重複註冊檢查', async () => {
      const response = await request(app)
        .post('/api/liff/check-member')
        .send({
          line_user_id: testLineUserId,
          display_name: '測試用戶',
          picture_url: 'https://example.com/avatar.jpg'
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.is_member).toBe(true);
      expect(response.body.member_name).toBe(testMember.name);

      console.log('✅ 重複註冊檢查通過');
    });
  });

  describe('🎭 活動管理流程', () => {
    it('4️⃣ 啟用會員帳號', async () => {
      // 模擬管理員啟用會員
      await testMember.update({ status: 'active' });

      const updatedMember = await Member.findByPk(testMember.id);
      expect(updatedMember!.status).toBe('active');

      console.log('✅ 會員帳號已啟用');
    });

    it('5️⃣ 建立測試活動', async () => {
      const eventData = TestUtils.generateTestEventData(testMember.id);

      const response = await request(app)
        .post('/api/events')
        .send(eventData);

      expect(response.status).toBe(201);
      expect(response.body.title).toBe(eventData.title);
      expect(response.body.status).toBe('pending');
      expect(response.body.created_by).toBe(testMember.id);

      testEvent = response.body;
      console.log('✅ 測試活動建立成功');
    });

    it('6️⃣ 審核活動並生成 QR Code', async () => {
      const response = await request(app)
        .patch(`/api/events/${testEvent.id}`)
        .send({ status: 'approved' });

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('approved');

      // 檢查 QR Code 是否生成
      const updatedEvent = await Event.findByPk(testEvent.id);
      expect(updatedEvent!.qr_code).toBeTruthy();

      if (updatedEvent!.qr_code_url) {
        expect(TestUtils.validateQRCodeUrl(updatedEvent!.qr_code_url)).toBe(true);
        console.log(`✅ QR Code 生成成功: ${updatedEvent!.qr_code_url}`);
      }

      testEvent = updatedEvent;
    });
  });

  describe('📝 報名與簽到流程', () => {
    it('7️⃣ 會員報名活動', async () => {
      const response = await request(app)
        .post('/api/registration')
        .send({
          member_id: testMember.id,
          event_id: testEvent.id,
          notes: '測試報名'
        });

      expect(response.status).toBe(201);
      expect(response.body.member_id).toBe(testMember.id);
      expect(response.body.event_id).toBe(testEvent.id);
      expect(response.body.status).toBe('registered');

      registrationId = response.body.id;
      console.log('✅ 活動報名成功');
    });

    it('8️⃣ QR Code 簽到', async () => {
      const response = await request(app)
        .post('/api/checkin')
        .send({
          member_id: testMember.id,
          event_id: testEvent.id,
          checkin_method: 'qr_code'
        });

      expect(response.status).toBe(201);
      expect(response.body.member_id).toBe(testMember.id);
      expect(response.body.event_id).toBe(testEvent.id);
      expect(response.body.checkin_method).toBe('qr_code');

      console.log('✅ QR Code 簽到成功');
    });

    it('9️⃣ 驗證簽到狀態', async () => {
      const checkin = await Checkin.findOne({
        where: {
          member_id: testMember.id,
          event_id: testEvent.id
        }
      });

      expect(checkin).toBeTruthy();
      expect(checkin!.checkin_method).toBe('qr_code');
      expect(checkin!.checkin_time).toBeTruthy();

      console.log('✅ 簽到狀態驗證通過');
    });
  });

  describe('🔍 資料完整性驗證', () => {
    it('🔟 驗證會員資料完整性', async () => {
      const member = await Member.findByPk(testMember.id);

      expect(member).toBeTruthy();
      expect(member!.line_user_id).toBe(testLineUserId);
      expect(TestUtils.validateLineUserId(member!.line_user_id)).toBe(true);
      expect(member!.status).toBe('active');
      expect(member!.role).toBe('member');

      console.log('✅ 會員資料完整性驗證通過');
    });

    it('1️⃣1️⃣ 驗證活動資料完整性', async () => {
      const event = await Event.findByPk(testEvent.id);

      expect(event).toBeTruthy();
      expect(event!.status).toBe('approved');
      expect(event!.qr_code).toBeTruthy();
      expect(event!.created_by).toBe(testMember.id);

      console.log('✅ 活動資料完整性驗證通過');
    });

    it('1️⃣2️⃣ 驗證報名與簽到關聯', async () => {
      const registration = await Registration.findOne({
        where: {
          member_id: testMember.id,
          event_id: testEvent.id
        }
      });

      const checkin = await Checkin.findOne({
        where: {
          member_id: testMember.id,
          event_id: testEvent.id
        }
      });

      expect(registration).toBeTruthy();
      expect(checkin).toBeTruthy();
      expect(registration!.status).toBe('registered');

      console.log('✅ 報名與簽到關聯驗證通過');
    });
  });

  describe('📊 系統健康度檢查', () => {
    it('1️⃣3️⃣ Health Check API', async () => {
      const response = await request(app).get('/health');

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('healthy');
      expect(response.body.database).toBe('connected');
      expect(response.body.services.line).toBe('configured');

      console.log('✅ 系統健康度檢查通過');
    });

    it('1️⃣4️⃣ LIFF 配置檢查', async () => {
      const response = await request(app).get('/api/liff/config');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.liffId).toBeTruthy();

      console.log(`✅ LIFF 配置檢查通過: ${response.body.liffId}`);
    });
  });
});
