import { NextRequest } from 'next/server';
import { authMiddleware } from '@/lib/middleware';
import { ApiResponseBuilder } from '@/lib/response';

// 模拟系统设置数据
const defaultSettings = {
  systemName: '采芝林会员管理系统',
  companyName: '采芝林养生炖汤馆',
  contactPhone: '400-123-4567',
  businessHours: '09:00-21:00',
  timezone: 'Asia/Shanghai',
  dateFormat: 'YYYY-MM-DD',
  timeFormat: 'HH:mm:ss',
  pageSize: 20,
  enableNotifications: true,
  enableAuditLog: true,
  backupFrequency: 'daily',
  maxLoginAttempts: 5,
  sessionTimeout: 24, // 小时
  theme: 'light', // light, dark, auto
  language: 'zh-CN'
};

// 获取系统设置
export async function GET(request: NextRequest) {
  try {
    // 1. 认证中间件
    const authResult = await authMiddleware(request);
    if (authResult) return authResult;

    // 2. 返回系统设置
    return ApiResponseBuilder.success(defaultSettings, '获取系统设置成功');

  } catch (error) {
    console.error('获取系统设置失败:', error);
    return ApiResponseBuilder.serverError('获取系统设置失败');
  }
}

// 更新系统设置
export async function PUT(request: NextRequest) {
  try {
    // 1. 认证中间件
    const authResult = await authMiddleware(request);
    if (authResult) return authResult;

    // 2. 解析请求体
    const body = await request.json();
    
    // 3. 验证设置数据
    const updatedSettings = { ...defaultSettings, ...body };
    
    // 4. 这里应该保存到数据库或配置文件
    // 目前只是返回更新后的设置
    
    // 5. 返回成功响应
    return ApiResponseBuilder.success(updatedSettings, '系统设置更新成功');

  } catch (error) {
    console.error('更新系统设置失败:', error);
    
    if (error instanceof Error) {
      return ApiResponseBuilder.badRequest(error.message);
    }
    
    return ApiResponseBuilder.serverError('更新系统设置失败');
  }
} 