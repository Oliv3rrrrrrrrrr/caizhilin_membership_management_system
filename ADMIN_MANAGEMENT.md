# 管理员管理说明

## 概述
为了系统安全，管理员账户不提供对外API接口。管理员账户通过数据库种子脚本管理。

## 1. 初始管理员创建
使用数据库种子脚本创建初始管理员账户：

```bash
# 运行种子脚本
npm run db:seed
```

默认管理员账户：
- 手机号：`13333333333`
- 密码：`123456`
- 姓名：`张三`

## 2. 添加新管理员
编辑 `prisma/seed.ts` 文件，添加新的管理员账户：

```typescript
// 在 main() 函数中添加
const newAdmin = await prisma.admin.upsert({
  where: { phone: '新手机号' },
  update: {},
  create: {
    name: '新管理员姓名',
    phone: '新手机号',
    password: await bcrypt.hash('新密码', 10),
  },
});
```

然后重新运行种子脚本：
```bash
npm run db:seed
```

## 3. 修改管理员信息
编辑 `prisma/seed.ts` 文件，修改管理员信息：

```typescript
// 修改现有管理员信息
const updatedAdmin = await prisma.admin.upsert({
  where: { phone: '13333333333' },
  update: {
    name: '新姓名',
    password: await bcrypt.hash('新密码', 10),
  },
  create: {
    name: '张三',
    phone: '13333333333',
    password: await bcrypt.hash('123456', 10),
  },
});
```

然后重新运行种子脚本：
```bash
npm run db:seed
```

## 4. 删除管理员
编辑 `prisma/seed.ts` 文件，移除对应的管理员创建代码，然后重新运行种子脚本。

## 5. 紧急情况
如果忘记管理员密码，可以修改 `prisma/seed.ts` 文件中的密码，然后重新运行种子脚本。