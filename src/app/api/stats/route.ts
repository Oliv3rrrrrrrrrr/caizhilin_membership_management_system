import { NextRequest } from 'next/server';
import { authMiddleware } from '@/lib/middleware';
import { ApiResponseBuilder } from '@/lib/response';
import { StatsService } from '@/server/services/statsService';

// 获取统计数据
export async function GET(request: NextRequest) {
  try {
    // 1. 认证中间件
    const authResult = await authMiddleware(request);
    if (authResult) return authResult;

    // 2. 获取统计数据
    const stats = await StatsService.getDashboardStats();

    // 3. 返回成功响应
    return ApiResponseBuilder.success(stats, '统计数据获取成功');
  } catch {
    return ApiResponseBuilder.serverError('统计数据获取失败');
  }
}