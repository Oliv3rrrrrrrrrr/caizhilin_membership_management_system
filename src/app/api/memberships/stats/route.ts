import { NextRequest } from 'next/server';
import { MembershipService } from '@/server/services/membershipService';
import { authMiddleware } from '@/lib/middleware';
import { ApiResponseBuilder } from '@/lib/response';

// 获取会员统计信息
export async function GET(request: NextRequest) {
  try {
    const authResult = await authMiddleware(request);
    if (authResult) return authResult;
    const stats = await MembershipService.getStats();
    return ApiResponseBuilder.success(stats, '获取会员统计信息成功');
  } catch (error) {
    console.error('获取会员统计信息失败:', error);
    return ApiResponseBuilder.serverError('获取会员统计信息失败');
  }
}