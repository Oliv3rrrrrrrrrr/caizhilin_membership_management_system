# 时区配置说明

## 概述

本系统支持灵活的时区配置，可以根据部署环境自动调整时间处理逻辑。系统会自动处理不同时区用户访问时的显示问题。

## 配置方法

### 1. 环境变量配置

在 `.env` 文件中添加以下配置：

```bash
# 后端时区配置
SYSTEM_TIMEZONE=Asia/Shanghai

# 前端时区配置（用于客户端时间显示）
NEXT_PUBLIC_SYSTEM_TIMEZONE=Asia/Shanghai
```

### 2. 支持的时区

系统支持所有标准的 IANA 时区标识符，常用时区包括：

- `Asia/Shanghai` - 北京时间 (UTC+8)
- `Australia/Sydney` - 悉尼时间 (UTC+10/+11)
- `America/New_York` - 纽约时间 (UTC-5/-4)
- `Europe/London` - 伦敦时间 (UTC+0/+1)
- `Asia/Tokyo` - 东京时间 (UTC+9)
- `Asia/Seoul` - 首尔时间 (UTC+9)

完整时区列表：https://en.wikipedia.org/wiki/List_of_tz_database_time_zones

## 部署场景

### 国内部署
```bash
SYSTEM_TIMEZONE=Asia/Shanghai
NEXT_PUBLIC_SYSTEM_TIMEZONE=Asia/Shanghai
```

### 澳大利亚部署
```bash
SYSTEM_TIMEZONE=Australia/Sydney
NEXT_PUBLIC_SYSTEM_TIMEZONE=Australia/Sydney
```

### 美国部署
```bash
SYSTEM_TIMEZONE=America/New_York
NEXT_PUBLIC_SYSTEM_TIMEZONE=America/New_York
```

## 时间处理逻辑

### 1. 数据库存储
- 数据库存储完整的时间信息（包含时区信息）
- 时间格式：ISO 8601 字符串（如：`2025-07-29T07:42:33+08:00`）

### 2. 前端时间生成
- 使用配置的时区生成当前时间
- 输入格式：`datetime-local`（只到分钟）
- 提交时自动添加秒数

### 3. 时间显示
- 统一显示为系统时区时间
- 显示格式：`YYYY-MM-DD HH:mm`（不显示秒数）
- 自动处理时区转换，确保全球用户看到一致的时间

### 4. 时区转换逻辑
- 如果时间已包含时区信息（如 `+08:00`），直接使用
- 否则当作UTC时间处理，然后转换为系统时区
- 支持跨时区访问，自动处理时区差异

## 注意事项

1. **环境变量一致性**：确保前后端使用相同的时区配置
2. **重启应用**：时区配置更改后需要重启应用
3. **数据库时区**：建议在数据库连接字符串中添加时区参数：`?timezone=Asia/Shanghai`
4. **生产环境**：建议在生产环境中明确设置时区配置，避免依赖默认值
5. **跨时区访问**：系统会自动处理不同时区用户访问时的显示问题

## 测试

配置完成后，可以通过以下方式测试时区是否正确：

1. **创建记录**：创建一条喝汤记录，选择当前时间
2. **查看显示**：查看记录列表，确认显示的时间与系统时区一致
3. **跨时区测试**：在不同时区的环境中测试，确认时间显示正确
4. **调试页面**：访问 `/debug-time` 页面查看详细的时间处理信息

## 故障排除

如果遇到时间显示问题：

1. 检查 `.env` 文件中的时区配置
2. 确认数据库连接字符串是否包含时区参数
3. 重启应用使配置生效
4. 使用调试页面检查时间处理逻辑 