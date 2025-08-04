import { NextRequest } from 'next/server';
import { SoupRecordService } from '@/server/services/soupRecordService';
import { authMiddleware } from '@/lib/middleware';
import { ApiResponseBuilder } from '@/lib/response';

// 获取喝汤记录统计信息
export async function GET(request: NextRequest) {
  try {
    const authResult = await authMiddleware(request);
    if (authResult) return authResult;
    const stats = await SoupRecordService.getStats();
    return ApiResponseBuilder.success(stats, '获取喝汤记录统计信息成功');
  } catch (error) {
    console.error('获取喝汤记录统计信息失败:', error);
    return ApiResponseBuilder.serverError('获取喝汤记录统计信息失败');
  }
} 