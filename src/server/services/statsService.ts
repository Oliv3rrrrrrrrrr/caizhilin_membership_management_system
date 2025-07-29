import { PrismaClient } from '@prisma/client';
import { getSystemTodayStart } from '@/lib/timeUtils';

// 创建Prisma客户端
const prisma = new PrismaClient();

// 统计服务
export class StatsService {
  // 获取仪表盘统计数据
  static async getDashboardStats() {
    const [memberCount, soupCount, soupRecordCount, adminCount] = await Promise.all([
      prisma.memberships.count(),
      prisma.soup.count(),
      prisma.soupRecord.count(),
      prisma.admin.count(),
    ]);

    // 今日新增会员
    const todayStart = getSystemTodayStart();
    const todayNewMembers = await prisma.memberships.count({
      where: { issueDate: { gte: todayStart } }
    });

    // 今日喝汤次数
    const todaySoupRecords = await prisma.soupRecord.count({
      where: { drinkTime: { gte: todayStart } }
    });

    return {
      memberCount,
      todayNewMembers,
      soupCount,
      todaySoupRecords,
      soupRecordCount,
      adminCount,
    };
  }
}