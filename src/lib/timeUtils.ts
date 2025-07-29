import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

// 扩展 dayjs 插件
dayjs.extend(utc);
dayjs.extend(timezone);

// 系统时区配置 - 可以通过环境变量配置
const SYSTEM_TIMEZONE = process.env.SYSTEM_TIMEZONE || 'Asia/Shanghai';

/**
 * 获取当前系统时间
 */
export function getSystemNow(): Date {
  return dayjs().tz(SYSTEM_TIMEZONE).toDate();
}

/**
 * 获取系统时间当天0点
 */
export function getSystemTodayStart(): Date {
  return dayjs().tz(SYSTEM_TIMEZONE).startOf('day').toDate();
}

/**
 * 将任意时间转换为系统时区时间
 */
export function toSystemTime(date: Date | string): Date {
  return dayjs(date).tz(SYSTEM_TIMEZONE).toDate();
}

/**
 * 解析前端传入的时间字符串
 * 前端传入的时间应该已经是系统时区的时间
 */
export function parseSystemTime(timeString: string): Date {
  // 直接解析，假设前端传入的时间已经是系统时区
  return dayjs(timeString).toDate();
}

/**
 * 将时间格式化为系统时区字符串 (YYYY-MM-DD HH:mm)
 */
export function formatSystemTime(date: Date | string): string {
  // 如果时间已经包含时区信息（如 +08:00），直接使用
  // 否则当作UTC时间处理
  const timeStr = date.toString();
  if (timeStr.includes('+') || timeStr.includes('-') && timeStr.includes('T')) {
    // 已经包含时区信息，直接格式化
    return dayjs(date).format('YYYY-MM-DD HH:mm');
  } else {
    // 当作UTC时间处理
    const utcTime = dayjs(date).utc();
    return utcTime.tz(SYSTEM_TIMEZONE).format('YYYY-MM-DD HH:mm');
  }
}

/**
 * 将时间格式化为系统时区日期字符串 (YYYY-MM-DD)
 */
export function formatSystemDate(date: Date | string): string {
  // 如果时间已经包含时区信息（如 +08:00），直接使用
  // 否则当作UTC时间处理
  const timeStr = date.toString();
  if (timeStr.includes('+') || timeStr.includes('-') && timeStr.includes('T')) {
    // 已经包含时区信息，直接格式化
    return dayjs(date).format('YYYY-MM-DD');
  } else {
    // 当作UTC时间处理
    const utcTime = dayjs(date).utc();
    return utcTime.tz(SYSTEM_TIMEZONE).format('YYYY-MM-DD');
  }
}

/**
 * 将时间转换为ISO字符串（保持系统时区）
 */
export function toSystemISOString(date: Date | string): string {
  // 强制将时间当作UTC时间处理，然后转换为系统时区
  const utcTime = dayjs(date).utc();
  return utcTime.tz(SYSTEM_TIMEZONE).format();
}

/**
 * 验证时间字符串是否有效
 */
export function isValidTime(timeString: string): boolean {
  return dayjs(timeString).isValid();
}

// 为了向后兼容，保留原有的北京时间函数
// 这些函数现在都指向系统时区

/**
 * @deprecated 使用 getSystemNow() 替代
 */
export function getBeijingNow(): Date {
  return getSystemNow();
}

/**
 * @deprecated 使用 getSystemTodayStart() 替代
 */
export function getBeijingTodayStart(): Date {
  return getSystemTodayStart();
}

/**
 * @deprecated 使用 toSystemTime() 替代
 */
export function toBeijingTime(date: Date | string): Date {
  return toSystemTime(date);
}

/**
 * @deprecated 使用 parseSystemTime() 替代
 */
export function parseBeijingTime(timeString: string): Date {
  return parseSystemTime(timeString);
}

/**
 * @deprecated 使用 formatSystemTime() 替代
 */
export function formatBeijingTime(date: Date | string): string {
  return formatSystemTime(date);
}

/**
 * @deprecated 使用 formatSystemDate() 替代
 */
export function formatBeijingDate(date: Date | string): string {
  return formatSystemDate(date);
}

/**
 * @deprecated 使用 toSystemISOString() 替代
 */
export function toBeijingISOString(date: Date | string): string {
  return toSystemISOString(date);
} 