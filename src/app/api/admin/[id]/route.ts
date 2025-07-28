import { NextRequest } from 'next/server';
import { AdminService } from '@/server/services/adminService';
import { authMiddleware, validateId } from '@/lib/middleware';
import { ApiResponseBuilder } from '@/lib/response';
import { UpdateAdminRequest } from '@/types/admin';

// 获取管理员详情
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // 1. 认证中间件
    const authResult = await authMiddleware(request);
    if (authResult) return authResult;

    // 2. 验证ID
    const id = validateId(params.id);
    if (!id) {
      return ApiResponseBuilder.badRequest('无效的管理员ID');
    }

    // 3. 获取管理员详情
    const admin = await AdminService.getAdminById(id);
    if (!admin) {
      return ApiResponseBuilder.notFound('管理员不存在');
    }

    // 4. 返回成功响应
    return ApiResponseBuilder.success(admin, '获取管理员详情成功');

  } catch (error) {
    console.error('获取管理员详情失败:', error);
    return ApiResponseBuilder.serverError('获取管理员详情失败');
  }
}

// 更新管理员信息
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // 1. 认证中间件
    const authResult = await authMiddleware(request);
    if (authResult) return authResult;

    // 2. 验证ID
    const id = validateId(params.id);
    if (!id) {
      return ApiResponseBuilder.badRequest('无效的管理员ID');
    }

    // 3. 解析请求体
    const body = await request.json();
    const updateData: UpdateAdminRequest = {
      name: body.name,
      phone: body.phone,
      password: body.password
    };

    // 4. 更新管理员
    const admin = await AdminService.updateAdmin(id, updateData);

    // 5. 返回成功响应
    return ApiResponseBuilder.success(admin, '管理员信息更新成功');

  } catch (error) {
    console.error('更新管理员信息失败:', error);
    
    if (error instanceof Error) {
      if (error.message === '管理员不存在') {
        return ApiResponseBuilder.notFound(error.message);
      }
      return ApiResponseBuilder.badRequest(error.message);
    }
    
    return ApiResponseBuilder.serverError('更新管理员信息失败');
  }
}

// 删除管理员
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // 1. 认证中间件
    const authResult = await authMiddleware(request);
    if (authResult) return authResult;

    // 2. 验证ID
    const id = validateId(params.id);
    if (!id) {
      return ApiResponseBuilder.badRequest('无效的管理员ID');
    }

    // 3. 删除管理员
    await AdminService.deleteAdmin(id);

    // 4. 返回成功响应
    return ApiResponseBuilder.success(null, '管理员删除成功');

  } catch (error) {
    console.error('删除管理员失败:', error);
    
    if (error instanceof Error) {
      if (error.message === '管理员不存在') {
        return ApiResponseBuilder.notFound(error.message);
      }
      return ApiResponseBuilder.badRequest(error.message);
    }
    
    return ApiResponseBuilder.serverError('删除管理员失败');
  }
} 