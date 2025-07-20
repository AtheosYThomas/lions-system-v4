
import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

class MemberController {
  /**
   * 獲取會員列表
   */
  async getMembers(req: Request, res: Response) {
    try {
      const { 
        page = '1', 
        limit = '20', 
        search = '', 
        status = '', 
        role = '' 
      } = req.query;

      const pageNum = parseInt(page as string);
      const limitNum = parseInt(limit as string);
      const offset = (pageNum - 1) * limitNum;

      // 構建查詢條件
      const whereClause: any = {};

      if (search) {
        whereClause.OR = [
          { name: { contains: search as string, mode: 'insensitive' } },
          { email: { contains: search as string, mode: 'insensitive' } }
        ];
      }

      if (status) {
        whereClause.status = status as string;
      }

      if (role) {
        whereClause.role = role as string;
      }

      const [members, total] = await Promise.all([
        prisma.member.findMany({
          where: whereClause,
          take: limitNum,
          skip: offset,
          orderBy: { created_at: 'desc' },
          select: {
            id: true,
            name: true,
            email: true,
            line_user_id: true,
            role: true,
            phone: true,
            english_name: true,
            birthday: true,
            job_title: true,
            mobile: true,
            fax: true,
            address: true,
            status: true,
            created_at: true
          }
        }),
        prisma.member.count({ where: whereClause })
      ]);

      res.json({
        success: true,
        data: {
          members,
          pagination: {
            current: pageNum,
            pageSize: limitNum,
            total,
            totalPages: Math.ceil(total / limitNum)
          }
        }
      });

    } catch (error) {
      console.error('獲取會員列表失敗:', error);
      res.status(500).json({
        success: false,
        error: '獲取會員列表失敗',
        message: error instanceof Error ? error.message : '未知錯誤'
      });
    }
  }

  /**
   * 根據 ID 獲取單一會員
   */
  async getMemberById(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const member = await prisma.member.findUnique({
        where: { id }
      });

      if (!member) {
        return res.status(404).json({
          success: false,
          error: '會員不存在'
        });
      }

      res.json({
        success: true,
        data: member
      });

    } catch (error) {
      console.error('獲取會員失敗:', error);
      res.status(500).json({
        success: false,
        error: '獲取會員失敗',
        message: error instanceof Error ? error.message : '未知錯誤'
      });
    }
  }

  /**
   * 創建新會員
   */
  async createMember(req: Request, res: Response) {
    try {
      const memberData = req.body;

      // 檢查必要欄位
      if (!memberData.name || !memberData.line_user_id || !memberData.role) {
        return res.status(400).json({
          success: false,
          error: '缺少必要欄位：name, line_user_id, role'
        });
      }

      // 檢查 LINE UID 是否已存在
      const existingMember = await prisma.member.findUnique({
        where: { line_user_id: memberData.line_user_id }
      });

      if (existingMember) {
        return res.status(400).json({
          success: false,
          error: '此 LINE 帳號已被註冊'
        });
      }

      // 檢查 email 是否已存在（如果提供）
      if (memberData.email) {
        const existingEmail = await prisma.member.findFirst({
          where: { email: memberData.email }
        });

        if (existingEmail) {
          return res.status(400).json({
            success: false,
            error: '此 Email 已被註冊'
          });
        }
      }

      const member = await prisma.member.create({
        data: {
          ...memberData,
          status: memberData.status || 'active'
        }
      });

      res.status(201).json({
        success: true,
        data: member,
        message: '會員創建成功'
      });

    } catch (error) {
      console.error('創建會員失敗:', error);
      res.status(500).json({
        success: false,
        error: '創建會員失敗',
        message: error instanceof Error ? error.message : '未知錯誤'
      });
    }
  }

  /**
   * 更新會員資料
   */
  async updateMember(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const updateData = req.body;

      // 檢查會員是否存在
      const existingMember = await prisma.member.findUnique({
        where: { id }
      });

      if (!existingMember) {
        return res.status(404).json({
          success: false,
          error: '會員不存在'
        });
      }

      // 如果要更新 email，檢查是否與其他會員重複
      if (updateData.email && updateData.email !== existingMember.email) {
        const emailExists = await prisma.member.findFirst({
          where: { 
            email: updateData.email,
            id: { not: id }
          }
        });

        if (emailExists) {
          return res.status(400).json({
            success: false,
            error: '此 Email 已被其他會員使用'
          });
        }
      }

      // 如果要更新 LINE UID，檢查是否與其他會員重複
      if (updateData.line_user_id && updateData.line_user_id !== existingMember.line_user_id) {
        const lineExists = await prisma.member.findFirst({
          where: { 
            line_user_id: updateData.line_user_id,
            id: { not: id }
          }
        });

        if (lineExists) {
          return res.status(400).json({
            success: false,
            error: '此 LINE 帳號已被其他會員使用'
          });
        }
      }

      const member = await prisma.member.update({
        where: { id },
        data: updateData
      });

      res.json({
        success: true,
        data: member,
        message: '會員資料更新成功'
      });

    } catch (error) {
      console.error('更新會員失敗:', error);
      res.status(500).json({
        success: false,
        error: '更新會員失敗',
        message: error instanceof Error ? error.message : '未知錯誤'
      });
    }
  }

  /**
   * 軟刪除會員
   */
  async deactivateMember(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const existingMember = await prisma.member.findUnique({
        where: { id }
      });

      if (!existingMember) {
        return res.status(404).json({
          success: false,
          error: '會員不存在'
        });
      }

      await prisma.member.update({
        where: { id },
        data: { status: 'inactive' }
      });

      res.json({
        success: true,
        message: '會員已停用'
      });

    } catch (error) {
      console.error('停用會員失敗:', error);
      res.status(500).json({
        success: false,
        error: '停用會員失敗',
        message: error instanceof Error ? error.message : '未知錯誤'
      });
    }
  }

  /**
   * 獲取會員統計
   */
  async getMemberStats(req: Request, res: Response) {
    try {
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
            line_user_id: { 
              not: null as any
            },
            status: 'active'
          }
        })
      ]);

      res.json({
        success: true,
        data: {
          total,
          active,
          inactive,
          officers,
          members,
          withLineAccount
        }
      });

    } catch (error) {
      console.error('獲取會員統計失敗:', error);
      res.status(500).json({
        success: false,
        error: '獲取會員統計失敗',
        message: error instanceof Error ? error.message : '未知錯誤'
      });
    }
  }
}

export default new MemberController();
