import FileModel from '../models/file';
import Member from '../models/member';
import { Op } from 'sequelize';

interface FileUploadData {
  original_name: string;
  mime_type?: string;
  size?: number;
  url: string;
  usage: 'event_cover' | 'registration_attachment' | 'announcement_image' | 'profile_avatar';
  uploaded_by?: number;
  related_id?: number;
}

interface FileSearchOptions {
  usage?: string;
  uploaded_by?: number;
  related_id?: number;
  status?: string;
  limit?: number;
  offset?: number;
}

class FileService {
  /**
   * 上傳檔案記錄
   */
  async uploadFile(fileData: FileUploadData): Promise<FileModel> {
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

      const file = await FileModel.create({
        ...fileData,
        status: 'active'
      });

      return file;
    } catch (error) {
      console.error('檔案上傳失敗:', error);
      throw error;
    }
  }

  /**
   * 根據 ID 獲取檔案
   */
  async getFileById(id: number): Promise<FileModel | null> {
    try {
      return await FileModel.findByPk(id, {
        include: [
          {
            model: Member,
            as: 'uploader',
            attributes: ['id', 'name', 'email']
          }
        ]
      });
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

      const result = await FileModel.findAndCountAll({
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
        files: result.rows,
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
  async deleteFile(id: number): Promise<void> {
    try {
      const file = await FileModel.findByPk(id);

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
  async getFilesByUsage(usage: string, relatedId?: number): Promise<FileModel[]> {
    try {
      const whereClause: any = {
        usage,
        status: 'active'
      };

      if (relatedId) {
        whereClause.related_id = relatedId;
      }

      return await FileModel.findAll({
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
    } catch (error) {
      console.error('根據用途獲取檔案失敗:', error);
      throw error;
    }
  }

  /**
   * 更新檔案資訊
   */
  async updateFile(id: number, updateData: Partial<FileUploadData>): Promise<FileModel> {
    try {
      const file = await FileModel.findByPk(id);

      if (!file) {
        throw new Error('檔案不存在');
      }

      await file.update(updateData);
      return file;
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
        FileModel.count({ where: { status: 'active' } }),
        FileModel.count({ 
          where: { 
            status: 'active',
            mime_type: { [Op.like]: 'image/%' }
          }
        }),
        FileModel.count({ 
          where: { 
            status: 'active',
            mime_type: { [Op.or]: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'] }
          }
        }),
        FileModel.count({ 
          where: { 
            status: 'active',
            mime_type: { [Op.like]: 'video/%' }
          }
        })
      ]);

      const totalSize = await FileModel.sum('size', { where: { status: 'active' } }) || 0;

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