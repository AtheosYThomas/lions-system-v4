
import sequelize from '../config/database';
import { QueryInterface, DataTypes } from 'sequelize';

async function createPushRecordsTable() {
  const queryInterface = sequelize.getQueryInterface();
  
  try {
    console.log('🔧 正在創建 push_records 表...');
    
    await queryInterface.createTable('push_records', {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      member_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: 'members',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      event_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: 'events',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      message_type: {
        type: DataTypes.STRING,
        allowNull: false,
        comment: 'checkin_reminder, manual_push, event_notification',
      },
      status: {
        type: DataTypes.ENUM('success', 'failed'),
        allowNull: false,
      },
      pushed_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
      createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
      updatedAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
    });

    // 創建索引
    await queryInterface.addIndex('push_records', ['member_id']);
    await queryInterface.addIndex('push_records', ['event_id']);
    await queryInterface.addIndex('push_records', ['message_type']);
    await queryInterface.addIndex('push_records', ['status']);
    await queryInterface.addIndex('push_records', ['pushed_at']);

    console.log('✅ push_records 表創建成功');
    
  } catch (error) {
    console.error('❌ 創建 push_records 表失敗:', error);
    throw error;
  }
}

// 如果直接執行此文件
if (require.main === module) {
  createPushRecordsTable()
    .then(() => {
      console.log('🎉 資料庫遷移完成');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 資料庫遷移失敗:', error);
      process.exit(1);
    });
}

export default createPushRecordsTable;
