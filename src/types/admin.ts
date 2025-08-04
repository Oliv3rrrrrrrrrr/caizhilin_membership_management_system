// 创建管理员请求
export interface CreateAdminRequest {
  name: string;
  phone: string;
  password: string;
}

// 更新管理员请求
export interface UpdateAdminRequest {
  name?: string;
  phone?: string;
  password?: string;
}

// 管理员响应
export interface AdminResponse {
  id: number;
  name: string;
  phone: string;
}

// 登录请求
export interface LoginRequest {
  phone: string;
  password: string;
}

// 登录响应
export interface LoginResponse {
  token: string;
  admin: AdminResponse;
} 