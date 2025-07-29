import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { toSystemISOString } from '@/lib/timeUtils';

// 扩展请求类型以包含用户信息
interface AuthenticatedRequest extends NextRequest {
  user?: any;
}

// 认证中间件
export async function authMiddleware(request: NextRequest): Promise<NextResponse | null> {
  try {
    // 1. 获取认证头
    const authHeader = request.headers.get('authorization');
    
    // 2. 如果认证头不存在或不以Bearer开头，则返回401错误
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        {
          success: false,
          message: '未提供有效的认证令牌',
          error: 'UNAUTHORIZED',
          timestamp: toSystemISOString(new Date())
        },
        { status: 401 }
      );
    }

    // 3. 获取token
    const token = authHeader.substring(7);
    // 4. 验证token
    const decoded = verifyToken(token);
    
    // 5. 将用户信息添加到请求中
    (request as AuthenticatedRequest).user = decoded;
    
    // 6. 继续处理请求
    return null;
  } catch (error) {
    // 7. 如果验证失败，则返回401错误
    return NextResponse.json(
      {
        success: false,
        message: '无效的认证令牌',
        error: 'INVALID_TOKEN',
        timestamp: toSystemISOString(new Date())
      },
      { status: 401 }
    );
  }
}

// 验证ID
export function validateId(id: string): number | null {
  // 1. 将id转换为数字
  const numId = parseInt(id);
  // 2. 如果id不是数字或小于等于0，则返回null
  return isNaN(numId) || numId <= 0 ? null : numId;
}