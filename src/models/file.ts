
import { Model, DataTypes } from 'sequelize';
import sequelize from '../config/database';

export interface IFileModel {
  id: number;
  original_name: string;
  mime_type?: string;
  size?: number;
  url: string;
  usage: 'event_cover' | 'registration_attachment' | 'announcement_image' | 'profile_avatar';
  uploaded_by?: number;
  related_id?: number;
  status: string;
  created_at: Date;
  updated_at: Date;
}

// 使用泛型擴充 Sequelize Model 類型
class File extends Model<IFileModel> implements IFileModel {
  public id!: number;
  public original_name!: string;
  public mime_type?: string;
  public size?: number;
  public url!: string;
  public usage!: 'event_cover' | 'registration_attachment' | 'announcement_image' | 'profile_avatar';
  public uploaded_by?: number;
  public related_id?: number;
  public status!: string;
  public readonly created_at!: Date;
  public readonly updated_at!: Date;

  public getPublicData(): IFileModel {
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
  }
}

File.init({
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
  // 明確定義 timestamp 欄位
  created_at: {
    type: DataTypes.DATE,
    allowNull: false,
    field: 'created_at',
  },
  updated_at: {
    type: DataTypes.DATE,
    allowNull: false,
    field: 'updated_at',
  },
}, {
  sequelize,
  tableName: 'files',
  modelName: 'File',
  timestamps: true,
  underscored: true, // 使用 snake_case 命名慣例
  createdAt: 'created_at',
  updatedAt: 'updated_at',
});

export default File;
