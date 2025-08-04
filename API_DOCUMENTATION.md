# 采芝林会员管理系统 API 文档（企业级详细版）

---

## 目录
1. [基础信息](#基础信息)
2. [通用响应格式](#通用响应格式)
3. [认证与权限](#认证与权限)
4. [管理员认证](#管理员认证)
5. [会员管理](#会员管理)
6. [汤品管理](#汤品管理)
7. [喝汤记录管理](#喝汤记录管理)
8. [搜索功能](#搜索功能)
9. [统计信息](#统计信息)
10. [图表数据](#图表数据)
11. [最近活动](#最近活动)
12. [系统设置](#系统设置)
13. [数据导出](#数据导出)
14. [通知管理](#通知管理)
15. [错误代码说明](#错误代码说明)
16. [数据验证规则](#数据验证规则)
17. [时间处理说明](#时间处理说明)
18. [接口使用示例](#接口使用示例)

---

## 基础信息
- **基础URL**: `/api`
- **认证方式**: Bearer Token (JWT)，除登录外所有接口均需
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
- 除 `POST /api/admin/login` 外，所有接口需在 Header 携带 `Authorization: Bearer <token>`
- Token 过期/无效时返回 401，error: `UNAUTHORIZED` 或 `INVALID_TOKEN`
- 管理员账户通过数据库种子脚本预先创建，不提供管理接口

---

## 管理员认证
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
- **说明**：管理员账户通过数据库种子脚本预先创建，不提供管理接口

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
- **请求体**：
  | 字段           | 类型   | 必填 | 说明         |
  |----------------|--------|------|--------------|
  | name           | string | 是   | 姓名         |
  | phone          | string | 是   | 手机号       |
  | cardType       | string | 是   | 卡类型       |
  | remainingSoups | number | 是   | 剩余汤品次数 |
- **响应**：
  | 字段           | 类型   | 说明         |
  |----------------|--------|--------------|
  | id             | number | 会员ID       |
  | name           | string | 姓名         |
  | phone          | string | 手机号       |
  | cardNumber     | string | 卡号         |
  | cardType       | string | 卡类型       |
  | issueDate      | string | 发卡日期     |
  | remainingSoups | number | 剩余汤品次数 |

### 3. 获取会员详情
- **URL**: `GET /api/memberships/{id}`
- **参数**：
  | 参数 | 类型   | 必填 | 说明       |
  |------|--------|------|------------|
  | id   | number | 是   | 会员ID     |
- **响应**：
  | 字段           | 类型   | 说明         |
  |----------------|--------|--------------|
  | id             | number | 会员ID       |
  | name           | string | 姓名         |
  | phone          | string | 手机号       |
  | cardNumber     | string | 卡号         |
  | cardType       | string | 卡类型       |
  | issueDate      | string | 发卡日期     |
  | remainingSoups | number | 剩余汤品次数 |

### 4. 更新会员
- **URL**: `PUT /api/memberships/{id}`
- **参数**：
  | 参数 | 类型   | 必填 | 说明       |
  |------|--------|------|------------|
  | id   | number | 是   | 会员ID     |
- **请求体**：
  | 字段           | 类型   | 必填 | 说明         |
  |----------------|--------|------|--------------|
  | name           | string | 否   | 姓名         |
  | phone          | string | 否   | 手机号       |
  | cardType       | string | 否   | 卡类型       |
  | remainingSoups | number | 否   | 剩余汤品次数 |
- **响应**：
  | 字段           | 类型   | 说明         |
  |----------------|--------|--------------|
  | id             | number | 会员ID       |
  | name           | string | 姓名         |
  | phone          | string | 手机号       |
  | cardNumber     | string | 卡号         |
  | cardType       | string | 卡类型       |
  | issueDate      | string | 发卡日期     |
  | remainingSoups | number | 剩余汤品次数 |

### 5. 删除会员
- **URL**: `DELETE /api/memberships/{id}`
- **参数**：
  | 参数 | 类型   | 必填 | 说明       |
  |------|--------|------|------------|
  | id   | number | 是   | 会员ID     |
- **响应**：
  | 字段     | 类型   | 说明         |
  |----------|--------|--------------|
  | success  | boolean| 删除是否成功 |
  | message  | string | 操作结果描述 |

### 6. 会员统计
- **URL**: `GET /api/memberships/stats`
- **响应**：
  | 字段         | 类型   | 说明         |
  |--------------|--------|--------------|
  | total        | number | 总会员数     |
  | active       | number | 活跃会员数（剩余>0）|
  | inactive     | number | 待续费会员数（剩余=0）|
  | cardTypeCount| number | 卡类型种类数 |

### 7. 会员搜索（分页）
- **URL**: `GET /api/search?q=关键词&type=members&page=1&pageSize=10`
- **参数**：
  | 参数     | 类型   | 必填 | 说明         |
  |----------|--------|------|--------------|
  | q        | string | 是   | 搜索关键词   |
  | type     | string | 是   | 搜索类型，固定为"members" |
  | page     | number | 否   | 页码，默认1  |
  | pageSize | number | 否   | 每页数量，默认10 |
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
  | data   | array  | 汤品对象数组 |
- **汤品对象字段**：
  | 字段   | 类型   | 说明         |
  |--------|--------|--------------|
  | id     | number | 汤品ID       |
  | name   | string | 汤品名称     |
  | type   | string | 汤品类型     |

### 2. 创建汤品
- **URL**: `POST /api/soup`
- **请求体**：
  | 字段   | 类型   | 必填 | 说明         |
  |--------|--------|------|--------------|
  | name   | string | 是   | 汤品名称     |
  | type   | string | 是   | 汤品类型     |
- **响应**：
  | 字段   | 类型   | 说明         |
  |--------|--------|--------------|
  | id     | number | 汤品ID       |
  | name   | string | 汤品名称     |
  | type   | string | 汤品类型     |

### 3. 获取汤品详情
- **URL**: `GET /api/soup/{id}`
- **参数**：
  | 参数 | 类型   | 必填 | 说明       |
  |------|--------|------|------------|
  | id   | number | 是   | 汤品ID     |
- **响应**：
  | 字段   | 类型   | 说明         |
  |--------|--------|--------------|
  | id     | number | 汤品ID       |
  | name   | string | 汤品名称     |
  | type   | string | 汤品类型     |

### 4. 更新汤品
- **URL**: `PUT /api/soup/{id}`
- **参数**：
  | 参数 | 类型   | 必填 | 说明       |
  |------|--------|------|------------|
  | id   | number | 是   | 汤品ID     |
- **请求体**：
  | 字段   | 类型   | 必填 | 说明         |
  |--------|--------|------|--------------|
  | name   | string | 否   | 汤品名称     |
  | type   | string | 否   | 汤品类型     |
- **响应**：
  | 字段   | 类型   | 说明         |
  |--------|--------|--------------|
  | id     | number | 汤品ID       |
  | name   | string | 汤品名称     |
  | type   | string | 汤品类型     |

### 5. 删除汤品
- **URL**: `DELETE /api/soup/{id}`
- **参数**：
  | 参数 | 类型   | 必填 | 说明       |
  |------|--------|------|------------|
  | id   | number | 是   | 汤品ID     |
- **响应**：
  | 字段     | 类型   | 说明         |
  |----------|--------|--------------|
  | success  | boolean| 删除是否成功 |
  | message  | string | 操作结果描述 |
- **业务规则**：如有关联喝汤记录则禁止删除

---

## 喝汤记录管理
### 1. 获取喝汤记录列表（分页）
- **URL**: `GET /api/soup-record`
- **参数**：
  | 参数         | 类型   | 必填 | 说明         |
  |--------------|--------|------|--------------|
  | page         | number | 否   | 页码，默认1  |
  | pageSize     | number | 否   | 每页数量，默认10 |
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
  | drinkTime    | string | 喝汤时间     |
  | membershipId | number | 会员ID       |
  | soupId       | number | 汤品ID       |
  | membership   | object | 会员信息     |
  | soup         | object | 汤品信息     |

### 2. 创建喝汤记录
- **URL**: `POST /api/soup-record`
- **请求体**：
  | 字段         | 类型   | 必填 | 说明         |
  |--------------|--------|------|--------------|
  | membershipId | number | 是   | 会员ID       |
  | soupId       | number | 是   | 汤品ID       |
  | drinkTime    | string | 否   | 喝汤时间，默认当前时间 |
- **响应**：
  | 字段         | 类型   | 说明         |
  |--------------|--------|--------------|
  | id           | number | 记录ID       |
  | drinkTime    | string | 喝汤时间     |
  | membership   | object | 会员信息     |
  | soup         | object | 汤品信息     |

### 3. 获取喝汤记录详情
- **URL**: `GET /api/soup-record/{id}`
- **参数**：
  | 参数 | 类型   | 必填 | 说明       |
  |------|--------|------|------------|
  | id   | number | 是   | 记录ID     |
- **响应**：
  | 字段         | 类型   | 说明         |
  |--------------|--------|--------------|
  | id           | number | 记录ID       |
  | drinkTime    | string | 喝汤时间     |
  | membership   | object | 会员信息     |
  | soup         | object | 汤品信息     |

### 4. 更新喝汤记录
- **URL**: `PUT /api/soup-record/{id}`
- **参数**：
  | 参数 | 类型   | 必填 | 说明       |
  |------|--------|------|------------|
  | id   | number | 是   | 记录ID     |
- **请求体**：
  | 字段         | 类型   | 必填 | 说明         |
  |--------------|--------|------|--------------|
  | soupId       | number | 否   | 汤品ID       |
  | drinkTime    | string | 否   | 喝汤时间     |
- **响应**：
  | 字段         | 类型   | 说明         |
  |--------------|--------|--------------|
  | id           | number | 记录ID       |
  | drinkTime    | string | 喝汤时间     |
  | membershipId | number | 会员ID       |
  | soupId       | number | 汤品ID       |
  | membership   | object | 会员信息     |
  | soup         | object | 汤品信息     |

### 5. 删除喝汤记录
- **URL**: `DELETE /api/soup-record/{id}`
- **参数**：
  | 参数 | 类型   | 必填 | 说明       |
  |------|--------|------|------------|
  | id   | number | 是   | 记录ID     |
- **响应**：
  | 字段     | 类型   | 说明         |
  |----------|--------|--------------|
  | success  | boolean| 删除是否成功 |
  | message  | string | 操作结果描述 |

### 6. 喝汤记录统计
- **URL**: `GET /api/soup-records/stats`
- **响应**：
  | 字段         | 类型   | 说明         |
  |--------------|--------|--------------|
  | total        | number | 总记录数     |
  | today        | number | 今日记录数   |
  | week         | number | 本周记录数   |
  | uniqueMembers| number | 参与会员数   |

### 7. 喝汤记录搜索（分页）
- **URL**: `GET /api/soup-records/search`
- **参数**：
  | 参数     | 类型   | 必填 | 说明         |
  |----------|--------|------|--------------|
  | q        | string | 是   | 搜索关键词   |
  | page     | number | 否   | 页码，默认1  |
  | pageSize | number | 否   | 每页数量，默认10 |
- **响应**：
  | 字段     | 类型   | 说明         |
  |----------|--------|--------------|
  | records  | array  | 匹配记录数组 |
  | total    | number | 匹配总数     |
  | page     | number | 当前页码     |
  | pageSize | number | 每页数量     |
- **业务规则**：创建时自动扣减会员剩余次数，校验剩余次数充足，所有操作需事务保证一致性

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
### 1. 仪表盘总览统计
- **URL**: `GET /api/stats`
- **响应**：
  | 字段             | 类型   | 说明         |
  |------------------|--------|--------------|
  | memberCount      | number | 总会员数     |
  | todayNewMembers  | number | 今日新增会员数 |
  | soupCount        | number | 总汤品数     |
  | todaySoupRecords | number | 今日喝汤次数 |
  | soupRecordCount  | number | 总喝汤记录数 |
  | adminCount       | number | 总管理员数   |

---

## 图表数据
### 1. 获取图表数据
- **URL**: `GET /api/charts`
- **参数**：
  | 参数 | 类型   | 必填 | 说明         |
  |------|--------|------|--------------|
  | type | string | 否   | 图表类型，不传则返回所有数据 |
- **图表类型**：
  - `memberGrowth`: 会员增长趋势
  - `dailyRecords`: 每日喝汤记录
  - `memberActivity`: 会员分布
  - `cardTypeDistribution`: 卡类型分布
  - `soupConsumption`: 汤品消费统计
- **响应**：
  | 字段                 | 类型   | 说明         |
  |----------------------|--------|--------------|
  | memberGrowth         | array  | 会员增长趋势数据 |
  | dailyRecords         | array  | 每日喝汤记录数据 |
  | memberActivity       | array  | 会员分布数据 |
  | cardTypeDistribution | array  | 卡类型分布数据 |
  | soupConsumption      | array  | 汤品消费统计数据 |

---

## 最近活动
### 1. 获取最近活动
- **URL**: `GET /api/recent`
- **参数**：
  | 参数     | 类型   | 必填 | 说明         |
  |----------|--------|------|--------------|
  | limit    | number | 否   | 限制数量，默认10 |
  | type     | string | 否   | 活动类型，默认all |
  | page     | number | 否   | 页码，默认1  |
- **响应**：
  | 字段     | 类型   | 说明         |
  |----------|--------|--------------|
  | data     | array  | 活动数组     |
  | total    | number | 总数         |
  | page     | number | 当前页码     |
  | pageSize | number | 每页数量     |
- **活动对象字段**：
  | 字段         | 类型   | 说明         |
  |--------------|--------|--------------|
  | id           | number | 活动ID       |
  | type         | string | 活动类型     |
  | title        | string | 活动标题     |
  | description  | string | 活动描述     |
  | timestamp    | string | 活动时间     |
  | relatedId    | number | 关联ID       |
  | relatedType  | string | 关联类型     |
  | metadata     | object | 元数据       |

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

## 接口使用示例
### 登录获取Token
```bash
curl -X POST http://localhost:3000/api/admin/login \
  -H "Content-Type: application/json" \
  -d '{"phone":"13800138000","password":"123456"}'
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
    "cardType": "1000卡",
    "remainingSoups": 40
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
### 获取图表数据
```bash
curl -X GET "http://localhost:3000/api/charts?type=memberGrowth" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```
### 获取最近活动
```bash
curl -X GET "http://localhost:3000/api/recent?limit=10&page=1" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```
### 导出数据
```bash
curl -X GET "http://localhost:3000/api/export?type=members&format=json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
``` 