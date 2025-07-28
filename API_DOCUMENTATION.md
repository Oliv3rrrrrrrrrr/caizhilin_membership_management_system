# 采芝林会员管理系统 API 文档

## 基础信息

- **基础URL**: `http://localhost:3000/api`
- **认证方式**: Bearer Token (JWT)
- **时间格式**: 北京时间 (UTC+8)
- **响应格式**: JSON

## 通用响应格式

```json
{
  "success": true/false,
  "message": "操作结果描述",
  "data": {},
  "error": "错误代码",
  "timestamp": "2025-07-28T09:24:41.192+08:00"
}
```

## 认证相关

### 1. 管理员登录
- **URL**: `POST /api/admin/login`
- **认证**: 无需认证
- **请求体**:
```json
{
  "phone": "13333333333",
  "password": "123456"
}
```
- **响应**:
```json
{
  "success": true,
  "message": "登录成功",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "admin": {
      "id": 1,
      "name": "管理员",
      "phone": "13333333333"
    }
  }
}
```

## 管理员管理

### 1. 获取管理员列表
- **URL**: `GET /api/admin`
- **认证**: 需要 Bearer Token
- **响应**: 返回所有管理员列表

### 2. 创建管理员
- **URL**: `POST /api/admin`
- **认证**: 无需认证
- **请求体**:
```json
{
  "name": "新管理员",
  "phone": "13800138000",
  "password": "123456"
}
```

### 3. 获取管理员详情
- **URL**: `GET /api/admin/{id}`
- **认证**: 需要 Bearer Token
- **参数**: `id` - 管理员ID

### 4. 更新管理员信息
- **URL**: `PUT /api/admin/{id}`
- **认证**: 需要 Bearer Token
- **请求体**:
```json
{
  "name": "更新后的姓名",
  "phone": "13800138000",
  "password": "新密码"
}
```

### 5. 删除管理员
- **URL**: `DELETE /api/admin/{id}`
- **认证**: 需要 Bearer Token

## 会员管理

### 1. 获取会员列表
- **URL**: `GET /api/memberships`
- **认证**: 需要 Bearer Token
- **响应**: 返回所有会员列表，按ID倒序排列

### 2. 创建会员
- **URL**: `POST /api/memberships`
- **认证**: 需要 Bearer Token
- **请求体**:
```json
{
  "name": "张三",
  "phone": "13800138000",
  "cardType": "980卡",
  "remainingSoups": 30
}
```
- **注意**: `remainingSoups` 必须是数字类型，不能是字符串

### 3. 获取会员详情
- **URL**: `GET /api/memberships/{id}`
- **认证**: 需要 Bearer Token
- **参数**: `id` - 会员ID

### 4. 更新会员信息
- **URL**: `PUT /api/memberships/{id}`
- **认证**: 需要 Bearer Token
- **请求体**:
```json
{
  "name": "张三",
  "cardType": "1280卡",
  "remainingSoups": 25
}
```
- **注意**: 不能更新手机号，手机号是唯一标识

### 5. 删除会员
- **URL**: `DELETE /api/memberships/{id}`
- **认证**: 需要 Bearer Token

## 汤品管理

### 1. 获取汤品列表
- **URL**: `GET /api/soup`
- **认证**: 需要 Bearer Token
- **响应**: 返回所有汤品列表，按ID倒序排列

### 2. 创建汤品
- **URL**: `POST /api/soup`
- **认证**: 需要 Bearer Token
- **请求体**:
```json
{
  "name": "老火靓汤",
  "type": "滋补类"
}
```

### 3. 获取汤品详情
- **URL**: `GET /api/soup/{id}`
- **认证**: 需要 Bearer Token
- **参数**: `id` - 汤品ID

### 4. 更新汤品信息
- **URL**: `PUT /api/soup/{id}`
- **认证**: 需要 Bearer Token
- **请求体**:
```json
{
  "name": "新汤品名称",
  "type": "新类型"
}
```

### 5. 删除汤品
- **URL**: `DELETE /api/soup/{id}`
- **认证**: 需要 Bearer Token
- **注意**: 如果汤品有关联的喝汤记录，则无法删除

## 喝汤记录管理

### 1. 获取喝汤记录列表
- **URL**: `GET /api/soup-record`
- **认证**: 需要 Bearer Token
- **查询参数**: 
  - `membershipId` (可选): 按会员ID筛选记录
- **响应**: 返回喝汤记录列表，包含会员和汤品详情

### 2. 创建喝汤记录
- **URL**: `POST /api/soup-record`
- **认证**: 需要 Bearer Token
- **请求体**:
```json
{
  "membershipId": 1,
  "soupId": 1,
  "drinkTime": "2025-07-28T09:30:00+08:00"
}
```
- **业务逻辑**: 
  - 自动减少会员剩余汤品数量
  - 验证会员剩余汤品数量是否充足
  - 使用事务确保数据一致性

### 3. 获取喝汤记录详情
- **URL**: `GET /api/soup-record/{id}`
- **认证**: 需要 Bearer Token
- **参数**: `id` - 记录ID

### 4. 更新喝汤记录
- **URL**: `PUT /api/soup-record/{id}`
- **认证**: 需要 Bearer Token
- **请求体**:
```json
{
  "soupId": 2,
  "drinkTime": "2025-07-28T10:00:00+08:00"
}
```

### 5. 删除喝汤记录
- **URL**: `DELETE /api/soup-record/{id}`
- **认证**: 需要 Bearer Token

## 搜索功能

### 1. 全局搜索
- **URL**: `GET /api/search`
- **认证**: 需要 Bearer Token
- **查询参数**:
  - `q` (必需): 搜索关键词
  - `type` (可选): 搜索类型 - `all`, `members`, `soups`, `records`
  - `limit` (可选): 返回结果数量限制，默认10
- **响应**:
```json
{
  "success": true,
  "message": "搜索完成",
  "data": {
    "members": [...],
    "soups": [...],
    "records": [...]
  }
}
```

## 系统设置

### 1. 获取系统设置
- **URL**: `GET /api/settings`
- **认证**: 需要 Bearer Token
- **响应**:
```json
{
  "success": true,
  "message": "获取系统设置成功",
  "data": {
    "systemName": "采芝林会员管理系统",
    "companyName": "采芝林养生炖汤馆",
    "contactPhone": "400-123-4567",
    "businessHours": "09:00-21:00",
    "timezone": "Asia/Shanghai",
    "dateFormat": "YYYY-MM-DD",
    "timeFormat": "HH:mm:ss",
    "pageSize": 20,
    "enableNotifications": true,
    "enableAuditLog": true,
    "backupFrequency": "daily",
    "maxLoginAttempts": 5,
    "sessionTimeout": 24,
    "theme": "light",
    "language": "zh-CN"
  }
}
```

### 2. 更新系统设置
- **URL**: `PUT /api/settings`
- **认证**: 需要 Bearer Token
- **请求体**: 包含要更新的设置字段
- **响应**: 返回更新后的完整设置

## 数据导出

### 1. 导出数据
- **URL**: `GET /api/export`
- **认证**: 需要 Bearer Token
- **查询参数**:
  - `type` (可选): 导出类型 - `all`, `members`, `soups`, `records`
  - `format` (可选): 导出格式 - `json`, `csv`, `excel`
  - `startDate` (可选): 开始日期
  - `endDate` (可选): 结束日期
- **响应**: 返回导出的数据，包含元数据信息

## 统计信息

### 1. 获取仪表板统计数据
- **URL**: `GET /api/stats`
- **认证**: 需要 Bearer Token
- **响应**:
```json
{
  "success": true,
  "message": "统计数据获取成功",
  "data": {
    "memberCount": 10,
    "todayNewMembers": 2,
    "soupCount": 5,
    "todaySoupRecords": 15,
    "soupRecordCount": 100,
    "adminCount": 3
  }
}
```

## 错误代码说明

| 错误代码 | 说明 |
|---------|------|
| `UNAUTHORIZED` | 未提供有效的认证令牌 |
| `INVALID_TOKEN` | 无效的认证令牌 |
| `NOT_FOUND` | 资源不存在 |
| `BAD_REQUEST` | 请求参数错误 |
| `INTERNAL_SERVER_ERROR` | 服务器内部错误 |

## 数据验证规则

### 会员信息验证
- **姓名**: 2-20个字符
- **手机号**: 11位数字，符合中国手机号格式
- **卡类型**: 必填
- **剩余汤品数量**: 非负整数

### 汤品信息验证
- **名称**: 必填
- **类型**: 必填

### 喝汤记录验证
- **会员ID**: 必须存在且为正整数
- **汤品ID**: 必须存在且为正整数
- **喝汤时间**: ISO 8601格式，可选

## 时间处理说明

- 所有时间都使用北京时间 (UTC+8)
- 数据库存储的时间会自动转换为北京时间
- API响应中的时间戳都是北京时间ISO格式
- "今日"统计基于北京时间当天0点

## 使用示例

### 1. 登录获取Token
```bash
curl -X POST http://localhost:3000/api/admin/login \
  -H "Content-Type: application/json" \
  -d '{"phone":"18029253555","password":"123456"}'
```

### 2. 使用Token访问受保护的接口
```bash
curl -X GET http://localhost:3000/api/memberships \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### 3. 创建会员
```bash
curl -X POST http://localhost:3000/api/memberships \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "张三",
    "phone": "13800138000",
    "cardType": "980卡",
    "remainingSoups": 30
  }'
```

### 4. 搜索会员
```bash
curl -X GET "http://localhost:3000/api/search?q=张三&type=members" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### 5. 导出数据
```bash
curl -X GET "http://localhost:3000/api/export?type=members&format=json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

## 注意事项

1. **认证**: 除了登录和创建管理员接口，其他所有接口都需要在请求头中携带 `Authorization: Bearer <token>`
2. **数据类型**: 注意 `remainingSoups` 等数字字段必须是数字类型，不能是字符串
3. **时间格式**: 所有时间都使用北京时间，前端显示时无需额外转换
4. **业务逻辑**: 创建喝汤记录时会自动减少会员剩余汤品数量
5. **数据完整性**: 删除汤品时会检查是否有关联的喝汤记录
6. **搜索功能**: 支持模糊搜索，可以搜索会员姓名、手机号、卡号等
7. **数据导出**: 支持多种格式导出，包含完整的元数据信息 