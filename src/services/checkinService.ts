import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface PerformCheckinParams {
  member_id: string;
  event_id: string;
  device_info?: string;
}

interface CheckinSearchOptions {
  event_id?: string;
  member_id?: string;
  dateFrom?: Date;
  dateTo?: Date;
  limit?: number;
  offset?: number;
}

export async function performCheckin({
  member_id,
  event_id,
  device_info
}: PerformCheckinParams) {
  // 1️⃣ 檢查活動是否存在
  const event = await prisma.event.findUnique({
    where: { id: event_id },
  });

  if (!event) {
    throw new Error('找不到指定的活動');
  }

  // 2️⃣ 檢查活動是否已截止（預設使用活動當天 23:59）
  const now = new Date();
  const eventEnd = new Date(event.date);
  eventEnd.setHours(23, 59, 59, 999);

  if (now > eventEnd) {
    throw new Error('此活動已結束，無法簽到');
  }

  // 3️⃣ 檢查是否已簽到過
  const existingCheckin = await prisma.checkin.findFirst({
    where: {
      member_id,
      event_id,
    },
  });

  if (existingCheckin) {
    throw new Error('您已經簽到過了');
  }

  // 4️⃣ 可選：檢查是否有報名紀錄（若你的系統需要報名才可簽到）
  const registration = await prisma.eventRegistration.findFirst({
    where: {
      member_id,
      event_id,
      status: 'confirmed', // ✅ 若你有報名審核制
    },
  });

  if (!registration) {
    console.warn(`會員 ${member_id} 沒有報名活動 ${event_id} 但進行了簽到`);
  }

  // 5️⃣ 建立簽到記錄
  const checkin = await prisma.checkin.create({
    data: {
      member_id,
      event_id,
      device_info,
    },
    include: {
      event: true, // ✅ 回傳包含 event.title 等欄位
      member: {
        select: {
          id: true,
          name: true,
          email: true
        }
      }
    },
  });

  return checkin;
}

/**
 * 檢查會員是否已簽到
 */
export async function isCheckedIn(memberId: string, eventId: string): Promise<boolean> {
  try {
    const checkin = await prisma.checkin.findFirst({
      where: {
        member_id: memberId,
        event_id: eventId
      }
    });

    return !!checkin;
  } catch (error) {
    console.error('檢查簽到狀態失敗:', error);
    throw error;
  }
}

/**
 * 獲取會員的簽到記錄
 */
export async function getMemberCheckins(memberId: string, options: Partial<CheckinSearchOptions> = {}) {
  try {
    const whereClause: any = { member_id: memberId };

    if (options.event_id) {
      whereClause.event_id = options.event_id;
    }

    if (options.dateFrom || options.dateTo) {
      whereClause.checkin_time = {};
      if (options.dateFrom) {
        whereClause.checkin_time.gte = options.dateFrom;
      }
      if (options.dateTo) {
        whereClause.checkin_time.lte = options.dateTo;
      }
    }

    const [checkins, total] = await Promise.all([
      prisma.checkin.findMany({
        where: whereClause,
        include: {
          event: {
            select: {
              id: true,
              title: true,
              date: true,
              location: true
            }
          }
        },
        orderBy: {
          checkin_time: 'desc'
        },
        take: options.limit || 20,
        skip: options.offset || 0
      }),
      prisma.checkin.count({
        where: whereClause
      })
    ]);

    return {
      checkins,
      total,
      limit: options.limit || 20,
      offset: options.offset || 0
    };
  } catch (error) {
    console.error('獲取會員簽到記錄失敗:', error);
    throw error;
  }
}

/**
 * 獲取活動的簽到記錄
 */
export async function getEventCheckins(eventId: string, options: Partial<CheckinSearchOptions> = {}) {
  try {
    const whereClause: any = { event_id: eventId };

    if (options.dateFrom || options.dateTo) {
      whereClause.checkin_time = {};
      if (options.dateFrom) {
        whereClause.checkin_time.gte = options.dateFrom;
      }
      if (options.dateTo) {
        whereClause.checkin_time.lte = options.dateTo;
      }
    }

    const [checkins, total] = await Promise.all([
      prisma.checkin.findMany({
        where: whereClause,
        include: {
          member: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true
            }
          }
        },
        orderBy: {
          checkin_time: 'asc'
        },
        take: options.limit || 100,
        skip: options.offset || 0
      }),
      prisma.checkin.count({
        where: whereClause
      })
    ]);

    return {
      checkins,
      total,
      limit: options.limit || 100,
      offset: options.offset || 0
    };
  } catch (error) {
    console.error('獲取活動簽到記錄失敗:', error);
    throw error;
  }
}

/**
 * 獲取簽到統計
 */
export async function getCheckinStats(eventId?: string) {
  try {
    if (eventId) {
      // 單一活動簽到統計
      const [checkinCount, registrationCount] = await Promise.all([
        prisma.checkin.count({ where: { event_id: eventId } }),
        prisma.eventRegistration.count({ where: { event_id: eventId, status: 'confirmed' } })
      ]);

      const attendanceRate = registrationCount > 0 ? (checkinCount / registrationCount) * 100 : 0;

      // 按小時統計簽到分布
      const checkins = await prisma.checkin.findMany({
        where: { event_id: eventId },
        select: {
          checkin_time: true
        },
        orderBy: {
          checkin_time: 'asc'
        }
      });

      const hourlyStats: { [hour: string]: number } = {};
      checkins.forEach(checkin => {
        const hour = new Date(checkin.checkin_time).getHours().toString().padStart(2, '0');
        hourlyStats[hour] = (hourlyStats[hour] || 0) + 1;
      });

      return {
        eventId,
        totalCheckins: checkinCount,
        totalRegistrations: registrationCount,
        attendanceRate: Math.round(attendanceRate * 100) / 100,
        hourlyDistribution: hourlyStats
      };
    } else {
      // 全體簽到統計
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

      const [totalCheckins, todayCheckins, thisWeekCheckins] = await Promise.all([
        prisma.checkin.count(),
        prisma.checkin.count({
          where: {
            checkin_time: {
              gte: today
            }
          }
        }),
        prisma.checkin.count({
          where: {
            checkin_time: {
              gte: oneWeekAgo
            }
          }
        })
      ]);

      return {
        totalCheckins,
        todayCheckins,
        thisWeekCheckins
      };
    }
  } catch (error) {
    console.error('獲取簽到統計失敗:', error);
    throw error;
  }
}

/**
 * 獲取活動的報名記錄
 */
export async function getEventRegistrations(eventId: string) {
  try {
    return await prisma.eventRegistration.findMany({
      where: { event_id: eventId },
      include: {
        member: true,
        event: true,
      },
      orderBy: { created_at: 'desc' }
    });
  } catch (error) {
    console.error('獲取活動報名記錄失敗:', error);
    throw error;
  }
}

/**
 * 驗證簽到資格
 */
export async function validateCheckinEligibility(memberId: string, eventId: string): Promise<boolean> {
  try {
    // 檢查會員是否已註冊該活動
    const registration = await prisma.eventRegistration.findFirst({
      where: {
        member_id: memberId,
        event_id: eventId,
        status: 'confirmed' // 只有確認的報名才能簽到
      }
    });

    return Boolean(registration);
  } catch (error) {
    console.error('驗證簽到資格失敗:', error);
    throw error;
  }
}

export default {
  performCheckin,
  isCheckedIn,
  getMemberCheckins,
  getEventCheckins,
  getCheckinStats,
  getEventRegistrations,
  validateCheckinEligibility
};