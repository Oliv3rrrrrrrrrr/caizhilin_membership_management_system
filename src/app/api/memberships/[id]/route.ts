import { NextRequest } from 'next/server';
import { MembershipService } from '@/server/services/membershipService';
import { authMiddleware, validateId } from '@/lib/middleware';
import { ApiResponseBuilder } from '@/lib/response';
import { UpdateMembershipRequest } from '@/types/membership';

// 获取会员详情
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // 1. 认证中间件
    const authResult = await authMiddleware(request);
    if (authResult) return authResult;

    // 2. 验证ID
    const id = validateId(params.id);
    if (!id) {
      return ApiResponseBuilder.badRequest('无效的会员ID');
    }

    // 3. 获取会员详情
    const membership = await MembershipService.getMembershipById(id);
    if (!membership) {
      return ApiResponseBuilder.notFound('会员不存在');
    }

    // 4. 返回成功响应
    return ApiResponseBuilder.success(membership, '获取会员详情成功');

  } catch (error) {
    console.error('获取会员详情失败:', error);
    return ApiResponseBuilder.serverError('获取会员详情失败');
  }
}

// 更新会员信息
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // 1. 认证中间件
    const authResult = await authMiddleware(request);
    if (authResult) return authResult;

    // 2. 验证ID
    const id = validateId(params.id);
    if (!id) {
      return ApiResponseBuilder.badRequest('无效的会员ID');
    }

    // 3. 解析请求体
    const body = await request.json();
    const updateData: UpdateMembershipRequest = {
      name: body.name,
      phone: body.phone,
      cardType: body.cardType,
      remainingSoups: body.remainingSoups
    };

    // 4. 更新会员
    const membership = await MembershipService.updateMembership(id, updateData);

    // 5. 返回成功响应
    return ApiResponseBuilder.success(membership, '会员信息更新成功');

  } catch (error) {
    console.error('更新会员信息失败:', error);

    if (error instanceof Error) {
      if (error.message === '会员不存在') {
        return ApiResponseBuilder.notFound(error.message);
      }
      return ApiResponseBuilder.badRequest(error.message);
    }

    return ApiResponseBuilder.serverError('更新会员信息失败');
  }
}

// 删除会员
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // 1. 认证中间件
    const authResult = await authMiddleware(request);
    if (authResult) return authResult;

    // 2. 验证ID
    const id = validateId(params.id);
    if (!id) {
      return ApiResponseBuilder.badRequest('无效的会员ID');
    }

    // 3. 删除会员
    await MembershipService.deleteMembership(id);

    // 4. 返回成功响应
    return ApiResponseBuilder.success(null, '会员删除成功');

  } catch (error) {
    console.error('删除会员失败:', error);

    if (error instanceof Error) {
      if (error.message === '会员不存在') {
        return ApiResponseBuilder.notFound(error.message);
      }
      return ApiResponseBuilder.badRequest(error.message);
    }

    return ApiResponseBuilder.serverError('删除会员失败');
  }
}
