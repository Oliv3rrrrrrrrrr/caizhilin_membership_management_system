import { PrismaClient } from '@prisma/client';
import { CreateAdminRequest, UpdateAdminRequest, AdminResponse, LoginRequest, LoginResponse } from '@/types/admin';
import { validatePhone, validateName, validatePassword } from '@/lib/validation';
import { hashPassword, verifyPassword, generateToken } from '@/lib/auth';

// 创建Prisma客户端
const prisma = new PrismaClient();

// 管理员服务
export class AdminService {
  // 获取所有管理员
  static async getAllAdmins(): Promise<AdminResponse[]> {
    const admins = await prisma.admin.findMany({
      select: {
        id: true,
        name: true,
        phone: true,
      },
      orderBy: {
        id: 'desc'
      }
    });
    return admins;
  }

  // 根据ID获取管理员
  static async getAdminById(id: number): Promise<AdminResponse | null> {
    const admin = await prisma.admin.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        phone: true,
      }
    });
    return admin;
  }

  // 根据手机号获取管理员
  static async getAdminByPhone(phone: string): Promise<AdminResponse | null> {
    return prisma.admin.findUnique({ 
      where: { phone },
      select: {
        id: true,
        name: true,
        phone: true,
      }
    });
  }

  // 创建管理员
  static async createAdmin(data: CreateAdminRequest): Promise<AdminResponse> {
    this.validateCreateData(data);
    await this.checkPhoneExists(data.phone);
    const hashed = await hashPassword(data.password);
    const admin = await prisma.admin.create({
      data: {
        name: data.name,
        phone: data.phone,
        password: hashed,
      },
      select: {
        id: true,
        name: true,
        phone: true,
      }
    });
    return admin;
  }

  // 更新管理员
  static async updateAdmin(id: number, data: UpdateAdminRequest): Promise<AdminResponse> {
    const existing = await this.getAdminById(id);
    if (!existing) throw new Error('管理员不存在');
    this.validateUpdateData(data);
    if (data.phone) await this.checkPhoneExists(data.phone, id);
    const updateData: Record<string, unknown> = {};
    if (data.name !== undefined) updateData.name = data.name;
    if (data.phone !== undefined) updateData.phone = data.phone;
    if (data.password !== undefined) updateData.password = await hashPassword(data.password);
    if (Object.keys(updateData).length === 0) throw new Error('没有提供要更新的字段');
    const admin = await prisma.admin.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        name: true,
        phone: true,
      }
    });
    return admin;
  }

  // 删除管理员
  static async deleteAdmin(id: number): Promise<void> {
    const existing = await this.getAdminById(id);
    if (!existing) throw new Error('管理员不存在');
    await prisma.admin.delete({ where: { id } });
  }

  // 管理员登录
  static async login(data: LoginRequest): Promise<LoginResponse> {
    this.validateLoginData(data);
    const admin = await prisma.admin.findUnique({ where: { phone: data.phone } });
    if (!admin) throw new Error('手机号或密码错误');
    const valid = await verifyPassword(data.password, admin.password);
    if (!valid) throw new Error('手机号或密码错误');
    const token = generateToken({ 
      userId: admin.id, 
      username: admin.name, 
      role: 'admin',
      phone: admin.phone 
    });
    return {
      token,
      admin: {
        id: admin.id,
        name: admin.name,
        phone: admin.phone
      }
    };
  }

  // 验证创建数据
  private static validateCreateData(data: CreateAdminRequest): void {
    if (!data.name || !data.phone || !data.password) throw new Error('姓名、手机号和密码都是必填项');
    if (!validatePhone(data.phone)) throw new Error('手机号格式不正确');
    const pwd = validatePassword(data.password);
    if (!pwd.isValid) throw new Error(pwd.message);
    const name = validateName(data.name);
    if (!name.isValid) throw new Error(name.message);
  }

  // 验证更新数据
  private static validateUpdateData(data: UpdateAdminRequest): void {
    if (data.phone !== undefined && !validatePhone(data.phone)) throw new Error('手机号格式不正确');
    if (data.password !== undefined) {
      const pwd = validatePassword(data.password);
      if (!pwd.isValid) throw new Error(pwd.message);
    }
    if (data.name !== undefined) {
      const name = validateName(data.name);
      if (!name.isValid) throw new Error(name.message);
    }
  }

  // 验证登录数据
  private static validateLoginData(data: LoginRequest): void {
    if (!data.phone || !data.password) throw new Error('手机号和密码都是必填项');
    if (!validatePhone(data.phone)) throw new Error('手机号格式不正确');
  }

  // 检查手机号是否存在
  private static async checkPhoneExists(phone: string, excludeId?: number): Promise<void> {
    const where: Record<string, unknown> = { phone };
    if (excludeId) where.id = { not: excludeId };
    const exists = await prisma.admin.findFirst({ where });
    if (exists) throw new Error('该手机号已被注册');
  }
} 