import { NextRequest } from 'next/server';
import { AdminService } from '@/server/services/adminService';
import { ApiResponseBuilder } from '@/lib/response';
import { LoginRequest } from '@/types/admin';

// 管理员登录
export async function POST(request: NextRequest) {
  try {
    // 1. 解析请求体
    const body = await request.json();
    const loginData: LoginRequest = {
      phone: body.phone,
      password: body.password
    };

    // 2. 管理员登录
    const result = await AdminService.login(loginData);

    // 3. 返回成功响应
    return ApiResponseBuilder.success(result, '登录成功');

  } catch (error) {
    console.error('登录失败:', error);
    
    if (error instanceof Error) {
      return ApiResponseBuilder.badRequest(error.message);
    }
    
    return ApiResponseBuilder.serverError('登录失败');
  }
}