'use client';

import { useEffect, useState } from 'react';
import { getStats } from '@/services/statsService';
import type { StatsData } from '@/types/stats';
import {
  FiUsers,
  FiUserPlus,
  FiCoffee,
  FiTrendingUp,
  FiClipboard,
  FiShield,
} from 'react-icons/fi';

const CARD_CONFIG = [
  {
    label: '会员总数',
    key: 'memberCount',
    icon: <FiUsers className="w-6 h-6" />,
    color: 'from-blue-500 to-blue-700',
  },
  {
    label: '今日新增会员',
    key: 'todayNewMembers',
    icon: <FiUserPlus className="w-6 h-6" />,
    color: 'from-green-500 to-green-700',
    trend: 'up' as const,
  },
  {
    label: '汤品总数',
    key: 'soupCount',
    icon: <FiCoffee className="w-6 h-6" />,
    color: 'from-orange-500 to-orange-700',
  },
  {
    label: '今日喝汤次数',
    key: 'todaySoupRecords',
    icon: <FiTrendingUp className="w-6 h-6" />,
    color: 'from-purple-500 to-purple-700',
    trend: 'up' as const,
  },
  {
    label: '喝汤记录总数',
    key: 'soupRecordCount',
    icon: <FiClipboard className="w-6 h-6" />,
    color: 'from-indigo-500 to-indigo-700',
  },
  {
    label: '管理员数',
    key: 'adminCount',
    icon: <FiShield className="w-6 h-6" />,
    color: 'from-gray-500 to-gray-700',
  },
] as const;

type CardKey = typeof CARD_CONFIG[number]['key'];

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
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 mb-8">
      {CARD_CONFIG.map((card) => (
        <StatCard
          key={card.key}
          label={card.label}
          value={stats[card.key as CardKey] ?? 0}
          icon={card.icon}
          color={card.color}
          trend={('trend' in card ? card.trend : undefined) as 'up' | 'down' | undefined}
        />
      ))}
    </div>
  );
}

function StatCard({
  label,
  value,
  icon,
  color,
  trend,
}: {
  label: string;
  value: number;
  icon: React.ReactNode;
  color: string;
  trend?: 'up' | 'down';
}) {
  return (
    <div
      className={`flex items-center bg-gradient-to-br ${color} rounded-xl shadow-lg p-5 md:p-6 min-h-[90px] transition-transform duration-200 hover:scale-105 hover:shadow-2xl group`}
    >
      <div className="w-12 h-12 flex items-center justify-center rounded-full bg-white/30 mr-4 group-hover:bg-white/50 transition-all">
        {icon}
      </div>
      <div className="flex-1">
        <div className="text-2xl md:text-3xl font-bold text-white drop-shadow-sm">{value}</div>
        <div className="text-xs md:text-sm text-white/80 mt-1 tracking-wide">{label}</div>
        {trend && (
          <div className={`flex items-center mt-1 text-xs ${trend === 'up' ? 'text-green-200' : 'text-red-200'}`}>
            {trend === 'up' ? '▲' : '▼'} 今日趋势
          </div>
        )}
      </div>
    </div>
  );
}