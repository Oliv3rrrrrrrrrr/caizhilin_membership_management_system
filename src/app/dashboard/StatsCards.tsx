'use client';

import { useEffect, useState } from 'react';
import { getStats, StatsData } from '@/services/statsService';

export default function StatsCards() {
  const [stats, setStats] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      getStats(token)
        .then(setStats)
        .catch((e: any) => setError(e.message))
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  if (loading) return <div className="text-gray-400">正在加载统计数据...</div>;
  if (error) return <div className="text-red-500">{error}</div>;
  if (!stats) return null;

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 mb-8">
      <StatCard label="会员总数" value={stats.memberCount} />
      <StatCard label="今日新增会员" value={stats.todayNewMembers} />
      <StatCard label="汤品总数" value={stats.soupCount} />
      <StatCard label="今日喝汤次数" value={stats.todaySoupRecords} />
      <StatCard label="喝汤记录总数" value={stats.soupRecordCount} />
      <StatCard label="管理员数" value={stats.adminCount} />
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex flex-col items-center justify-center bg-gradient-to-br from-blue-100 to-blue-300 dark:from-blue-900 dark:to-blue-700 rounded-xl shadow p-6">
      <div className="text-3xl font-bold text-blue-700 dark:text-blue-200">{value}</div>
      <div className="text-sm text-gray-600 dark:text-gray-300 mt-2">{label}</div>
    </div>
  );
}