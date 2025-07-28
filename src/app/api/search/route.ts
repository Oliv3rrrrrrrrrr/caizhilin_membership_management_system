import { NextRequest } from 'next/server';
import { authMiddleware } from '@/lib/middleware';
import { ApiResponseBuilder } from '@/lib/response';
import { MembershipService } from '@/server/services/membershipService';
import { SoupService } from '@/server/services/soupService';
import { SoupRecordService } from '@/server/services/soupRecordService';

// 搜索API
export async function GET(request: NextRequest) {
  try {
    // 1. 认证中间件
    const authResult = await authMiddleware(request);
    if (authResult) return authResult;

    // 2. 获取查询参数
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q') || '';
    const type = searchParams.get('type') || 'all'; // all, members, soups, records
    const limit = parseInt(searchParams.get('limit') || '10');

    // 3. 验证查询参数
    if (!query.trim()) {
      return ApiResponseBuilder.badRequest('搜索关键词不能为空');
    }

    let results: any = {};

    // 4. 根据类型搜索
    if (type === 'all' || type === 'members') {
      // 4.1 搜索会员
      const memberships = await MembershipService.searchMemberships(query, limit);
      results.members = memberships;
    }

    if (type === 'all' || type === 'soups') {
      // 4.2 搜索汤品
      const soups = await SoupService.searchSoups(query, limit);
      results.soups = soups;
    }

    if (type === 'all' || type === 'records') {
      // 4.3 搜索喝汤记录
      const records = await SoupRecordService.searchSoupRecords(query, limit);
      results.records = records;
    }

    // 5. 返回成功响应
    return ApiResponseBuilder.success(results, '搜索完成');

  } catch (error) {
    console.error('搜索失败:', error);
    return ApiResponseBuilder.serverError('搜索失败');
  }
} 