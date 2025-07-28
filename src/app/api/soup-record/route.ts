import { NextRequest } from 'next/server';
import { SoupRecordService } from '@/server/services/soupRecordService';
import { authMiddleware } from '@/lib/middleware';
import { ApiResponseBuilder } from '@/lib/response';
import { CreateSoupRecordRequest } from '@/types/soupRecord';

// 获取所有喝汤记录
export async function GET(request: NextRequest) {
  try {
    // 1. 认证中间件
    const authResult = await authMiddleware(request);
    if (authResult) return authResult;

    // 2. 检查是否有会员ID查询参数
    const { searchParams } = new URL(request.url);
    const membershipId = searchParams.get('membershipId');

    let records;
    if (membershipId) {
      // 3. 根据会员ID获取喝汤记录
      const id = parseInt(membershipId);
      if (isNaN(id) || id <= 0) {
        return ApiResponseBuilder.badRequest('无效的会员ID');
      }
      records = await SoupRecordService.getSoupRecordsByMembershipId(id);
    } else {
      // 4. 获取所有喝汤记录
      records = await SoupRecordService.getAllSoupRecords();
    }

    // 5. 返回成功响应
    return ApiResponseBuilder.success(records, '获取喝汤记录成功');

  } catch (error) {
    console.error('获取喝汤记录失败:', error);
    return ApiResponseBuilder.serverError('获取喝汤记录失败');
  }
}

// 创建喝汤记录
export async function POST(request: NextRequest) {
  try {
    // 1. 认证中间件
    const authResult = await authMiddleware(request);
    if (authResult) return authResult;

    // 2. 解析请求体
    const body = await request.json();
    const createData: CreateSoupRecordRequest = {
      membershipId: body.membershipId,
      soupId: body.soupId,
      drinkTime: body.drinkTime
    };

    // 3. 创建喝汤记录
    const record = await SoupRecordService.createSoupRecord(createData);

    // 4. 返回成功响应
    return ApiResponseBuilder.success(record, '喝汤记录创建成功');

  } catch (error) {
    console.error('创建喝汤记录失败:', error);
    
    if (error instanceof Error) {
      return ApiResponseBuilder.badRequest(error.message);
    }
    
    return ApiResponseBuilder.serverError('创建喝汤记录失败');
  }
} 