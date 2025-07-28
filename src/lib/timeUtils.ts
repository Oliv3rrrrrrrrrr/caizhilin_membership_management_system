import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

// 扩展 dayjs 插件
dayjs.extend(utc);
dayjs.extend(timezone);

// 北京时区
const BEIJING_TIMEZONE = 'Asia/Shanghai';

/**
 * 获取当前北京时间
 */
export function getBeijingNow(): Date {
  return dayjs().tz(BEIJING_TIMEZONE).toDate();
}

/**
 * 获取北京时间当天0点
 */
export function getBeijingTodayStart(): Date {
  return dayjs().tz(BEIJING_TIMEZONE).startOf('day').toDate();
}

/**
 * 将任意时间转换为北京时间
 */
export function toBeijingTime(date: Date | string): Date {
  return dayjs(date).tz(BEIJING_TIMEZONE).toDate();
}

/**
 * 将时间格式化为北京时间字符串 (YYYY-MM-DD HH:mm:ss)
 */
export function formatBeijingTime(date: Date | string): string {
  return dayjs(date).tz(BEIJING_TIMEZONE).format('YYYY-MM-DD HH:mm:ss');
}

/**
 * 将时间格式化为北京时间日期字符串 (YYYY-MM-DD)
 */
export function formatBeijingDate(date: Date | string): string {
  return dayjs(date).tz(BEIJING_TIMEZONE).format('YYYY-MM-DD');
}

/**
 * 将时间转换为ISO字符串（保持北京时间）
 * 返回格式：2025-07-28T09:33:50.658+08:00
 */
export function toBeijingISOString(date: Date | string): string {
  return dayjs(date).tz(BEIJING_TIMEZONE).format();
}

/**
 * 验证时间字符串是否有效
 */
export function isValidTime(timeString: string): boolean {
  return dayjs(timeString).isValid();
} 