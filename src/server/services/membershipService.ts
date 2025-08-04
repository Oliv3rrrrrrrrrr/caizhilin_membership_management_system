import { PrismaClient } from '@prisma/client';
import { CreateMembershipRequest, UpdateMembershipRequest, MembershipResponse } from '@/types/membership';
import { validatePhone, validateName } from '@/lib/validation';

// 创建Prisma客户端
const prisma = new PrismaClient();

// 会员服务
export class MembershipService {
  // 获取所有会员（分页）
  static async getAllMemberships(page: number = 1, pageSize: number = 10): Promise<{ data: MembershipResponse[]; total: number; page: number; pageSize: number }> {
    const skip = (page - 1) * pageSize;
    const [memberships, total] = await Promise.all([
      prisma.memberships.findMany({
        select: {
          id: true,
          name: true,
          phone: true,
          cardNumber: true,
          cardType: true,
          issueDate: true,
          remainingSoups: true,
        },
        orderBy: { id: 'desc' },
        skip,
        take: pageSize,
      }),
      prisma.memberships.count()
    ]);
    return { data: memberships, total, page, pageSize };
  }

  // 根据ID获取会员
  static async getMembershipById(id: number): Promise<MembershipResponse | null> {
    const m = await prisma.memberships.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        phone: true,
        cardNumber: true,
        cardType: true,
        issueDate: true,
        remainingSoups: true,
      }
    });
    if (!m) return null;
    return m;
  }

  // 搜索会员（分页）
  static async searchMemberships(query: string, page: number = 1, pageSize: number = 10): Promise<{ members: MembershipResponse[]; total: number; page: number; pageSize: number }> {
    const skip = (page - 1) * pageSize;
    const [memberships, total] = await Promise.all([
      prisma.memberships.findMany({
        where: {
          OR: [
            { name: { contains: query } },
            { phone: { contains: query } },
            { cardNumber: { contains: query } },
            { cardType: { contains: query } }
          ]
        },
        select: {
          id: true,
          name: true,
          phone: true,
          cardNumber: true,
          cardType: true,
          issueDate: true,
          remainingSoups: true,
        },
        orderBy: { id: 'desc' },
        skip,
        take: pageSize,
      }),
      prisma.memberships.count({
        where: {
          OR: [
            { name: { contains: query } },
            { phone: { contains: query } },
            { cardNumber: { contains: query } },
            { cardType: { contains: query } }
          ]
        }
      })
    ]);
    return { members: memberships, total, page, pageSize };
  }

  // 创建会员
  static async createMembership(data: CreateMembershipRequest): Promise<MembershipResponse> {
    this.validateCreateData(data);
    await this.checkPhoneExists(data.phone);
    const cardNumber = await this.generateCardNumber();

    const membership = await prisma.memberships.create({
      data: {
        name: data.name,
        phone: data.phone,
        cardNumber,
        cardType: data.cardType,
        issueDate: new Date(),
        remainingSoups: data.remainingSoups,
      },
      select: {
        id: true,
        name: true,
        phone: true,
        cardNumber: true,
        cardType: true,
        issueDate: true,
        remainingSoups: true,
      }
    });
    return membership;
  }

  // 更新会员
  static async updateMembership(id: number, data: UpdateMembershipRequest): Promise<MembershipResponse> {
    const existing = await this.getMembershipById(id);
    if (!existing) throw new Error('会员不存在');
    this.validateUpdateData(data);
    if (data.phone) await this.checkPhoneExists(data.phone, id);
    const updateData: any = {};
    if (data.name !== undefined) updateData.name = data.name;
    if (data.cardType !== undefined) updateData.cardType = data.cardType;
    if (data.remainingSoups !== undefined) updateData.remainingSoups = data.remainingSoups;
    if (Object.keys(updateData).length === 0) throw new Error('没有提供要更新的字段');
    const membership = await prisma.memberships.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        name: true,
        phone: true,
        cardNumber: true,
        cardType: true,
        issueDate: true,
        remainingSoups: true,
      }
    });
    return membership;
  }

  // 删除会员
  static async deleteMembership(id: number): Promise<void> {
    const existing = await this.getMembershipById(id);
    if (!existing) throw new Error('会员不存在');
    await prisma.memberships.delete({ where: { id } });
  }

  // 会员统计
  static async getStats(): Promise<{ total: number; active: number; inactive: number; cardTypeCount: number }> {
    const [total, active, inactive, cardTypes] = await Promise.all([
      prisma.memberships.count(),
      prisma.memberships.count({ where: { remainingSoups: { gt: 0 } } }),
      prisma.memberships.count({ where: { remainingSoups: 0 } }),
      prisma.memberships.findMany({ select: { cardType: true }, distinct: ['cardType'] })
    ]);
    return {
      total,
      active,
      inactive,
      cardTypeCount: cardTypes.length
    };
  }

  // 验证创建数据
  private static validateCreateData(data: CreateMembershipRequest): void {
    if (!data.name || !data.phone || !data.cardType) throw new Error('姓名、手机号和卡类型都是必填项');
    if (!validatePhone(data.phone)) throw new Error('手机号格式不正确');
    if (data.remainingSoups === undefined || data.remainingSoups < 0) throw new Error('剩余汤品数量必须为非负整数');
    const name = validateName(data.name);
    if (!name.isValid) throw new Error(name.message);
  }

  // 验证更新数据
  private static validateUpdateData(data: UpdateMembershipRequest): void {
    if (data.name !== undefined) {
      const name = validateName(data.name);
      if (!name.isValid) throw new Error(name.message);
    }
    if (data.phone !== undefined && !validatePhone(data.phone)) throw new Error('手机号格式不正确');
    if (data.remainingSoups !== undefined && data.remainingSoups < 0) throw new Error('剩余汤品数量必须为非负整数');
  }

  // 检查手机号是否存在
  private static async checkPhoneExists(phone: string, excludeId?: number): Promise<void> {
    const where: any = { phone };
    if (excludeId) where.id = { not: excludeId };
    const existing = await prisma.memberships.findFirst({ where });
    if (existing) throw new Error('手机号已存在');
  }

  // 生成卡号
  private static async generateCardNumber(): Promise<string> {
    const lastMembership = await prisma.memberships.findFirst({
      orderBy: { id: 'desc' }
    });
    const nextNumber = lastMembership ? parseInt(lastMembership.cardNumber.replace('VIP', '')) + 1 : 1;
    return `VIP${nextNumber}`;
  }
} 