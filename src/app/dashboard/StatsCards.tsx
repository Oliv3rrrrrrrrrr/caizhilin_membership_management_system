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
    icon: <FiUsers className="w-7 h-7" />,
    color: 'from-blue-500 to-blue-700',
    iconBg: 'bg-blue-500',
  },
  {
    label: '今日新增会员',
    key: 'todayNewMembers',
    icon: <FiUserPlus className="w-7 h-7" />,
    color: 'from-green-500 to-green-700',
    iconBg: 'bg-green-500',
    trend: 'up' as const,
  },
  {
    label: '汤品总数',
    key: 'soupCount',
    icon: <FiCoffee className="w-7 h-7" />,
    color: 'from-orange-500 to-orange-700',
    iconBg: 'bg-orange-500',
  },
  {
    label: '今日喝汤次数',
    key: 'todaySoupRecords',
    icon: <FiTrendingUp className="w-7 h-7" />,
    color: 'from-purple-500 to-purple-700',
    iconBg: 'bg-purple-500',
    trend: 'up' as const,
  },
  {
    label: '喝汤记录总数',
    key: 'soupRecordCount',
    icon: <FiClipboard className="w-7 h-7" />,
    color: 'from-indigo-500 to-indigo-700',
    iconBg: 'bg-indigo-500',
  },
  {
    label: '管理员数',
    key: 'adminCount',
    icon: <FiShield className="w-7 h-7" />,
    color: 'from-gray-500 to-gray-700',
    iconBg: 'bg-gray-500',
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
          iconBg={card.iconBg}
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
  iconBg,
  trend,
}: {
  label: string;
  value: number;
  icon: React.ReactNode;
  color: string;
  iconBg: string;
  trend?: 'up' | 'down';
}) {
  return (
    <div
      className={`flex items-center bg-gradient-to-br ${color} rounded-2xl shadow-lg p-6 min-h-[100px] transition-transform duration-200 hover:scale-105 hover:shadow-2xl group`}
    >
      <div className={`w-14 h-14 flex items-center justify-center rounded-full ${iconBg} bg-opacity-90 mr-5 group-hover:scale-110 transition-all`}> 
        {icon}
      </div>
      <div className="flex-1">
        <div className="text-3xl md:text-4xl font-extrabold text-white drop-shadow-sm tracking-wide">{value}</div>
        <div className="text-xs md:text-sm text-white/80 mt-1 tracking-wide font-medium">{label}</div>
        {trend && (
          <div className={`flex items-center mt-1 text-xs ${trend === 'up' ? 'text-green-200' : 'text-red-200'}`}>
            {trend === 'up' ? '▲' : '▼'} 今日趋势
          </div>
        )}
      </div>
    </div>
  );
}