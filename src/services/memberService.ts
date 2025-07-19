
import { Member, MemberAttributes, MemberCreationAttributes } from '../models/member';
import { Op } from 'sequelize';

interface MemberSearchOptions {
  name?: string;
  email?: string;
  status?: string;
  role?: string;
  line_user_id?: string;
  limit?: number;
  offset?: number;
}

interface MemberUpdateData extends Partial<MemberAttributes> {
  id: string;
}

class MemberService {
  /**
   * 創建新會員
   */
  async createMember(memberData: MemberCreationAttributes): Promise<Member> {
    try {
      // 檢查 email 是否已存在
      const existingMember = await Member.findOne({
        where: { email: memberData.email }
      });

      if (existingMember) {
        throw new Error('此 Email 已被註冊');
      }

      // 如果有 LINE UID，檢查是否已存在
      if (memberData.line_user_id) {
        const existingLineUser = await Member.findOne({
          where: { line_user_id: memberData.line_user_id }
        });

        if (existingLineUser) {
          throw new Error('此 LINE 帳號已被註冊');
        }
      }

      const member = await Member.create(memberData);
      return member;
    } catch (error) {
      console.error('創建會員失敗:', error);
      throw error;
    }
  }

  /**
   * 根據 ID 獲取會員
   */
  async getMemberById(id: string): Promise<Member | null> {
    try {
      return await Member.findByPk(id);
    } catch (error) {
      console.error('獲取會員失敗:', error);
      throw error;
    }
  }

  /**
   * 根據 LINE UID 獲取會員
   */
  async getMemberByLineUid(lineUid: string): Promise<Member | null> {
    try {
      return await Member.findOne({
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
  async getMemberByEmail(email: string): Promise<Member | null> {
    try {
      return await Member.findOne({
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
      const whereClause: Record<string, any> = {};

      if (options.name) {
        whereClause.name = {
          [Op.iLike]: `%${options.name}%`
        };
      }

      if (options.email) {
        whereClause.email = {
          [Op.iLike]: `%${options.email}%`
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

      const result = await Member.findAndCountAll({
        where: whereClause,
        limit: options.limit || 20,
        offset: options.offset || 0,
        order: [['name', 'ASC']]
      });

      return {
        members: result.rows,
        total: result.count,
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
  async updateMember(updateData: MemberUpdateData): Promise<Member> {
    try {
      const member = await Member.findByPk(updateData.id);
      
      if (!member) {
        throw new Error('會員不存在');
      }

      // 如果要更新 email，檢查是否與其他會員重複
      if (updateData.email && updateData.email !== member.email) {
        const existingMember = await Member.findOne({
          where: { 
            email: updateData.email,
            id: { [Op.not]: updateData.id }
          }
        });

        if (existingMember) {
          throw new Error('此 Email 已被其他會員使用');
        }
      }

      // 如果要更新 LINE UID，檢查是否與其他會員重複
      if (updateData.line_user_id && updateData.line_user_id !== member.line_user_id) {
        const existingLineUser = await Member.findOne({
          where: { 
            line_user_id: updateData.line_user_id,
            id: { [Op.not]: updateData.id }
          }
        });

        if (existingLineUser) {
          throw new Error('此 LINE 帳號已被其他會員使用');
        }
      }

      await member.update(updateData);
      return member;
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
      const member = await Member.findByPk(id);
      
      if (!member) {
        throw new Error('會員不存在');
      }

      await member.update({ status: 'inactive' });
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
        Member.count(),
        Member.count({ where: { status: 'active' } }),
        Member.count({ where: { status: 'inactive' } }),
        Member.count({ where: { role: 'officer', status: 'active' } }),
        Member.count({ where: { role: 'member', status: 'active' } }),
        Member.count({
          where: { 
            line_user_id: { [Op.ne]: null as any },
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
  async bindLineAccount(memberId: string, lineUid: string): Promise<Member> {
    try {
      // 檢查 LINE UID 是否已被使用
      const existingLineUser = await Member.findOne({
        where: { 
          line_user_id: lineUid,
          id: { [Op.not]: memberId }
        }
      });

      if (existingLineUser) {
        throw new Error('此 LINE 帳號已被其他會員綁定');
      }

      const member = await Member.findByPk(memberId);
      if (!member) {
        throw new Error('會員不存在');
      }

      await member.update({ line_user_id: lineUid });
      return member;
    } catch (error) {
      console.error('綁定 LINE 帳號失敗:', error);
      throw error;
    }
  }
}

export default new MemberService();
