import type { RecentActivity } from '@/types/recent';

// 获取最近活动
export async function getRecentActivities(token: string, limit: number = 10, page: number = 1): Promise<RecentActivity[]> {
  const res = await fetch(`/api/recent?limit=${limit}&page=${page}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  const data = await res.json();
  if (!data.success) throw new Error(data.message || '获取最近活动失败');
  return data.data;
}