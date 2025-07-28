import { PrismaClient } from '@prisma/client';
import { CreateSoupRecordRequest, UpdateSoupRecordRequest, SoupRecordResponse, SoupRecordWithDetailsResponse } from '@/types/soupRecord';
import { getBeijingNow, toBeijingTime, toBeijingISOString, isValidTime } from '@/lib/timeUtils';

// 创建Prisma客户端
const prisma = new PrismaClient();

// 喝汤记录服务
export class SoupRecordService {
  // 获取所有喝汤记录（分页）
  static async getAllSoupRecords(page: number = 1, pageSize: number = 10): Promise<{ data: SoupRecordResponse[]; total: number; page: number; pageSize: number }> {
    const skip = (page - 1) * pageSize;
    const [records, total] = await Promise.all([
      prisma.soupRecord.findMany({
        include: {
          membership: {
            select: {
              id: true,
              name: true,
              phone: true,
              cardNumber: true,
              cardType: true,
            }
          },
          soup: {
            select: {
              id: true,
              name: true,
              type: true,
            }
          }
        },
        orderBy: { drinkTime: 'desc' },
        skip,
        take: pageSize,
      }),
      prisma.soupRecord.count()
    ]);
    return {
      data: records.map(record => ({
        id: record.id,
        drinkTime: toBeijingISOString(record.drinkTime),
        membershipId: record.membershipId,
        soupId: record.soupId,
        membership: record.membership,
        soup: record.soup
      })),
      total,
      page,
      pageSize
    };
  }

  // 根据ID获取喝汤记录
  static async getSoupRecordById(id: number): Promise<SoupRecordWithDetailsResponse | null> {
    const record = await prisma.soupRecord.findUnique({
      where: { id },
      include: {
        membership: {
          select: {
            id: true,
            name: true,
            phone: true,
            cardNumber: true,
            cardType: true,
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
    if (!record) return null;
    return {
      id: record.id,
      drinkTime: toBeijingISOString(record.drinkTime),
      membership: record.membership,
      soup: record.soup
    };
  }

  // 搜索喝汤记录
  static async searchSoupRecords(query: string, limit: number = 10): Promise<SoupRecordResponse[]> {
    const records = await prisma.soupRecord.findMany({
      where: {
        OR: [
          {
            membership: {
              OR: [
                { name: { contains: query } },
                { phone: { contains: query } },
                { cardNumber: { contains: query } }
              ]
            }
          },
          {
            soup: {
              OR: [
                { name: { contains: query } },
                { type: { contains: query } }
              ]
            }
          }
        ]
      },
      include: {
        membership: {
          select: {
            id: true,
            name: true,
            phone: true,
            cardNumber: true,
            cardType: true,
          }
        },
        soup: {
          select: {
            id: true,
            name: true,
            type: true,
          }
        }
      },
      take: limit,
      orderBy: {
        drinkTime: 'desc'
      }
    });
    return records.map(record => ({
      id: record.id,
      drinkTime: toBeijingISOString(record.drinkTime),
      membershipId: record.membershipId,
      soupId: record.soupId,
      membership: record.membership,
      soup: record.soup
    }));
  }

  // 根据会员ID获取喝汤记录（分页）
  static async getSoupRecordsByMembershipId(membershipId: number, page: number = 1, pageSize: number = 10): Promise<{ data: SoupRecordResponse[]; total: number; page: number; pageSize: number }> {
    const skip = (page - 1) * pageSize;
    const [records, total] = await Promise.all([
      prisma.soupRecord.findMany({
        where: { membershipId },
        include: {
          membership: {
            select: {
              id: true,
              name: true,
              phone: true,
              cardNumber: true,
              cardType: true,
            }
          },
          soup: {
            select: {
              id: true,
              name: true,
              type: true,
            }
          }
        },
        orderBy: { drinkTime: 'desc' },
        skip,
        take: pageSize,
      }),
      prisma.soupRecord.count({ where: { membershipId } })
    ]);
    return {
      data: records.map(record => ({
        id: record.id,
        drinkTime: toBeijingISOString(record.drinkTime),
        membershipId: record.membershipId,
        soupId: record.soupId,
        membership: record.membership,
        soup: record.soup
      })),
      total,
      page,
      pageSize
    };
  }

  // 创建喝汤记录
  static async createSoupRecord(data: CreateSoupRecordRequest): Promise<SoupRecordWithDetailsResponse> {
    this.validateCreateData(data);
    const membership = await prisma.memberships.findUnique({ where: { id: data.membershipId } });
    if (!membership) throw new Error('会员不存在');
    const soup = await prisma.soup.findUnique({ where: { id: data.soupId } });
    if (!soup) throw new Error('汤品不存在');
    if (membership.remainingSoups <= 0) throw new Error('会员剩余汤品数量不足');
    
    const result = await prisma.$transaction(async (tx) => {
      const record = await tx.soupRecord.create({
        data: {
          membershipId: data.membershipId,
          soupId: data.soupId,
          drinkTime: data.drinkTime ? toBeijingTime(data.drinkTime) : getBeijingNow(),
        },
        include: {
          membership: {
            select: {
              id: true,
              name: true,
              phone: true,
              cardNumber: true,
              cardType: true,
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
      await tx.memberships.update({
        where: { id: data.membershipId },
        data: {
          remainingSoups: {
            decrement: 1
          }
        }
      });
      return record;
    });
    return {
      id: result.id,
      drinkTime: toBeijingISOString(result.drinkTime),
      membership: result.membership,
      soup: result.soup
    };
  }

  // 更新喝汤记录
  static async updateSoupRecord(id: number, data: UpdateSoupRecordRequest): Promise<SoupRecordResponse> {
    const existingRecord = await this.getSoupRecordById(id);
    if (!existingRecord) throw new Error('喝汤记录不存在');
    this.validateUpdateData(data);
    if (data.soupId) {
      const soup = await prisma.soup.findUnique({ where: { id: data.soupId } });
      if (!soup) throw new Error('汤品不存在');
    }
    const updateData: any = {};
    if (data.soupId !== undefined) updateData.soupId = data.soupId;
    if (data.drinkTime !== undefined) updateData.drinkTime = toBeijingTime(data.drinkTime);
    if (Object.keys(updateData).length === 0) throw new Error('没有提供要更新的字段');
    
    const record = await prisma.soupRecord.update({
      where: { id },
      data: updateData,
      include: {
        membership: {
          select: {
            id: true,
            name: true,
            phone: true,
            cardNumber: true,
            cardType: true,
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
    return {
      id: record.id,
      drinkTime: toBeijingISOString(record.drinkTime),
      membershipId: record.membershipId,
      soupId: record.soupId,
      membership: record.membership,
      soup: record.soup
    };
  }

  // 删除喝汤记录
  static async deleteSoupRecord(id: number): Promise<void> {
    const existingRecord = await this.getSoupRecordById(id);
    if (!existingRecord) throw new Error('喝汤记录不存在');
    await prisma.soupRecord.delete({ where: { id } });
  }

  // 验证创建数据
  private static validateCreateData(data: CreateSoupRecordRequest): void {
    if (!data.membershipId || !data.soupId) throw new Error('会员ID和汤品ID都是必填项');
    if (data.membershipId <= 0 || data.soupId <= 0) throw new Error('会员ID和汤品ID必须是正整数');
    if (data.drinkTime && !isValidTime(data.drinkTime)) {
      throw new Error('喝汤时间格式不正确');
    }
  }

  // 验证更新数据
  private static validateUpdateData(data: UpdateSoupRecordRequest): void {
    if (data.soupId !== undefined && data.soupId <= 0) throw new Error('汤品ID必须是正整数');
    if (data.drinkTime && !isValidTime(data.drinkTime)) {
      throw new Error('喝汤时间格式不正确');
    }
  }
} 