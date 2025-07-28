import { NextRequest } from 'next/server';
import { SoupService } from '@/server/services/soupService';
import { authMiddleware, validateId } from '@/lib/middleware';
import { ApiResponseBuilder } from '@/lib/response';
import { UpdateSoupRequest } from '@/types/soup';

// 获取汤品详情
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
      return ApiResponseBuilder.badRequest('无效的汤品ID');
    }

    // 3. 获取汤品详情
    const soup = await SoupService.getSoupById(id);
    if (!soup) {
      return ApiResponseBuilder.notFound('汤品不存在');
    }

    // 4. 返回成功响应
    return ApiResponseBuilder.success(soup, '获取汤品详情成功');

  } catch (error) {
    console.error('获取汤品详情失败:', error);
    return ApiResponseBuilder.serverError('获取汤品详情失败');
  }
}

// 更新汤品信息
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
      return ApiResponseBuilder.badRequest('无效的汤品ID');
    }

    // 3. 解析请求体
    const body = await request.json();
    const updateData: UpdateSoupRequest = {
      name: body.name,
      type: body.type
    };

    // 4. 更新汤品
    const soup = await SoupService.updateSoup(id, updateData);

    // 5. 返回成功响应
    return ApiResponseBuilder.success(soup, '汤品信息更新成功');

  } catch (error) {
    console.error('更新汤品信息失败:', error);
    
    if (error instanceof Error) {
      if (error.message === '汤品不存在') {
        return ApiResponseBuilder.notFound(error.message);
      }
      return ApiResponseBuilder.badRequest(error.message);
    }
    
    return ApiResponseBuilder.serverError('更新汤品信息失败');
  }
}

// 删除汤品
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
      return ApiResponseBuilder.badRequest('无效的汤品ID');
    }

    // 3. 删除汤品
    await SoupService.deleteSoup(id);

    // 4. 返回成功响应
    return ApiResponseBuilder.success(null, '汤品删除成功');

  } catch (error) {
    console.error('删除汤品失败:', error);
    
    if (error instanceof Error) {
      if (error.message === '汤品不存在') {
        return ApiResponseBuilder.notFound(error.message);
      }
      if (error.message.includes('有关联的喝汤记录')) {
        return ApiResponseBuilder.badRequest(error.message);
      }
      return ApiResponseBuilder.badRequest(error.message);
    }
    
    return ApiResponseBuilder.serverError('删除汤品失败');
  }
} 