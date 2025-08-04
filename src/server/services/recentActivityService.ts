import { PrismaClient } from '@prisma/client';
import type { RecentActivity } from '@/types/recent';

const prisma = new PrismaClient();

export class RecentActivityService {
  // 获取最近活动
  static async getRecentActivities(limit: number = 10, type: string = 'all', page: number = 1): Promise<RecentActivity[]> {
    const activities: RecentActivity[] = [];

    // 1. 获取最近的新增会员
    if (type === 'all' || type === 'membership') {
      const recentMembers = await prisma.memberships.findMany({
        orderBy: { issueDate: 'desc' },
        take: Math.ceil(limit / 2),
        skip: (page - 1) * Math.ceil(limit / 2),
        select: {
          id: true,
          name: true,
          cardNumber: true,
          cardType: true,
          issueDate: true,
        }
      });

      recentMembers.forEach(member => {
        activities.push({
          id: member.id,
          type: 'membership',
          title: '新增会员',
          description: `新增会员：${member.name}`,
          timestamp: member.issueDate.toISOString(),
          relatedId: member.id,
          relatedType: 'membership',
          metadata: {
            memberName: member.name,
            cardNumber: member.cardNumber,
          }
        });
      });
    }

    // 2. 获取最近的喝汤记录
    if (type === 'all' || type === 'soup_record') {
      const recentRecords = await prisma.soupRecord.findMany({
        orderBy: { drinkTime: 'desc' },
        take: Math.ceil(limit / 2),
        skip: (page - 1) * Math.ceil(limit / 2),
        include: {
          membership: {
            select: {
              id: true,
              name: true,
              remainingSoups: true,
            }
          },
          soup: {
            select: {
              id: true,
              name: true,
              type: true,
            }
          }
        }
      });

      recentRecords.forEach(record => {
        activities.push({
          id: record.id,
          type: 'soup_record',
          title: '喝汤记录',
          description: `${record.membership.name} 喝了 ${record.soup.name}`,
          timestamp: record.drinkTime.toISOString(),
          relatedId: record.id,
          relatedType: 'soup_record',
          metadata: {
            memberName: record.membership.name,
            soupName: record.soup.name,
            remainingSoups: record.membership.remainingSoups,
          }
        });
      });
    }

    // 3. 按时间排序
    return activities
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }
} 