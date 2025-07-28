# 采芝林会员管理系统 API 文档（企业级详细版）

---

## 目录
1. [基础信息](#基础信息)
2. [通用响应格式](#通用响应格式)
3. [认证与权限](#认证与权限)
4. [管理员管理](#管理员管理)
5. [会员管理](#会员管理)
6. [汤品管理](#汤品管理)
7. [喝汤记录管理](#喝汤记录管理)
8. [搜索功能](#搜索功能)
9. [统计信息](#统计信息)
10. [系统设置](#系统设置)
11. [数据导出](#数据导出)
12. [错误代码说明](#错误代码说明)
13. [数据验证规则](#数据验证规则)
14. [时间处理说明](#时间处理说明)
15. [接口使用示例](#接口使用示例)

---

## 基础信息
- **基础URL**: `/api`
- **认证方式**: Bearer Token (JWT)，除登录和注册外所有接口均需
- **时间格式**: 北京时间 (UTC+8)，ISO 8601 字符串
- **响应格式**: JSON，所有响应均含 success/message/data/error/timestamp 字段

---

## 通用响应格式
```json
{
  "success": true,
  "message": "操作结果描述",
  "data": { ... },
  "error": "错误代码（可选）",
  "timestamp": "2025-07-28T09:24:41.192+08:00"
}
```
- **success**: 操作是否成功
- **message**: 结果描述
- **data**: 业务数据对象
- **error**: 错误代码（失败时）
- **timestamp**: 响应时间（北京时间）

---

## 认证与权限
- 除 `POST /api/admin/login`、`POST /api/admin` 外，所有接口需在 Header 携带 `Authorization: Bearer <token>`
- Token 过期/无效时返回 401，error: `UNAUTHORIZED` 或 `INVALID_TOKEN`
- 管理员操作需有管理员权限

---

## 管理员管理
### 1. 管理员登录
- **URL**: `POST /api/admin/login`
- **请求体**：
  | 字段   | 类型   | 必填 | 说明   |
  |--------|--------|------|--------|
  | phone  | string | 是   | 手机号 |
  | password | string | 是 | 密码   |
- **响应**：
  | 字段   | 类型   | 说明         |
  |--------|--------|--------------|
  | token  | string | JWT Token    |
  | admin  | object | 管理员信息   |

### 2. 管理员增删改查
- `GET /api/admin` 获取管理员列表
- `POST /api/admin` 创建管理员
- `GET /api/admin/{id}` 获取管理员详情
- `PUT /api/admin/{id}` 更新管理员
- `DELETE /api/admin/{id}` 删除管理员
- **所有字段类型、权限、业务规则详见数据库结构与服务实现**

---

## 会员管理
### 1. 获取会员列表（分页）
- **URL**: `GET /api/memberships`
- **参数**：
  | 参数     | 类型   | 必填 | 说明         |
  |----------|--------|------|--------------|
  | page     | number | 否   | 页码，默认1  |
  | pageSize | number | 否   | 每页数量，默认10 |
- **响应**：
  | 字段     | 类型   | 说明         |
  |----------|--------|--------------|
  | data     | array  | 会员对象数组 |
  | total    | number | 总数         |
  | page     | number | 当前页码     |
  | pageSize | number | 每页数量     |
- **会员对象字段**：
  | 字段           | 类型   | 说明         |
  |----------------|--------|--------------|
  | id             | number | 会员ID       |
  | name           | string | 姓名         |
  | phone          | string | 手机号       |
  | cardNumber     | string | 卡号         |
  | cardType       | string | 卡类型       |
  | issueDate      | string | 发卡日期     |
  | remainingSoups | number | 剩余汤品次数 |

### 2. 创建会员
- **URL**: `POST /api/memberships`
- **请求体**：同上表，除 id/issueDate 自动生成
- **业务规则**：手机号唯一，卡号自动生成，剩余汤品为非负整数

### 3. 获取/更新/删除会员
- `GET /api/memberships/{id}`
- `PUT /api/memberships/{id}`
- `DELETE /api/memberships/{id}`
- **PUT 请求体**：可更新 name/cardType/remainingSoups
- **业务规则**：手机号不可更改

### 4. 会员统计
- **URL**: `GET /api/memberships/stats`
- **响应**：
  | 字段         | 类型   | 说明         |
  |--------------|--------|--------------|
  | total        | number | 总会员数     |
  | active       | number | 活跃会员数（剩余>0）|
  | inactive     | number | 待续费会员数（剩余=0）|
  | cardTypeCount| number | 卡类型种类数 |

### 5. 会员搜索（分页）
- **URL**: `GET /api/search?q=关键词&type=members&page=1&pageSize=10`
- **响应**：
  | 字段     | 类型   | 说明         |
  |----------|--------|--------------|
  | members  | array  | 匹配会员数组 |
  | total    | number | 匹配总数     |
  | page     | number | 当前页码     |
  | pageSize | number | 每页数量     |

---

## 汤品管理
### 1. 获取汤品列表
- **URL**: `GET /api/soup`
- **响应**：
  | 字段   | 类型   | 说明         |
  |--------|--------|--------------|
  | id     | number | 汤品ID       |
  | name   | string | 汤品名称     |
  | type   | string | 汤品类型     |

### 2. 创建/更新/删除汤品
- `POST /api/soup` 创建
- `PUT /api/soup/{id}` 更新
- `DELETE /api/soup/{id}` 删除
- **业务规则**：如有关联喝汤记录则禁止删除

---

## 喝汤记录管理
### 1. 获取喝汤记录列表（分页）
- **URL**: `GET /api/soup-record`
- **参数**：
  | 参数         | 类型   | 必填 | 说明         |
  |--------------|--------|------|--------------|
  | page         | number | 否   | 页码         |
  | pageSize     | number | 否   | 每页数量     |
  | membershipId | number | 否   | 按会员筛选   |
- **响应**：
  | 字段     | 类型   | 说明         |
  |----------|--------|--------------|
  | data     | array  | 喝汤记录数组 |
  | total    | number | 总数         |
  | page     | number | 当前页码     |
  | pageSize | number | 每页数量     |
- **喝汤记录对象字段**：
  | 字段         | 类型   | 说明         |
  |--------------|--------|--------------|
  | id           | number | 记录ID       |
  | membership   | object | 会员信息     |
  | soup         | object | 汤品信息     |
  | drinkTime    | string | 喝汤时间     |

### 2. 创建/更新/删除喝汤记录
- `POST /api/soup-record` 创建
- `PUT /api/soup-record/{id}` 更新
- `DELETE /api/soup-record/{id}` 删除
- **业务规则**：创建时自动扣减会员剩余次数，校验剩余次数充足，所有操作需事务保证一致性

### 3. 获取喝汤记录详情
- `GET /api/soup-record/{id}`

### 4. 喝汤记录统计
- **URL**: `GET /api/soup-records/stats`
- **响应**：
  | 字段         | 类型   | 说明         |
  |--------------|--------|--------------|
  | total        | number | 总记录数     |
  | today        | number | 今日记录数   |
  | week         | number | 本周记录数   |
  | uniqueMembers| number | 参与会员数   |

### 5. 喝汤记录搜索（分页）
- **URL**: `GET /api/soup-records/search?q=关键词&page=1&pageSize=10`
- **响应**：
  | 字段     | 类型   | 说明         |
  |----------|--------|--------------|
  | records  | array  | 匹配记录数组 |
  | total    | number | 匹配总数     |
  | page     | number | 当前页码     |
  | pageSize | number | 每页数量     |

---

## 搜索功能
### 1. 全局搜索
- **URL**: `GET /api/search`
- **参数**：
  | 参数     | 类型   | 必填 | 说明         |
  |----------|--------|------|--------------|
  | q        | string | 是   | 搜索关键词   |
  | type     | string | 否   | 搜索类型 all/members/soups/records |
  | page     | number | 否   | 页码         |
  | pageSize | number | 否   | 每页数量     |
- **响应**：
  | 字段     | 类型   | 说明         |
  |----------|--------|--------------|
  | members  | array  | 匹配会员数组 |
  | soups    | array  | 匹配汤品数组 |
  | records  | array  | 匹配喝汤记录数组 |
  | total    | number | 匹配总数     |
  | page     | number | 当前页码     |
  | pageSize | number | 每页数量     |

---

## 统计信息
- `GET /api/stats` 仪表盘总览统计（会员数、今日新增、汤品数、今日喝汤、喝汤总数、管理员数）
- `GET /api/memberships/stats` 会员统计
- `GET /api/soup-records/stats` 喝汤记录统计

---

## 系统设置
- `GET /api/settings` 获取系统设置
- `PUT /api/settings` 更新系统设置
- **字段**：systemName/companyName/contactPhone/businessHours/timezone/dateFormat/timeFormat/pageSize/enableNotifications/enableAuditLog/backupFrequency/maxLoginAttempts/sessionTimeout/theme/language

---

## 数据导出
- `GET /api/export?type=all|members|soups|records&format=json|csv|excel` 导出数据
- **参数**：type/format/startDate/endDate
- **响应**：包含导出数据和元数据

---

## 错误代码说明
| 错误代码 | 说明 |
|---------|------|
| `UNAUTHORIZED` | 未提供有效的认证令牌 |
| `INVALID_TOKEN` | 无效的认证令牌 |
| `NOT_FOUND` | 资源不存在 |
| `BAD_REQUEST` | 请求参数错误 |
| `INTERNAL_SERVER_ERROR` | 服务器内部错误 |

---

## 数据验证规则
- 会员姓名：2-20字符，必填
- 手机号：11位中国手机号，唯一，必填
- 卡类型：必填
- 剩余汤品数量：非负整数，必填
- 汤品名称/类型：必填
- 喝汤记录：会员ID/汤品ID/喝汤时间必填，喝汤时间不可晚于当前时间

---

## 时间处理说明
- 所有时间均为北京时间 (UTC+8)
- API响应时间戳为ISO格式
- "今日"统计基于北京时间当天0点
- 所有时间字段均为 ISO 8601 字符串，前端无需额外转换

---

## 接口使用示例
### 登录获取Token
```bash
curl -X POST http://localhost:3000/api/admin/login \
  -H "Content-Type: application/json" \
  -d '{"phone":"18029253555","password":"123456"}'
```
### 使用Token访问受保护接口
```bash
curl -X GET http://localhost:3000/api/memberships \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```
### 创建会员
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
### 搜索会员
```bash
curl -X GET "http://localhost:3000/api/search?q=张三&type=members&page=1&pageSize=10" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```
### 喝汤记录搜索
```bash
curl -X GET "http://localhost:3000/api/soup-records/search?q=张三&page=1&pageSize=10" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```
### 导出数据
```bash
curl -X GET "http://localhost:3000/api/export?type=members&format=json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
``` 