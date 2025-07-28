// src/services/authService.ts
import { LoginForm, LoginResponse } from '@/types/auth';

export async function login(data: LoginForm): Promise<LoginResponse> {
  const res = await fetch('/api/admin/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  const result = await res.json();
  if (!result.success) {
    throw new Error(result.message || '登录失败');
  }
  return result.data;
}