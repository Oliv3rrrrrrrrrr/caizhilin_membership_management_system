import { NextRequest } from 'next/server';
import { AdminService } from '@/server/services/adminService';
import { authMiddleware } from '@/lib/middleware';
import { ApiResponseBuilder } from '@/lib/response';
import { CreateAdminRequest } from '@/types/admin';

// 获取所有管理员
export async function GET(request: NextRequest) {
  try {
    // 1. 认证中间件
    const authResult = await authMiddleware(request);
    if (authResult) return authResult;

    // 2. 获取所有管理员
    const admins = await AdminService.getAllAdmins();

    // 3. 返回成功响应
    return ApiResponseBuilder.success(admins, '获取管理员列表成功');

  } catch (error) {
    console.error('获取管理员列表失败:', error);
    return ApiResponseBuilder.serverError('获取管理员列表失败');
  }
}

// 创建管理员
export async function POST(request: NextRequest) {
  try {
    // 1. 解析请求体
    const body = await request.json();
    const createData: CreateAdminRequest = {
      name: body.name,
      phone: body.phone,
      password: body.password
    };

    // 2. 创建管理员
    const admin = await AdminService.createAdmin(createData);

    // 3. 返回成功响应
    return ApiResponseBuilder.success(admin, '管理员创建成功');

  } catch (error) {
    console.error('创建管理员失败:', error);
    
    if (error instanceof Error) {
      return ApiResponseBuilder.badRequest(error.message);
    }
    
    return ApiResponseBuilder.serverError('创建管理员失败');
  }
}