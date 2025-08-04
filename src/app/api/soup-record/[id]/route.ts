import { NextRequest } from 'next/server';
import { SoupRecordService } from '@/server/services/soupRecordService';
import { authMiddleware, validateId } from '@/lib/middleware';
import { ApiResponseBuilder } from '@/lib/response';
import { UpdateSoupRecordRequest } from '@/types/soupRecord';

// 获取喝汤记录详情
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // 1. 认证中间件
    const authResult = await authMiddleware(request);
    if (authResult) return authResult;

    // 2. 验证ID
    const { id: idParam } = await params;
    const id = validateId(idParam);
    if (!id) {
      return ApiResponseBuilder.badRequest('无效的喝汤记录ID');
    }

    // 3. 获取喝汤记录详情
    const record = await SoupRecordService.getSoupRecordById(id);
    if (!record) {
      return ApiResponseBuilder.notFound('喝汤记录不存在');
    }

    // 4. 返回成功响应
    return ApiResponseBuilder.success(record, '获取喝汤记录详情成功');

  } catch (error) {
    console.error('获取喝汤记录详情失败:', error);
    return ApiResponseBuilder.serverError('获取喝汤记录详情失败');
  }
}

// 更新喝汤记录
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // 1. 认证中间件
    const authResult = await authMiddleware(request);
    if (authResult) return authResult;

    // 2. 验证ID
    const { id: idParam } = await params;
    const id = validateId(idParam);
    if (!id) {
      return ApiResponseBuilder.badRequest('无效的喝汤记录ID');
    }

    // 3. 解析请求体
    const body = await request.json();
    const updateData: UpdateSoupRecordRequest = {
      soupId: body.soupId,
      drinkTime: body.drinkTime
    };

    // 4. 更新喝汤记录
    const record = await SoupRecordService.updateSoupRecord(id, updateData);

    // 5. 返回成功响应
    return ApiResponseBuilder.success(record, '喝汤记录更新成功');

  } catch (error) {
    console.error('更新喝汤记录失败:', error);

    if (error instanceof Error) {
      if (error.message === '喝汤记录不存在') {
        return ApiResponseBuilder.notFound(error.message);
      }
      return ApiResponseBuilder.badRequest(error.message);
    }

    return ApiResponseBuilder.serverError('更新喝汤记录失败');
  }
}

// 删除喝汤记录
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // 1. 认证中间件
    const authResult = await authMiddleware(request);
    if (authResult) return authResult;

    // 2. 验证ID
    const { id: idParam } = await params;
    const id = validateId(idParam);
    if (!id) {
      return ApiResponseBuilder.badRequest('无效的喝汤记录ID');
    }

    // 3. 删除喝汤记录
    await SoupRecordService.deleteSoupRecord(id);

    // 4. 返回成功响应
    return ApiResponseBuilder.success(null, '喝汤记录删除成功');

  } catch (error) {
    console.error('删除喝汤记录失败:', error);

    if (error instanceof Error) {
      if (error.message === '喝汤记录不存在') {
        return ApiResponseBuilder.notFound(error.message);
      }
      return ApiResponseBuilder.badRequest(error.message);
    }

    return ApiResponseBuilder.serverError('删除喝汤记录失败');
  }
} 