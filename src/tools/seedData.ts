
import sequelize from '../config/database';
import { Member, Event, Registration } from '../models';

const seedTestData = async () => {
  try {
    console.log('🌱 開始建立測試資料...');
    
    // 建立測試會員
    const members = await Member.bulkCreate([
      {
        name: '王小明',
        email: 'ming@example.com',
        birthday: '1990-01-15',
        job_title: '軟體工程師',
        mobile: '0912345678',
        address: '台北市信義區信義路一段100號',
        status: 'active'
      },
      {
        name: '李美華',
        email: 'mei@example.com',
        birthday: '1985-05-20',
        job_title: '行銷經理',
        mobile: '0987654321',
        address: '台北市大安區復興南路二段200號',
        status: 'active'
      },
      {
        name: '張志偉',
        email: 'wei@example.com',
        birthday: '1992-08-10',
        job_title: '設計師',
        mobile: '0911111111',
        address: '台北市中山區中山北路三段300號',
        status: 'inactive'
      },
      {
        name: '陳雅婷',
        email: 'ya@example.com',
        birthday: '1988-12-03',
        job_title: '會計師',
        mobile: '0922222222',
        address: '台北市松山區敦化北路400號',
        status: 'active'
      },
      {
        name: '劉大偉',
        email: 'david@example.com',
        birthday: '1995-03-25',
        job_title: '業務經理',
        mobile: '0933333333',
        address: '台北市內湖區內湖路一段500號',
        status: 'active'
      }
    ]);

    console.log(`✅ 建立了 ${members.length} 個測試會員`);

    // 建立測試活動
    const events = await Event.bulkCreate([
      {
        title: '北大獅子會月例會',
        description: '每月定期會議，討論社團事務和活動規劃',
        date: new Date('2024-02-15T19:00:00'),
        location: '台北市中正區重慶南路一段122號',
        max_attendees: 50,
        status: 'active'
      },
      {
        title: '春節聯歡活動',
        description: '歡慶農曆新年，會員聚餐聯誼',
        date: new Date('2024-02-20T18:30:00'),
        location: '台北市信義區松仁路100號',
        max_attendees: 80,
        status: 'active'
      },
      {
        title: '公益淨灘活動',
        description: '響應環保，前往海邊進行淨灘服務',
        date: new Date('2024-03-10T09:00:00'),
        location: '新北市淡水區沙崙海邊',
        max_attendees: 30,
        status: 'active'
      },
      {
        title: '年度大會',
        description: '年度會員大會，選舉新任幹部',
        date: new Date('2024-06-15T14:00:00'),
        location: '台北市大安區羅斯福路四段1號',
        max_attendees: 100,
        status: 'planned'
      }
    ]);

    console.log(`✅ 建立了 ${events.length} 個測試活動`);

    // 建立測試報名記錄
    const registrations = [];
    
    // 為每個活動建立一些報名記錄
    for (let i = 0; i < events.length; i++) {
      const event = events[i];
      const numRegistrations = Math.floor(Math.random() * 4) + 1; // 1-4 人報名
      
      for (let j = 0; j < numRegistrations && j < members.length; j++) {
        registrations.push({
          event_id: event.id,
          member_id: members[j].id,
          status: Math.random() > 0.1 ? 'confirmed' : 'pending' // 90% 確認，10% 等待中
        });
      }
    }

    const createdRegistrations = await Registration.bulkCreate(registrations);
    console.log(`✅ 建立了 ${createdRegistrations.length} 個測試報名記錄`);

    console.log('🎉 測試資料建立完成！');
    
    // 顯示統計摘要
    const stats = {
      總會員數: members.length,
      活躍會員數: members.filter(m => m.status === 'active').length,
      總活動數: events.length,
      總報名數: registrations.length
    };
    
    console.log('📊 資料統計:');
    console.table(stats);
    
  } catch (error) {
    console.error('❌ 建立測試資料失敗:', error);
  } finally {
    await sequelize.close();
  }
};

// 如果直接執行此檔案
if (require.main === module) {
  seedTestData();
}

export default seedTestData;
