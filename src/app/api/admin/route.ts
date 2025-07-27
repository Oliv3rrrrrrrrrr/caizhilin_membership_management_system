import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";
import { hashPassword, verifyToken } from '@/lib/auth';
import { validatePhone, validatePassword, validateName } from '@/lib/validation';

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    // 1. 获取请求体数据
    const body = await request.json();
    const { name, phone, password } = body;

    // 2. 验证必填字段
    if (!name || !phone || !password) {
      return NextResponse.json(
        { error: "姓名、手机号和密码都是必填项" },
        { status: 400 }
      );
    }

    // 3. 格式验证
    const nameValidation = validateName(name);
    if (!nameValidation.isValid) {
      return NextResponse.json(
        { error: nameValidation.message },
        { status: 400 }
      );
    }

    if (!validatePhone(phone)) {
      return NextResponse.json(
        { error: "手机号格式不正确" },
        { status: 400 }
      );
    }
    
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.isValid) {
      return NextResponse.json(
        { error: passwordValidation.message },
        { status: 400 }
      );
    }

    // 4. 检查手机号是否存在
    const existingAdmin = await prisma.admin.findUnique({
      where: {
        phone,
      },
    });
    if (existingAdmin) {
      return NextResponse.json(
        { error: "手机号已存在" }, 
        { status: 400 }
      );
    }
    
    // 5. 加密密码
    const hashedPassword = await hashPassword(password);

    // 6. 创建新管理员
    const newAdmin = await prisma.admin.create({
      data: {
        name,
        phone,
        password: hashedPassword,
      },
    });

    // 7. 返回成功相应
    return NextResponse.json({
      message: "管理员创建成功",
      admin: {
        id: newAdmin.id,
        name: newAdmin.name,
        phone: newAdmin.phone,
      }
    });
  } catch (error) {
    return NextResponse.json(
      { error: "服务器内部错误，创建管理员失败" },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    // 1. 获取请求头中的token
    const authHeader = request.headers.get("authorization");

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: '未提供有效的token' },
        { status: 401 }
      );
    }

    // 2. 提取token
    const token = authHeader.substring(7);

    // 3. 验证 token
    try {
      const decoded = verifyToken(token);
    } catch (error) {
      return NextResponse.json(
        { error: '无效的认证令牌' },
        { status: 401 }
      );
    }

    // 4. 获取所有管理员
    const admins = await prisma.admin.findMany({
      select: {
        id: true,
        name: true,
        phone: true,
      },
    });

    return NextResponse.json(admins);

  } catch (error) {
    return NextResponse.json(
      { error: "服务器内部错误，获取管理员失败" },
      { status: 500 }
    );
  }
}