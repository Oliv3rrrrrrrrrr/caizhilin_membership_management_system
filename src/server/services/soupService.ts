import { PrismaClient } from '@prisma/client';
import { CreateSoupRequest, UpdateSoupRequest, SoupResponse } from '@/types/soup';

// 创建Prisma客户端
const prisma = new PrismaClient();

// 汤品服务
export class SoupService {
  // 获取所有汤品
  static async getAllSoups(): Promise<SoupResponse[]> {
    const soups = await prisma.soup.findMany({
      select: {
        id: true,
        name: true,
        type: true,
      },
      orderBy: {
        id: 'desc'
      }
    });
    return soups;
  }

  // 根据ID获取汤品
  static async getSoupById(id: number): Promise<SoupResponse | null> {
    const soup = await prisma.soup.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        type: true,
      }
    });
    if (!soup) return null;
    return soup;
  }

  // 搜索汤品
  static async searchSoups(query: string, limit: number = 10): Promise<SoupResponse[]> {
    const soups = await prisma.soup.findMany({
      where: {
        OR: [
          { name: { contains: query } },
          { type: { contains: query } }
        ]
      },
      select: {
        id: true,
        name: true,
        type: true,
      },
      take: limit,
      orderBy: {
        id: 'desc'
      }
    });
    return soups;
  }

  // 创建汤品
  static async createSoup(data: CreateSoupRequest): Promise<SoupResponse> {
    this.validateCreateData(data);
    const soup = await prisma.soup.create({
      data: {
        name: data.name,
        type: data.type,
      },
      select: {
        id: true,
        name: true,
        type: true,
      }
    });
    return soup;
  }

  // 更新汤品
  static async updateSoup(id: number, data: UpdateSoupRequest): Promise<SoupResponse> {
    const existing = await this.getSoupById(id);
    if (!existing) throw new Error('汤品不存在');
    this.validateUpdateData(data);
    const updateData: any = {};
    if (data.name !== undefined) updateData.name = data.name;
    if (data.type !== undefined) updateData.type = data.type;
    if (Object.keys(updateData).length === 0) throw new Error('没有提供要更新的字段');
    const soup = await prisma.soup.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        name: true,
        type: true,
      }
    });
    return soup;
  }

  // 删除汤品
  static async deleteSoup(id: number): Promise<void> {
    const existing = await this.getSoupById(id);
    if (!existing) throw new Error('汤品不存在');
    
    // 检查是否有关联的喝汤记录
    const relatedRecords = await prisma.soupRecord.findFirst({
      where: { soupId: id }
    });
    if (relatedRecords) {
      throw new Error('该汤品有关联的喝汤记录，无法删除');
    }
    
    await prisma.soup.delete({ where: { id } });
  }

  // 验证创建数据
  private static validateCreateData(data: CreateSoupRequest): void {
    if (!data.name || !data.type) throw new Error('汤品名称和类型都是必填项');
    if (data.name.length < 1 || data.name.length > 50) throw new Error('汤品名称长度必须在1-50个字符之间');
    if (data.type.length < 1 || data.type.length > 20) throw new Error('汤品类型长度必须在1-20个字符之间');
  }

  // 验证更新数据
  private static validateUpdateData(data: UpdateSoupRequest): void {
    if (data.name !== undefined && (data.name.length < 1 || data.name.length > 50)) {
      throw new Error('汤品名称长度必须在1-50个字符之间');
    }
    if (data.type !== undefined && (data.type.length < 1 || data.type.length > 20)) {
      throw new Error('汤品类型长度必须在1-20个字符之间');
    }
  }
} 