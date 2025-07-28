import type { StatsData } from '@/types/stats';
// 获取统计数据
export async function getStats(token: string): Promise<StatsData> {
  const res = await fetch('/api/stats', {
    headers: { Authorization: `Bearer ${token}` }
  });
  const data = await res.json();
  if (!data.success) throw new Error(data.message || '获取统计数据失败');
  return data.data;
}