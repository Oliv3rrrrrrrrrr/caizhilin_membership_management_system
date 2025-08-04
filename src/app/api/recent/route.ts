import { NextRequest } from 'next/server';
import { authMiddleware } from '@/lib/middleware';
import { ApiResponseBuilder } from '@/lib/response';
import { RecentActivityService } from '@/server/services/recentActivityService';

// 获取最近活动
export async function GET(request: NextRequest) {
  try {
    // 1. 认证中间件
    const authResult = await authMiddleware(request);
    if (authResult) return authResult;

    // 2. 获取查询参数
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '10');
    const type = searchParams.get('type') || 'all';
    const page = parseInt(searchParams.get('page') || '1');

    // 3. 获取最近活动
    const activities = await RecentActivityService.getRecentActivities(limit, type, page);

    // 4. 返回成功响应
    return ApiResponseBuilder.success(activities, '获取最近活动成功');
  } catch (error) {
    console.error('获取最近活动失败:', error);
    return ApiResponseBuilder.serverError('获取最近活动失败');
  }
}
