import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {

  // 创建管理员账户
  const hashedPassword = await bcrypt.hash('123456', 10);
  
  const admin = await prisma.admin.upsert({
    where: { phone: '13333333333' },
    update: {},
    create: {
      name: '张三',
      phone: '13333333333',
      password: hashedPassword,
    },
  });

  console.log('管理员账户创建成功:', admin.name);
}

main()
  .catch((e) => {
    console.error('数据库初始化失败:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 