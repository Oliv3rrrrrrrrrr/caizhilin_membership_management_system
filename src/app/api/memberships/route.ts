import { NextRequest } from 'next/server';
import { MembershipService } from '@/server/services/membershipService';
import { authMiddleware } from '@/lib/middleware';
import { ApiResponseBuilder } from '@/lib/response';
import { CreateMembershipRequest } from '@/types/membership';

// 获取所有会员（分页）
export async function GET(request: NextRequest) {
  try {
    // 1. 认证中间件
    const authResult = await authMiddleware(request);
    if (authResult) return authResult;

    // 2. 获取分页参数
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1', 10);
    const pageSize = parseInt(searchParams.get('pageSize') || '10', 10);

    // 3. 获取分页会员
    const result = await MembershipService.getAllMemberships(page, pageSize);

    // 4. 返回成功响应
    return ApiResponseBuilder.success(result, '获取会员列表成功');

  } catch (error) {
    console.error('获取会员列表失败:', error);
    return ApiResponseBuilder.serverError('获取会员列表失败');
  }
}

// 创建会员
export async function POST(request: NextRequest) {
  try {
    // 1. 认证中间件
    const authResult = await authMiddleware(request);
    if (authResult) return authResult;

    // 2. 解析请求体
    const body = await request.json();
    const createData: CreateMembershipRequest = {
      name: body.name,
      phone: body.phone,
      cardType: body.cardType,
      remainingSoups: body.remainingSoups
    };

    // 3. 创建会员
    const membership = await MembershipService.createMembership(createData);

    // 4. 返回成功响应
    return ApiResponseBuilder.success(membership, '会员创建成功');

  } catch (error) {
    console.error('创建会员失败:', error);

    if (error instanceof Error) {
      return ApiResponseBuilder.badRequest(error.message);
    }

    return ApiResponseBuilder.serverError('创建会员失败');
  }
}