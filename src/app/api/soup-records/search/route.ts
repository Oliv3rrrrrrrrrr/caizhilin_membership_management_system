import { NextRequest } from 'next/server';
import { SoupRecordService } from '@/server/services/soupRecordService';
import { authMiddleware } from '@/lib/middleware';
import { ApiResponseBuilder } from '@/lib/response';

// 搜索喝汤记录
export async function GET(request: NextRequest) {
  try {
    const authResult = await authMiddleware(request);
    if (authResult) return authResult;
    const { searchParams } = new URL(request.url);
    const q = searchParams.get('q') || '';
    const page = parseInt(searchParams.get('page') || '1', 10);
    const pageSize = parseInt(searchParams.get('pageSize') || '10', 10);
    const result = await SoupRecordService.searchRecords(q, page, pageSize);
    return ApiResponseBuilder.success(result, '搜索喝汤记录成功');
  } catch (error) {
    console.error('搜索喝汤记录失败:', error);
    return ApiResponseBuilder.serverError('搜索喝汤记录失败');
  }
} 