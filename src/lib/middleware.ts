import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "./auth";

export async function authMiddleware(request: NextRequest) {
  try {
    // 1. 从请求头获取token
    const token = request.headers.get("authorization")?.replace("Bearer ", "");

    if (!token) {
      return NextResponse.json(
        { error: "未提供token" },
        { status: 401 }
      );
    }

    // 2. 验证token
    const decoded = verifyToken(token);

    // 3. 将管理员信息添加到请求头
    request.headers.set("user", JSON.stringify(decoded));

    return NextResponse.next();
  } catch (error) {
    return NextResponse.json(
      { error: "无效的token" },
      { status: 401 }
    );
  }
}