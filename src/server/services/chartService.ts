import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class ChartService {
  // 获取会员增长数据（按月统计）
  static async getMemberGrowth() {
    // 获取当前年份
    const currentYear = new Date().getFullYear();
    // 查询会员增长数据
    const memberGrowth = await prisma.$queryRaw`
      SELECT 
        MONTH(issueDate) as month,
        COUNT(*) as count
      FROM Memberships 
      WHERE YEAR(issueDate) = ${currentYear}
      GROUP BY MONTH(issueDate)
      ORDER BY month
    `;

    // 转换为前端需要的格式
    const monthNames = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'];
    const formattedData = monthNames.map((monthName, index) => {
      const monthData = (memberGrowth as Array<{ month: string; count: string }>).find(item => Number(item.month) === index + 1);
      return {
        month: monthName,
        count: monthData ? Number(monthData.count) : 0
      };
    });

    return formattedData;
  }

  // 获取每日喝汤记录（最近7天）
  static async getDailyRecords() {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    // 如果是北京时间，则Interval 8 hour
    const dailyRecords = await prisma.$queryRaw`
      SELECT 
        DATE(DATE_ADD(drinkTime, INTERVAL 10 HOUR)) as date,
        COUNT(*) as count
      FROM SoupRecord 
      WHERE DATE_ADD(drinkTime, INTERVAL 10 HOUR) >= ${sevenDaysAgo}
      GROUP BY DATE(DATE_ADD(drinkTime, INTERVAL 10 HOUR))
      ORDER BY date
    `;

    // 转换为前端需要的格式 - 显示具体日期
    const formattedData = [];
    
    // 计算最近7天的日期
    for (let i = 6; i >= 0; i--) {
      const targetDate = new Date();
      targetDate.setDate(targetDate.getDate() - i);
      
      // 格式化为 MM-DD 格式
      const month = String(targetDate.getMonth() + 1).padStart(2, '0');
      const day = String(targetDate.getDate()).padStart(2, '0');
      const dateStr = `${month}-${day}`;
      
      // 匹配数据库数据
      const dateStrForMatch = targetDate.toISOString().split('T')[0];
      const dayData = (dailyRecords as Array<{ date: Date; count: string }>).find(item => item.date.toISOString().split('T')[0] === dateStrForMatch);
      
      formattedData.push({
        date: dateStr,
        count: dayData ? Number(dayData.count) : 0
      });
    }

    return formattedData;
  }

  // 获取会员分布
  static async getMemberActivity() {
    // 活跃会员：剩余汤数量大于0的会员
    const activeMembers = await prisma.memberships.count({
      where: {
        remainingSoups: {
          gt: 0
        }
      }
    });

    // 待续费会员：剩余汤品次数为0的会员
    const renewalMembers = await prisma.memberships.count({
      where: {
        remainingSoups: 0
      }
    });

    const memberActivity = [
      { name: '活跃会员', value: activeMembers, color: '#10B981' },
      { name: '待续费会员', value: renewalMembers, color: '#F59E0B' }
    ];

    return memberActivity;
  }

  // 获取卡类型分布
  static async getCardTypeDistribution() {
    const cardTypes = ['350卡', '500卡', '1000卡'];
    
    const distribution = await Promise.all(
      cardTypes.map(async (cardType) => {
        const count = await prisma.memberships.count({
          where: {
            cardType: cardType
          }
        });
        
        return {
          name: cardType,
          count: count
        };
      })
    );

    return distribution;
  }

  // 获取汤品消费统计
  static async getSoupConsumption() {
    const soupConsumption = await prisma.$queryRaw`
      SELECT 
        s.name,
        COUNT(sr.id) as count
      FROM Soup s
      LEFT JOIN SoupRecord sr ON s.id = sr.soupId
      GROUP BY s.id, s.name
      ORDER BY count DESC
    `;

    const formattedData = (soupConsumption as Array<{ name: string; count: string }>).map(item => ({
      name: item.name,
      count: Number(item.count)
    }));

    return formattedData;
  }

  // 获取所有图表数据
  static async getAllChartData() {
    const [
      memberGrowth,
      dailyRecords,
      memberActivity,
      cardTypeDistribution,
      soupConsumption
    ] = await Promise.all([
      this.getMemberGrowth(),
      this.getDailyRecords(),
      this.getMemberActivity(),
      this.getCardTypeDistribution(),
      this.getSoupConsumption()
    ]);

    return {
      memberGrowth,
      dailyRecords,
      memberActivity,
      cardTypeDistribution,
      soupConsumption
    };
  }
} 