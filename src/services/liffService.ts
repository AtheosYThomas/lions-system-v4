
import prisma from "../config/prisma";

export async function getMemberWithEventsByLineUserId(lineUserId: string) {
  const member = await prisma.member.findUnique({
    where: { line_user_id: lineUserId },
    include: {
      registrations: {
        include: { 
          event: true
        },
      },
      checkins: {
        include: {
          event: true
        }
      }
    },
  });

  if (!member) return null;

  const events = member.registrations.map((reg: any) => {
    // 檢查該活動是否有簽到記錄
    const hasCheckin = member.checkins.some((checkin: any) => checkin.event_id === reg.event_id);
    
    return {
      id: reg.event.id,
      name: reg.event.title, // 使用 title 而不是 name，根據 schema
      date: reg.event.date?.toISOString().slice(0, 10),
      status: hasCheckin ? "checked_in" : "not_checked_in",
    };
  });

  return {
    name: member.name,
    email: member.email,
    events,
  };
}

export async function checkMemberExists(lineUserId: string): Promise<boolean> {
  try {
    const member = await prisma.member.findUnique({
      where: { line_user_id: lineUserId }
    });
    return Boolean(member);
  } catch (error) {
    console.error('LIFF Service - 檢查會員存在失敗:', error);
    throw error;
  }
}

export default {
  getMemberWithEventsByLineUserId,
  checkMemberExists
};
