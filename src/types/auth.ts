// 登录表单
export interface LoginForm {
  phone: string;
  password: string;
}

// 登录响应
export interface LoginResponse {
  token: string;
  admin: {
    id: number;
    name: string;
    phone: string;
  };
}