import { Request, Response } from 'express';
import adminService from '../services/adminService';

class AdminController {
  // 系統總覽
  async getSystemSummary(req: Request, res: Response): Promise<void> {
    try {
      console.log('📊 收到系統總覽請求');
      const summary = await adminService.getSystemSummary();
      console.log('✅ 系統總覽獲取成功:', summary);
      res.json(summary);
    } catch (error) {
      console.error('❌ 系統總覽錯誤:', error);
      res.status(500).json({
        error: 'System summary failed',
        details: error instanceof Error ? error.message : '未知錯誤',
      });
    }
  }

  // 報名統計
  async getRegistrationStats(req: Request, res: Response): Promise<void> {
    try {
      console.log('📈 收到報名統計請求');
      const stats = await adminService.getRegistrationStats();
      console.log('✅ 報名統計獲取成功');
      res.json(stats);
    } catch (error) {
      console.error('❌ 報名統計錯誤:', error);
      res.status(500).json({
        error: 'Registration stats failed',
        details: error instanceof Error ? error.message : '未知錯誤',
      });
    }
  }

  // 會員狀態統計
  async getMemberStats(req: Request, res: Response): Promise<void> {
    try {
      console.log('👥 收到會員統計請求');
      const stats = await adminService.getMemberStats();
      console.log('✅ 會員統計獲取成功');
      res.json(stats);
    } catch (error) {
      console.error('❌ 會員統計錯誤:', error);
      res.status(500).json({
        error: 'Member stats failed',
        details: error instanceof Error ? error.message : '未知錯誤',
      });
    }
  }

  // 活動統計
  async getEventStats(req: Request, res: Response): Promise<void> {
    try {
      console.log('🎯 收到活動統計請求');
      const stats = await adminService.getEventStats();
      console.log('✅ 活動統計獲取成功');
      res.json(stats);
    } catch (error) {
      console.error('❌ 活動統計錯誤:', error);
      res.status(500).json({
        error: 'Event stats failed',
        details: error instanceof Error ? error.message : '未知錯誤',
      });
    }
  }

  // 簽到統計
  async getCheckinStats(req: Request, res: Response): Promise<void> {
    try {
      console.log('✅ 收到簽到統計請求');
      const stats = await adminService.getCheckinStats();
      console.log('✅ 簽到統計獲取成功');
      res.json(stats);
    } catch (error) {
      console.error('❌ 簽到統計錯誤:', error);
      res.status(500).json({
        error: 'Checkin stats failed',
        details: error instanceof Error ? error.message : '未知錯誤',
      });
    }
  }

  // 匯出會員報表
  async exportMembersReport(req: Request, res: Response): Promise<void> {
    try {
      console.log('📋 收到會員報表匯出請求');
      const { format = 'json', status, dateFrom, dateTo } = req.query;

      const filters = {
        status: status as string,
        dateFrom: dateFrom ? new Date(dateFrom as string) : undefined,
        dateTo: dateTo ? new Date(dateTo as string) : undefined,
      };

      const report = await adminService.exportMembersReport(
        filters,
        format as string
      );

      if (format === 'csv') {
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader(
          'Content-Disposition',
          'attachment; filename=members-report.csv'
        );
      }

      console.log('✅ 會員報表匯出成功');
      res.send(report);
    } catch (error) {
      console.error('❌ 會員報表匯出錯誤:', error);
      res.status(500).json({
        error: 'Members report export failed',
        details: error instanceof Error ? error.message : '未知錯誤',
      });
    }
  }

  // 匯出活動報表
  async exportEventsReport(req: Request, res: Response): Promise<void> {
    try {
      console.log('🎪 收到活動報表匯出請求');
      const { format = 'json', status, dateFrom, dateTo } = req.query;

      const filters = {
        status: status as string,
        dateFrom: dateFrom ? new Date(dateFrom as string) : undefined,
        dateTo: dateTo ? new Date(dateTo as string) : undefined,
      };

      const report = await adminService.exportEventsReport(
        filters,
        format as string
      );

      if (format === 'csv') {
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader(
          'Content-Disposition',
          'attachment; filename=events-report.csv'
        );
      }

      console.log('✅ 活動報表匯出成功');
      res.send(report);
    } catch (error) {
      console.error('❌ 活動報表匯出錯誤:', error);
      res.status(500).json({
        error: 'Events report export failed',
        details: error instanceof Error ? error.message : '未知錯誤',
      });
    }
  }

  // 匯出報名報表
  async exportRegistrationsReport(req: Request, res: Response): Promise<void> {
    try {
      console.log('📝 收到報名報表匯出請求');
      const { format = 'json', eventId, status, dateFrom, dateTo } = req.query;

      const filters = {
        eventId: eventId as string,
        status: status as string,
        dateFrom: dateFrom ? new Date(dateFrom as string) : undefined,
        dateTo: dateTo ? new Date(dateTo as string) : undefined,
      };

      const report = await adminService.exportRegistrationsReport(
        filters,
        format as string
      );

      if (format === 'csv') {
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader(
          'Content-Disposition',
          'attachment; filename=registrations-report.csv'
        );
      }

      console.log('✅ 報名報表匯出成功');
      res.send(report);
    } catch (error) {
      console.error('❌ 報名報表匯出錯誤:', error);
      res.status(500).json({
        error: 'Registrations report export failed',
        details: error instanceof Error ? error.message : '未知錯誤',
      });
    }
  }

  // 匯出簽到報表
  async exportCheckinsReport(req: Request, res: Response): Promise<void> {
    try {
      console.log('✅ 收到簽到報表匯出請求');
      const { format = 'json', eventId, dateFrom, dateTo } = req.query;

      const filters = {
        eventId: eventId as string,
        dateFrom: dateFrom ? new Date(dateFrom as string) : undefined,
        dateTo: dateTo ? new Date(dateTo as string) : undefined,
      };

      const report = await adminService.exportCheckinsReport(
        filters,
        format as string
      );

      if (format === 'csv') {
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader(
          'Content-Disposition',
          'attachment; filename=checkins-report.csv'
        );
      }

      console.log('✅ 簽到報表匯出成功');
      res.send(report);
    } catch (error) {
      console.error('❌ 簽到報表匯出錯誤:', error);
      res.status(500).json({
        error: 'Checkins report export failed',
        details: error instanceof Error ? error.message : '未知錯誤',
      });
    }
  }

  // 綜合報表
  async exportComprehensiveReport(req: Request, res: Response): Promise<void> {
    try {
      console.log('📊 收到綜合報表匯出請求');
      const { format = 'json', dateFrom, dateTo } = req.query;

      const filters = {
        dateFrom: dateFrom ? new Date(dateFrom as string) : undefined,
        dateTo: dateTo ? new Date(dateTo as string) : undefined,
      };

      const report = await adminService.exportComprehensiveReport(
        filters,
        format as string
      );

      if (format === 'csv') {
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader(
          'Content-Disposition',
          'attachment; filename=comprehensive-report.csv'
        );
      }

      console.log('✅ 綜合報表匯出成功');
      res.send(report);
    } catch (error) {
      console.error('❌ 綜合報表匯出錯誤:', error);
      res.status(500).json({
        error: 'Comprehensive report export failed',
        details: error instanceof Error ? error.message : '未知錯誤',
      });
    }
  }
}

export default new AdminController();
