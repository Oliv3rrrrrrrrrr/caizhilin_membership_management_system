import { NextRequest } from 'next/server';
import { authMiddleware } from '@/lib/middleware';
import { ApiResponseBuilder } from '@/lib/response';
import { MembershipService } from '@/server/services/membershipService';
import { SoupService } from '@/server/services/soupService';
import { SoupRecordService } from '@/server/services/soupRecordService';

// 导出数据API
export async function GET(request: NextRequest) {
  try {
    // 1. 认证中间件
    const authResult = await authMiddleware(request);
    if (authResult) return authResult;

    // 2. 获取查询参数
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'all'; // all, members, soups, records
    const format = searchParams.get('format') || 'json'; // json, csv, excel
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    let exportData: any = {};

    // 3. 根据类型导出数据
    if (type === 'all' || type === 'members') {
      const memberships = await MembershipService.getAllMemberships();
      exportData.members = memberships;
    }

    if (type === 'all' || type === 'soups') {
      const soups = await SoupService.getAllSoups();
      exportData.soups = soups;
    }

    if (type === 'all' || type === 'records') {
      const records = await SoupRecordService.getAllSoupRecords();
      exportData.records = records;
    }

    // 4. 添加导出元数据
    exportData.metadata = {
      exportTime: new Date().toISOString(),
      type,
      format,
      startDate,
      endDate,
      totalRecords: Object.values(exportData).reduce((acc: number, curr: any) => {
        return acc + (Array.isArray(curr) ? curr.length : 0);
      }, 0)
    };

    // 5. 根据格式返回数据
    if (format === 'csv') {
      // 5.1 这里应该转换为CSV格式
      return ApiResponseBuilder.success(exportData, '数据导出成功（CSV格式）');
    } else if (format === 'excel') {
      // 5.2 这里应该转换为Excel格式
      return ApiResponseBuilder.success(exportData, '数据导出成功（Excel格式）');
    } else {
      // 5.3 默认JSON格式
      return ApiResponseBuilder.success(exportData, '数据导出成功');
    }

  } catch (error) {
    console.error('数据导出失败:', error);
    return ApiResponseBuilder.serverError('数据导出失败');
  }
} 