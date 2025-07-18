
import File, { IFileModel } from '../models/file';
import Member from '../models/member';
import { Op } from 'sequelize';

interface FileUploadData {
  original_name: string;
  mime_type?: string;
  size?: number;
  url: string;
  usage: 'event_cover' | 'registration_attachment' | 'announcement_image' | 'profile_avatar';
  uploaded_by?: string;
  related_id?: string;
}

interface FileSearchOptions {
  usage?: string;
  uploaded_by?: string;
  related_id?: string;
  status?: string;
  limit?: number;
  offset?: number;
}

class FileService {
  /**
   * 上傳檔案記錄
   */
  async uploadFile(fileData: FileUploadData): Promise<IFileModel> {
    try {
      // 驗證檔案用途
      const validUsages = ['event_cover', 'registration_attachment', 'announcement_image', 'profile_avatar'];
      if (!validUsages.includes(fileData.usage)) {
        throw new Error(`無效的檔案用途：${fileData.usage}`);
      }

      // 驗證上傳者（如果提供）
      if (fileData.uploaded_by) {
        const uploader = await Member.findByPk(fileData.uploaded_by);
        if (!uploader) {
          throw new Error('上傳者不存在');
        }
      }

      const file = await File.create({
        ...fileData,
        status: 'active'
      });

      return file.getPublicData();
    } catch (error) {
      console.error('檔案上傳失敗:', error);
      throw error;
    }
  }

  /**
   * 根據 ID 獲取檔案
   */
  async getFileById(id: string): Promise<IFileModel | null> {
    try {
      const file = await File.findByPk(id, {
        include: [
          {
            model: Member,
            as: 'uploader',
            attributes: ['id', 'name', 'email']
          }
        ]
      });

      return file ? file.getPublicData() : null;
    } catch (error) {
      console.error('獲取檔案失敗:', error);
      throw error;
    }
  }

  /**
   * 搜尋檔案
   */
  async searchFiles(options: FileSearchOptions) {
    try {
      const whereClause: any = { status: 'active' };

      if (options.usage) {
        whereClause.usage = options.usage;
      }

      if (options.uploaded_by) {
        whereClause.uploaded_by = options.uploaded_by;
      }

      if (options.related_id) {
        whereClause.related_id = options.related_id;
      }

      if (options.status) {
        whereClause.status = options.status;
      }

      const result = await File.findAndCountAll({
        where: whereClause,
        limit: options.limit || 20,
        offset: options.offset || 0,
        order: [['created_at', 'DESC']],
        include: [
          {
            model: Member,
            as: 'uploader',
            attributes: ['id', 'name', 'email'],
            required: false
          }
        ]
      });

      return {
        files: result.rows.map(file => file.getPublicData()),
        total: result.count,
        limit: options.limit || 20,
        offset: options.offset || 0
      };
    } catch (error) {
      console.error('搜尋檔案失敗:', error);
      throw error;
    }
  }

  /**
   * 刪除檔案（軟刪除）
   */
  async deleteFile(id: string): Promise<void> {
    try {
      const file = await File.findByPk(id);

      if (!file) {
        throw new Error('檔案不存在');
      }

      await file.update({ status: 'deleted' });
    } catch (error) {
      console.error('刪除檔案失敗:', error);
      throw error;
    }
  }

  /**
   * 根據用途獲取檔案
   */
  async getFilesByUsage(usage: string, relatedId?: string): Promise<IFileModel[]> {
    try {
      const whereClause: any = {
        usage,
        status: 'active'
      };

      if (relatedId) {
        whereClause.related_id = relatedId;
      }

      const files = await File.findAll({
        where: whereClause,
        order: [['created_at', 'DESC']],
        include: [
          {
            model: Member,
            as: 'uploader',
            attributes: ['id', 'name'],
            required: false
          }
        ]
      });

      return files.map(file => file.getPublicData());
    } catch (error) {
      console.error('根據用途獲取檔案失敗:', error);
      throw error;
    }
  }

  /**
   * 更新檔案資訊
   */
  async updateFile(id: string, updateData: Partial<FileUploadData>): Promise<IFileModel> {
    try {
      const file = await File.findByPk(id);

      if (!file) {
        throw new Error('檔案不存在');
      }

      await file.update(updateData);
      return file.getPublicData();
    } catch (error) {
      console.error('更新檔案失敗:', error);
      throw error;
    }
  }

  /**
   * 獲取檔案統計
   */
  async getFileStats() {
    try {
      const [totalFiles, imageFiles, documentFiles, videoFiles] = await Promise.all([
        File.count({ where: { status: 'active' } }),
        File.count({ 
          where: { 
            status: 'active',
            mime_type: { [Op.like]: 'image/%' }
          }
        }),
        File.count({ 
          where: { 
            status: 'active',
            mime_type: { [Op.or]: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'] }
          }
        }),
        File.count({ 
          where: { 
            status: 'active',
            mime_type: { [Op.like]: 'video/%' }
          }
        })
      ]);

      const totalSize = await File.sum('size', { where: { status: 'active' } }) || 0;

      return {
        totalFiles,
        imageFiles,
        documentFiles,
        videoFiles,
        totalSize: Math.round(totalSize / 1024 / 1024 * 100) / 100 // MB
      };
    } catch (error) {
      console.error('獲取檔案統計失敗:', error);
      throw error;
    }
  }
}

export default new FileService();
