
import { DataTypes } from 'sequelize';
import sequelize from '../config/database';

const FileModel = sequelize.define('File', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  original_name: {
    type: DataTypes.STRING,
    allowNull: false,
    comment: '原始檔案名稱',
  },
  mime_type: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: '檔案 MIME 類型',
  },
  size: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: '檔案大小（bytes）',
  },
  url: {
    type: DataTypes.STRING,
    allowNull: false,
    comment: 'Google Drive 公開分享網址',
  },
  usage: {
    type: DataTypes.STRING,
    allowNull: false,
    comment: '檔案用途：event_cover, registration_attachment, announcement_image, profile_avatar',
  },
  uploaded_by: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: '上傳者 ID（關聯 members.id）',
  },
  related_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: '關聯資源 ID（如活動 ID、公告 ID）',
  },
  status: {
    type: DataTypes.STRING,
    defaultValue: 'active',
    comment: '檔案狀態：active, deleted',
  },
}, {
  tableName: 'files',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
});

// Add getPublicData method to FileModel prototype
FileModel.prototype.getPublicData = function (): any {
  return {
    id: this.id,
    original_name: this.original_name,
    mime_type: this.mime_type,
    size: this.size,
    url: this.url,
    usage: this.usage,
    uploaded_by: this.uploaded_by,
    related_id: this.related_id,
    status: this.status,
    created_at: this.created_at,
    updated_at: this.updated_at,
  };
};

export default FileModel;
