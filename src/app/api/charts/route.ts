import { NextRequest } from 'next/server';
import { ChartService } from '@/server/services/chartService';
import { authMiddleware } from '@/lib/middleware';
import { ApiResponseBuilder } from '@/lib/response';

export async function GET(request: NextRequest) {
  try {
    // 1. 认证中间件
    const authResult = await authMiddleware(request);
    if (authResult) return authResult;

    // 2. 获取查询参数
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');

    switch (type) {
      case 'memberGrowth':
        const memberGrowth = await ChartService.getMemberGrowth();
        return ApiResponseBuilder.success(memberGrowth);
      case 'dailyRecords':
        const dailyRecords = await ChartService.getDailyRecords();
        return ApiResponseBuilder.success(dailyRecords);
      case 'memberActivity':
        const memberActivity = await ChartService.getMemberActivity();
        return ApiResponseBuilder.success(memberActivity);
      case 'cardTypeDistribution':
        const cardTypeDistribution = await ChartService.getCardTypeDistribution();
        return ApiResponseBuilder.success(cardTypeDistribution);
      case 'soupConsumption':
        const soupConsumption = await ChartService.getSoupConsumption();
        return ApiResponseBuilder.success(soupConsumption);
      default:
        const allData = await ChartService.getAllChartData();
        return ApiResponseBuilder.success(allData);
    }
  } catch (err: any) {
    console.error('图表数据获取失败:', err);
    return ApiResponseBuilder.serverError('获取图表数据失败');
  }
} 