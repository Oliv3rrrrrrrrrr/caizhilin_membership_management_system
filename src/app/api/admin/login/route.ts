import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';
import { verifyPassword, generateToken } from '@/lib/auth';
import { validatePhone } from '@/lib/validation';

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    // 1. 获取登录信息
    const body = await request.json();
    const { phone, password } = body;

    // 2. 验证必填字段
    if (!phone || !password) {
      return NextResponse.json(
        { error: "手机号和密码都是必填项" },
        { status: 400 }
      );
    }

    // 3. 验证手机号格式
    if (!validatePhone(phone)) {
      return NextResponse.json(
        { error: "手机号格式不正确" },
        { status: 400 }
      );
    }

    // 4. 检查管理员是否存在
    const admin = await prisma.admin.findUnique({
      where: {
        phone,
      },
    });
    
    // 5. 验证管理员是否存在
    if (!admin) {
      return NextResponse.json(
        { error: "手机号或密码错误" },
        { status: 401 }
      );
    }

    // 6. 验证密码
    const isPasswordValid = await verifyPassword(password, admin.password);
    if (!isPasswordValid) {
      return NextResponse.json(
        { error: "手机号或密码错误" },
        { status: 401 }
      );
    }
    
    // 7. 生成JWT token
    const token = generateToken({ 
      id: admin.id,
      name: admin.name,
      phone: admin.phone,
    });

    // 8. 登录成功，返回管理员信息
    return NextResponse.json({
      message: "登录成功",
      token,
      admin: {
        id: admin.id,
        name: admin.name,
        phone: admin.phone,
      }
    });
    
  } catch (error) {
    return NextResponse.json(
      { error: "服务器内部错误，登录失败" },
      { status: 500 }
    )
  }
}