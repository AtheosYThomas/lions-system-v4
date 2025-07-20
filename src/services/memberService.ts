
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface MemberSearchOptions {
  name?: string;
  email?: string;
  status?: string;
  role?: string;
  line_user_id?: string;
  limit?: number;
  offset?: number;
}

interface MemberUpdateData {
  id: string;
  name?: string;
  email?: string;
  line_user_id?: string;
  role?: string;
  phone?: string;
  english_name?: string;
  birthday?: Date;
  job_title?: string;
  mobile?: string;
  fax?: string;
  address?: string;
  status?: string;
}

interface MemberCreationData {
  name: string;
  email?: string;
  line_user_id: string;
  role: string;
  phone?: string;
  english_name?: string;
  birthday?: Date;
  job_title?: string;
  mobile?: string;
  fax?: string;
  address?: string;
  status?: string;
}

class MemberService {
  /**
   * 創建新會員
   */
  async createMember(memberData: MemberCreationData) {
    try {
      // 檢查 email 是否已存在
      if (memberData.email) {
        const existingMember = await prisma.member.findFirst({
          where: { email: memberData.email }
        });

        if (existingMember) {
          throw new Error('此 Email 已被註冊');
        }
      }

      // 如果有 LINE UID，檢查是否已存在
      if (memberData.line_user_id) {
        const existingLineUser = await prisma.member.findUnique({
          where: { line_user_id: memberData.line_user_id }
        });

        if (existingLineUser) {
          throw new Error('此 LINE 帳號已被註冊');
        }
      }

      const member = await prisma.member.create({
        data: memberData
      });
      return member;
    } catch (error) {
      console.error('創建會員失敗:', error);
      throw error;
    }
  }

  /**
   * 根據 ID 獲取會員
   */
  async getMemberById(id: string) {
    try {
      return await prisma.member.findUnique({
        where: { id }
      });
    } catch (error) {
      console.error('獲取會員失敗:', error);
      throw error;
    }
  }

  /**
   * 根據 LINE UID 獲取會員
   */
  async getMemberByLineUid(lineUid: string) {
    try {
      return await prisma.member.findUnique({
        where: { line_user_id: lineUid }
      });
    } catch (error) {
      console.error('根據 LINE UID 獲取會員失敗:', error);
      throw error;
    }
  }

  /**
   * 根據 Email 獲取會員
   */
  async getMemberByEmail(email: string) {
    try {
      return await prisma.member.findFirst({
        where: { email }
      });
    } catch (error) {
      console.error('根據 Email 獲取會員失敗:', error);
      throw error;
    }
  }

  /**
   * 搜尋會員
   */
  async searchMembers(options: MemberSearchOptions) {
    try {
      const whereClause: any = {};

      if (options.name) {
        whereClause.name = {
          contains: options.name,
          mode: 'insensitive'
        };
      }

      if (options.email) {
        whereClause.email = {
          contains: options.email,
          mode: 'insensitive'
        };
      }

      if (options.status) {
        whereClause.status = options.status;
      }

      if (options.role) {
        whereClause.role = options.role;
      }

      if (options.line_user_id) {
        whereClause.line_user_id = options.line_user_id;
      }

      const [members, total] = await Promise.all([
        prisma.member.findMany({
          where: whereClause,
          take: options.limit || 20,
          skip: options.offset || 0,
          orderBy: { name: 'asc' }
        }),
        prisma.member.count({ where: whereClause })
      ]);

      return {
        members,
        total,
        limit: options.limit || 20,
        offset: options.offset || 0
      };
    } catch (error) {
      console.error('搜尋會員失敗:', error);
      throw error;
    }
  }

  /**
   * 更新會員資料
   */
  async updateMember(updateData: MemberUpdateData) {
    try {
      const member = await prisma.member.findUnique({
        where: { id: updateData.id }
      });
      
      if (!member) {
        throw new Error('會員不存在');
      }

      // 如果要更新 email，檢查是否與其他會員重複
      if (updateData.email && updateData.email !== member.email) {
        const existingMember = await prisma.member.findFirst({
          where: { 
            email: updateData.email,
            id: { not: updateData.id }
          }
        });

        if (existingMember) {
          throw new Error('此 Email 已被其他會員使用');
        }
      }

      // 如果要更新 LINE UID，檢查是否與其他會員重複
      if (updateData.line_user_id && updateData.line_user_id !== member.line_user_id) {
        const existingLineUser = await prisma.member.findFirst({
          where: { 
            line_user_id: updateData.line_user_id,
            id: { not: updateData.id }
          }
        });

        if (existingLineUser) {
          throw new Error('此 LINE 帳號已被其他會員使用');
        }
      }

      const { id, ...updateFields } = updateData;
      const updatedMember = await prisma.member.update({
        where: { id },
        data: updateFields
      });

      return updatedMember;
    } catch (error) {
      console.error('更新會員失敗:', error);
      throw error;
    }
  }

  /**
   * 軟刪除會員（設定狀態為 inactive）
   */
  async deactivateMember(id: string): Promise<void> {
    try {
      const member = await prisma.member.findUnique({
        where: { id }
      });
      
      if (!member) {
        throw new Error('會員不存在');
      }

      await prisma.member.update({
        where: { id },
        data: { status: 'inactive' }
      });
    } catch (error) {
      console.error('停用會員失敗:', error);
      throw error;
    }
  }

  /**
   * 獲取會員統計資料
   */
  async getMemberStats() {
    try {
      console.log('📊 memberService: 開始計算會員統計...');
      
      const [total, active, inactive, officers, members, withLineAccount] = await Promise.all([
        prisma.member.count(),
        prisma.member.count({ where: { status: 'active' } }),
        prisma.member.count({ where: { status: 'inactive' } }),
        prisma.member.count({ 
          where: { 
            role: 'officer',
            status: 'active'
          }
        }),
        prisma.member.count({ 
          where: { 
            role: 'member',
            status: 'active'
          }
        }),
        prisma.member.count({
          where: { 
            line_user_id: { not: { equals: null } },
            status: 'active'
          }
        })
      ]);

      const stats = {
        total,
        active,
        inactive,
        officers,
        members,
        withLineAccount
      };

      console.log('✅ memberService: 會員統計結果:', stats);
      return stats;
    } catch (error) {
      console.error('獲取會員統計失敗:', error);
      throw error;
    }
  }

  /**
   * 綁定 LINE 帳號
   */
  async bindLineAccount(memberId: string, lineUid: string) {
    try {
      // 檢查 LINE UID 是否已被使用
      const existingLineUser = await prisma.member.findFirst({
        where: { 
          line_user_id: lineUid,
          id: { not: memberId }
        }
      });

      if (existingLineUser) {
        throw new Error('此 LINE 帳號已被其他會員綁定');
      }

      const member = await prisma.member.findUnique({
        where: { id: memberId }
      });

      if (!member) {
        throw new Error('會員不存在');
      }

      const updatedMember = await prisma.member.update({
        where: { id: memberId },
        data: { line_user_id: lineUid }
      });

      return updatedMember;
    } catch (error) {
      console.error('綁定 LINE 帳號失敗:', error);
      throw error;
    }
  }
}

export default new MemberService();
