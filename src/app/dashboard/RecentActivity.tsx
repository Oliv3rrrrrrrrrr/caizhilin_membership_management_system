'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  FiUserPlus,
  FiUser,
  FiClipboard,
  FiFilter,
  FiRefreshCw,
  FiChevronDown
} from 'react-icons/fi';
import { getRecentActivities } from '@/services/recentService';
import type { RecentActivity, ActivityType } from '@/types/recent';


// 活动类型配置
const ACTIVITY_CONFIG = {
  membership: {
    icon: <FiUserPlus className="w-5 h-5" />,
    color: 'from-green-500 to-green-600',
    bgColor: 'bg-green-100 dark:bg-green-900/30',
    textColor: 'text-green-700 dark:text-green-300',
  },
  soup_record: {
    icon: <FiClipboard className="w-5 h-5" />,
    color: 'from-purple-500 to-purple-600',
    bgColor: 'bg-purple-100 dark:bg-purple-900/30',
    textColor: 'text-purple-700 dark:text-purple-300',
  },
};

// 格式化时间显示
function formatTime(timestamp: string): string {
  const date = new Date(timestamp);
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  });
}

export default function RecentActivity() {
  const router = useRouter();
  const [activities, setActivities] = useState<RecentActivity[]>([]); // 活动列表
  const [loading, setLoading] = useState(true); // 加载状态
  const [error, setError] = useState(''); // 错误信息
  const [filterType, setFilterType] = useState<ActivityType | 'all'>('all'); // 过滤类型
  const [isRefreshing, setIsRefreshing] = useState(false); // 刷新状态
  const [hasMore, setHasMore] = useState(true); // 是否还有更多数据
  const [loadingMore, setLoadingMore] = useState(false); // 加载更多状态
  const [page, setPage] = useState(1); // 当前页码
  const PAGE_SIZE = 10; // 每页显示的活动数量

  // 获取活动数据
  const fetchActivities = useCallback(async (isLoadMore: boolean = false) => {
    try {
      if (isLoadMore) {
        setLoadingMore(true);
      } else {
        setLoading(true);
      }
      setError('');

      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/login');
        return;
      }

      const currentPage = isLoadMore ? page + 1 : 1;
      const limit = PAGE_SIZE;

      const data = await getRecentActivities(token, limit, currentPage);

      if (isLoadMore) {
        setActivities(prev => [...prev, ...data]);
        setPage(currentPage);
        setHasMore(data.length === PAGE_SIZE);
      } else {
        setActivities(data);
        setPage(1);
        setHasMore(data.length === PAGE_SIZE);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : '获取活动数据失败');
    } finally {
      if (isLoadMore) {
        setLoadingMore(false);
      } else {
        setLoading(false);
      }
    }
  }, [router, page, PAGE_SIZE]);

  // 刷新数据（使用useCallback优化性能）
  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    await fetchActivities(false);
    setTimeout(() => setIsRefreshing(false), 500);
  }, [fetchActivities]);

  // 加载更多数据
  const handleLoadMore = useCallback(async () => {
    if (!loadingMore && hasMore) {
      await fetchActivities(true);
    }
  }, [loadingMore, hasMore, fetchActivities]);

  // 处理活动点击（使用useCallback优化性能）
  const handleActivityClick = useCallback((activity: RecentActivity) => {
    if (activity.relatedId && activity.relatedType) {
      switch (activity.relatedType) {
        case 'membership':
          router.push(`/memberships/${activity.relatedId}`);
          break;
        case 'soup_record':
          router.push(`/soup-records/${activity.relatedId}`);
          break;
      }
    }
  }, [router]);

  // 过滤活动（使用useMemo优化性能）
  const filteredActivities = useMemo(() => {
    return activities.filter(activity =>
      filterType === 'all' || activity.type === filterType
    );
  }, [activities, filterType]);

  useEffect(() => {
    fetchActivities(false);
  }, [fetchActivities]);

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-800 dark:text-white">最近活动</h2>
        </div>
        <div className="flex items-center justify-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-800 dark:text-white">最近活动</h2>
        </div>
        <div className="text-center text-red-500 py-8">{error}</div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-6">
      {/* 标题栏 */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 sm:mb-6 space-y-3 sm:space-y-0">
        <h2 className="text-lg sm:text-xl font-bold text-gray-800 dark:text-white">最近活动</h2>
        <div className="flex items-center space-x-2">
          {/* 筛选按钮 */}
          <div className="relative">
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as ActivityType | 'all')}
              className="appearance-none bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 pl-3 pr-8 py-2 sm:py-3 rounded-lg text-sm border-0 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
            >
              <option value="all">全部</option>
              <option value="membership">会员</option>
              <option value="soup_record">喝汤记录</option>
            </select>
            <FiFilter className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
          </div>
          {/* 刷新按钮 */}
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors disabled:opacity-50 cursor-pointer"
          >
            <FiRefreshCw className={`w-4 h-4 text-gray-500 ${isRefreshing ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* 活动列表 */}
      <div className="space-y-4">
        {filteredActivities.length === 0 ? (
          <div className="text-center text-gray-500 dark:text-gray-400 py-8">
            暂无活动记录
          </div>
        ) : (
          filteredActivities.map((activity, index) => {
            const config = ACTIVITY_CONFIG[activity.type];
            const isLast = index === filteredActivities.length - 1;

            return (
              <div key={`${activity.type}-${activity.id}-${index}`} className="relative">
                {/* 时间线 */}
                <div className="absolute left-6 top-8 w-0.5 h-full bg-gray-200 dark:bg-gray-600"></div>
                {!isLast && (
                  <div className="absolute left-6 top-8 w-0.5 h-full bg-gray-200 dark:bg-gray-600"></div>
                )}

                {/* 活动卡片 */}
                <div
                  onClick={() => handleActivityClick(activity)}
                  className={`relative ml-8 sm:ml-12 p-3 sm:p-4 rounded-lg sm:rounded-xl border border-gray-200 dark:border-gray-700 hover:shadow-md transition-all duration-200 cursor-pointer group ${activity.relatedId ? 'hover:border-blue-300 dark:hover:border-blue-600' : ''
                    }`}
                >
                  {/* 图标 */}
                  <div className={`absolute -left-4 sm:-left-6 top-3 sm:top-4 w-8 h-8 sm:w-12 sm:h-12 rounded-full bg-gradient-to-br ${config.color} flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform duration-200`}>
                    {config.icon}
                  </div>

                  {/* 内容 */}
                  <div className="ml-6 sm:ml-8">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-2 space-y-1 sm:space-y-0">
                      <h3 className="font-semibold text-gray-800 dark:text-white text-sm sm:text-base">
                        {activity.title}
                      </h3>
                      <div className="text-left sm:text-right">
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {formatTime(activity.timestamp)}
                        </div>
                      </div>
                    </div>

                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                      {activity.description}
                    </p>

                    {/* 元数据 */}
                    {activity.metadata && (
                      <div className="flex flex-wrap gap-2">
                        {activity.metadata.memberName && (
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${config.bgColor} ${config.textColor}`}>
                            <FiUser className="w-3 h-3 mr-1" />
                            {activity.metadata.memberName}
                          </span>
                        )}
                        {activity.metadata.soupName && (
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${config.bgColor} ${config.textColor}`}>
                            <FiClipboard className="w-3 h-3 mr-1" />
                            {activity.metadata.soupName}
                          </span>
                        )}
                        {activity.metadata.remainingSoups !== undefined && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300">
                            剩余: {activity.metadata.remainingSoups}次
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}

        {/* 加载更多按钮 */}
        {hasMore && (
          <div className="flex justify-center pt-4">
            <button
              onClick={handleLoadMore}
              disabled={loadingMore}
              className="flex items-center space-x-2 px-6 py-3 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 dark:disabled:bg-gray-600 text-white rounded-lg transition-colors duration-200 disabled:cursor-not-allowed cursor-pointer"
            >
              {loadingMore ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              ) : (
                <FiChevronDown className="w-4 h-4" />
              )}
              <span>{loadingMore ? '加载中...' : '加载更多'}</span>
            </button>
          </div>
        )}

        {/* 已加载全部数据提示 */}
        {!hasMore && activities.length > 0 && (
          <div className="text-center text-gray-400 dark:text-gray-500 py-4 text-sm">
            已显示全部活动记录
          </div>
        )}
      </div>
    </div>
  );
}
