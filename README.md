# 采芝林会员管理系统

基于 Next.js 15 和 Prisma 构建的会员管理系统，专为金氏采芝林养生炖汤馆设计。

## 功能特性

### 核心功能
- **会员管理**：会员信息录入、编辑、删除、搜索
- **汤品管理**：汤品信息管理，支持多种汤品类型
- **喝汤记录**：记录会员喝汤情况，自动扣减剩余次数
- **数据统计**：实时数据统计和图表展示
- **搜索功能**：全局搜索会员、汤品、记录

### 技术特性
- **现代化UI**：基于 Tailwind CSS 的响应式设计
- **暗黑模式**：支持明暗主题切换
- **实时图表**：使用 Recharts 展示数据可视化
- **分页加载**：支持大数据量的分页显示
- **JWT认证**：安全的用户认证系统

## 技术栈

### 前端
- **Next.js 15** - React 框架
- **TypeScript** - 类型安全
- **Tailwind CSS** - 样式框架
- **Recharts** - 数据可视化
- **React Icons** - 图标库

### 后端
- **Next.js API Routes** - 后端API
- **Prisma** - ORM数据库操作
- **MySQL** - 数据库
- **JWT** - 用户认证
- **bcrypt** - 密码加密

### 开发工具
- **ESLint** - 代码检查
- **TypeScript** - 类型检查
- **Turbopack** - 快速开发构建

## 项目结构

```
src/
├── app/                    # Next.js App Router
│   ├── api/               # API路由
│   │   ├── admin/         # 管理员认证
│   │   ├── memberships/   # 会员管理API
│   │   ├── soup/          # 汤品管理API
│   │   ├── soup-record/   # 喝汤记录API
│   │   ├── charts/        # 图表数据API
│   │   ├── stats/         # 统计数据API
│   │   ├── search/        # 搜索API
│   │   ├── recent/        # 最近活动API
│   │   ├── export/        # 数据导出API
│   │   └── settings/      # 系统设置API
│   ├── dashboard/         # 仪表盘页面
│   ├── memberships/       # 会员管理页面
│   ├── soups/            # 汤品管理页面
│   ├── soup-records/     # 喝汤记录页面
│   ├── search/           # 搜索页面
│   └── login/            # 登录页面
├── components/            # 可复用组件
│   ├── ThemeProvider.tsx # 主题管理
│   ├── LoginForm.tsx     # 登录表单
│   ├── Pagination.tsx    # 分页组件
│   └── LogoutConfirmModal.tsx # 退出确认弹窗
├── lib/                  # 工具库
│   ├── auth.ts          # 认证工具
│   ├── middleware.ts    # 中间件
│   ├── response.ts      # 响应构建器
│   └── validation.ts    # 数据验证
├── server/              # 服务层
│   └── services/        # 业务逻辑服务
├── services/            # 前端服务
├── types/               # TypeScript类型定义
└── generated/           # 自动生成的文件
```

## 快速开始

### 环境要求
- Node.js 18+ 
- MySQL 8.0+
- npm 或 yarn

### 安装依赖
```bash
npm install
```

### 环境配置
1. 复制环境变量文件：
```bash
cp .env.example .env.local
```

2. 配置数据库连接：
```env
DATABASE_URL="mysql://username:password@localhost:3306/your_db"
JWT_SECRET="your-jwt-secret-key"
```

### 数据库设置
```bash
# 生成Prisma客户端
npx prisma generate

# 运行数据库迁移
npx prisma migrate dev

# 初始化数据（可选）
npm run db:seed
```

### 启动开发服务器
```bash
npm run dev
```

访问 [http://localhost:3000](http://localhost:3000) 查看应用。

## 数据库模型

### 主要实体
- **Admin** - 管理员
- **Memberships** - 会员信息
- **Soup** - 汤品信息  
- **SoupRecord** - 喝汤记录

### 关系
- 会员与喝汤记录：一对多
- 汤品与喝汤记录：一对多

## 认证系统

- 使用 JWT Token 进行身份验证
- 除登录接口外，所有API都需要认证
- 支持管理员账户管理

## 主题系统

- 支持明暗主题切换
- 基于 CSS 变量的主题系统
- 自动保存用户主题偏好

## 数据可视化

使用 Recharts 提供多种图表：
- 会员增长趋势图
- 每日喝汤记录统计(最近7天)
- 会员分布饼图
- 卡类型分布柱状图
- 汤品消费统计

## 搜索功能

- 全局搜索：支持搜索会员、汤品、记录
- 分页显示：支持大数据量的分页加载
- 实时过滤：支持按类型过滤搜索结果

## 开发命令

```bash
# 开发模式
npm run dev

# 构建生产版本
npm run build

# 启动生产服务器
npm run start

# 代码检查
npm run lint

# 数据库种子数据
npm run db:seed
```