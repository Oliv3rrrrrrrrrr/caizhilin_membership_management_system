import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

// 密码加密
export async function hashPassword(password: string): Promise<string> {
  // 1. 生成盐
  const saltRounds = 12;
  // 2. 使用bcrypt加密密码
  return await bcrypt.hash(password, saltRounds);
}

// 密码验证
export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  // 1. 使用bcrypt验证密码
  return await bcrypt.compare(password, hashedPassword);
}

// 生成JWT token
export function generateToken(payload: any): string {
  // 1. 获取JWT_SECRET
  const secret = process.env.JWT_SECRET;
  // 2. 如果JWT_SECRET未设置，则抛出错误
  if (!secret) {
    throw new Error("JWT_SECRET is not set");
  }
  // 3. 生成JWT token
  return jwt.sign(payload, secret, { expiresIn: "24h" });
}

// 验证JWT token
export function verifyToken(token: string): any {
  // 1. 获取JWT_SECRET
  const secret = process.env.JWT_SECRET;
  // 2. 如果JWT_SECRET未设置，则抛出错误
  if (!secret) {
    throw new Error("JWT_SECRET is not set");
  }

  try {
    // 3. 验证JWT token
    return jwt.verify(token, secret);
  } catch (error) {
    // 4. 如果验证失败，则抛出错误
    throw new Error("Invalid token");
  }
}