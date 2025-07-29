import { NextResponse } from 'next/server';
import { ApiResponse } from '@/types/membership';
import { toSystemISOString } from '@/lib/timeUtils';

// 定义响应接口
export class ApiResponseBuilder {
  // 成功响应
  static success<T>(data: T, message: string = '操作成功'): NextResponse {
    // 1. 创建响应对象
    const response: ApiResponse<T> = {
      success: true,
      message,
      data,
      timestamp: toSystemISOString(new Date())
    };
    // 2. 返回响应对象
    return NextResponse.json(response);
  }

  // 错误响应
  static error(message: string, status: number = 400, errorCode?: string): NextResponse {
    // 1. 创建响应对象
    const response: ApiResponse = {
      success: false,
      message,
      error: errorCode,
      timestamp: toSystemISOString(new Date())
    };
    // 2. 返回响应对象
    return NextResponse.json(response, { status });
  }

  // 资源不存在
  static notFound(message: string = '资源不存在'): NextResponse {
    return this.error(message, 404, 'NOT_FOUND');
  }

  // 未授权访问
  static unauthorized(message: string = '未授权访问'): NextResponse {
    return this.error(message, 401, 'UNAUTHORIZED');
  }

  // 请求参数错误
  static badRequest(message: string = '请求参数错误'): NextResponse {
    return this.error(message, 400, 'BAD_REQUEST');
  }

  // 服务器内部错误
  static serverError(message: string = '服务器内部错误'): NextResponse {
    return this.error(message, 500, 'INTERNAL_SERVER_ERROR');
  }
} 