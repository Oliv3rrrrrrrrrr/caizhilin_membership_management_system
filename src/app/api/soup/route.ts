import { NextRequest } from 'next/server';
import { SoupService } from '@/server/services/soupService';
import { authMiddleware } from '@/lib/middleware';
import { ApiResponseBuilder } from '@/lib/response';
import { CreateSoupRequest } from '@/types/soup';

// 获取所有汤品
export async function GET(request: NextRequest) {
  try {
    // 1. 认证中间件
    const authResult = await authMiddleware(request);
    if (authResult) return authResult;

    // 2. 获取所有汤品
    const soups = await SoupService.getAllSoups();

    // 3. 返回成功响应
    return ApiResponseBuilder.success(soups, '获取汤品列表成功');

  } catch (error) {
    console.error('获取汤品列表失败:', error);
    return ApiResponseBuilder.serverError('获取汤品列表失败');
  }
}

// 创建汤品
export async function POST(request: NextRequest) {
  try {
    // 1. 认证中间件
    const authResult = await authMiddleware(request);
    if (authResult) return authResult;

    // 2. 解析请求体
    const body = await request.json();
    const createData: CreateSoupRequest = {
      name: body.name,
      type: body.type
    };

    // 3. 创建汤品
    const soup = await SoupService.createSoup(createData);

    // 4. 返回成功响应
    return ApiResponseBuilder.success(soup, '汤品创建成功');

  } catch (error) {
    console.error('创建汤品失败:', error);

    if (error instanceof Error) {
      return ApiResponseBuilder.badRequest(error.message);
    }

    return ApiResponseBuilder.serverError('创建汤品失败');
  }
} 