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
    return soup;
  }

  // 创建汤品
  static async createSoup(data: CreateSoupRequest): Promise<SoupResponse> {
    this.validateCreateData(data);
    await this.checkNameExists(data.name);
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
    const existingSoup = await this.getSoupById(id);
    if (!existingSoup) throw new Error('汤品不存在');
    this.validateUpdateData(data);
    if (data.name) await this.checkNameExists(data.name, id);
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
    const existingSoup = await this.getSoupById(id);
    if (!existingSoup) throw new Error('汤品不存在');
    const soupRecords = await prisma.soupRecord.findMany({ where: { soupId: id } });
    if (soupRecords.length > 0) throw new Error('该汤品有关联的喝汤记录，无法删除');
    await prisma.soup.delete({ where: { id } });
  }

  // 验证创建数据
  private static validateCreateData(data: CreateSoupRequest): void {
    if (!data.name || !data.type) throw new Error('汤品名称和类型都是必填项');
    if (data.name.length < 1 || data.name.length > 50) throw new Error('汤品名称长度应在1-50位之间');
    if (data.type.length < 1 || data.type.length > 20) throw new Error('汤品类型长度应在1-20位之间');
  }

  // 验证更新数据
  private static validateUpdateData(data: UpdateSoupRequest): void {
    if (data.name !== undefined) {
      if (data.name.length < 1 || data.name.length > 50) throw new Error('汤品名称长度应在1-50位之间');
    }
    if (data.type !== undefined) {
      if (data.type.length < 1 || data.type.length > 20) throw new Error('汤品类型长度应在1-20位之间');
    }
  }

  // 检查名称是否存在
  private static async checkNameExists(name: string, excludeId?: number): Promise<void> {
    const whereClause: any = { name };
    if (excludeId) whereClause.id = { not: excludeId };
    const existingSoup = await prisma.soup.findFirst({ where: whereClause });
    if (existingSoup) throw new Error('该汤品名称已存在');
  }
} 