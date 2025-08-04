'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  FiCoffee,
  FiSearch,
  FiFilter,
  FiEdit2,
  FiTrash2,
  FiEye,
  FiRefreshCw,
  FiHome,
  FiTrendingUp,
  FiPackage,
  FiUser,
  FiCalendar,
  FiPlus,
  FiCheckCircle,
} from 'react-icons/fi';
import { getSoupRecords, deleteSoupRecord, getSoupRecordStats, searchSoupRecords } from '@/services/soupRecordService';
import { SoupRecordResponse } from '@/types/soupRecord';

import Pagination from '@/components/Pagination';

// 格式化时间显示
function formatSystemTime(timestamp: string): string {
  const date = new Date(timestamp);
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  });
}

// 格式化日期显示
function formatSystemDate(timestamp: string): string {
  const date = new Date(timestamp);
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });
}

export default function SoupRecordsPage() {
  const router = useRouter();
  const [records, setRecords] = useState<SoupRecordResponse[]>([]); // 喝汤记录列表
  const [loading, setLoading] = useState(true); // 加载状态
  const [error, setError] = useState(''); // 错误信息
  const [stats, setStats] = useState<{ total: number; today: number; week: number; uniqueMembers: number }>({ total: 0, today: 0, week: 0, uniqueMembers: 0 }); // 统计数据
  // 搜索相关
  const [searchTerm, setSearchTerm] = useState(''); // 搜索关键词
  const [isSearching, setIsSearching] = useState(false); // 是否正在搜索
  const [searchResults, setSearchResults] = useState<SoupRecordResponse[]>([]); // 搜索结果
  const [searchLoading, setSearchLoading] = useState(false); // 搜索加载状态
  const [searchError, setSearchError] = useState(''); // 搜索错误信息
  const [searchPage, setSearchPage] = useState(1); // 搜索页码
  const [searchPageSize, setSearchPageSize] = useState(10); // 搜索每页条数
  const [searchTotal, setSearchTotal] = useState(0); // 搜索总条数
  // 主列表分页
  const [page, setPage] = useState(1); // 当前页码
  const [pageSize, setPageSize] = useState(10); // 每页条数
  const [, setTotal] = useState(0); // 总条数
  // 其它筛选、排序等状态保持不变
  const [filterSoupType, setFilterSoupType] = useState(''); // 汤品类型筛选
  const [filterDateRange, setFilterDateRange] = useState(''); // 日期范围筛选
  const [showFilters, setShowFilters] = useState(false); // 是否显示筛选
  const [isRefreshing, setIsRefreshing] = useState(false); // 是否正在刷新
  const [sortField, setSortField] = useState<'drinkTime' | 'memberName' | 'soupName' | 'id'>('drinkTime'); // 排序字段
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc'); // 排序方向
  const [successMessage, setSuccessMessage] = useState(''); // 成功消息

  // 主列表分页获取
  const fetchRecords = useCallback(async (pageNum = page, size = pageSize) => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/login');
        return;
      }
      const result = await getSoupRecords(token, pageNum, size);
      setRecords(result.data);
      setTotal(result.total);
      setPage(result.page);
      setPageSize(result.pageSize);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : '获取喝汤记录失败');
    } finally {
      setLoading(false);
    }
  }, [router, page, pageSize]);

  // 统计卡片
  const fetchStats = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;
      const s = await getSoupRecordStats(token);
      setStats(s);
    } catch { }
  }, []);

  // 搜索分页获取
  const fetchSearchResults = useCallback(async (term = searchTerm, pageNum = searchPage, size = searchPageSize) => {
    if (!term.trim()) return;
    try {
      setSearchLoading(true);
      setSearchError('');
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/login');
        return;
      }
      const result = await searchSoupRecords(term, token, pageNum, size);
      setSearchResults(result.records);
      setSearchTotal(result.total);
      setSearchPage(result.page);
      setSearchPageSize(result.pageSize);
    } catch (err: unknown) {
      setSearchError(err instanceof Error ? err.message : '搜索失败');
    } finally {
      setSearchLoading(false);
    }
  }, [router, searchTerm, searchPage, searchPageSize]);

  useEffect(() => {
    fetchRecords();
    fetchStats();
  }, [page, pageSize, fetchRecords, fetchStats]);

  useEffect(() => {
    if (isSearching) {
      fetchSearchResults(searchTerm, searchPage, searchPageSize);
    }
  }, [isSearching, searchPage, searchPageSize, searchTerm, fetchSearchResults]);

  // 搜索事件
  const handleSearch = () => {
    if (!searchTerm.trim()) return;
    setIsSearching(true);
    setSearchPage(1);
    fetchSearchResults(searchTerm, 1, searchPageSize);
  };

  // 清除搜索
  const handleClearSearch = () => {
    setIsSearching(false);
    setSearchTerm('');
    setSearchResults([]);
    setSearchTotal(0);
    setSearchPage(1);
  };

  // 检查URL参数中的成功消息
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const success = urlParams.get('success');
    if (success === 'created') {
      setSuccessMessage('喝汤记录创建成功！');
      window.history.replaceState({}, '', window.location.pathname);
      setTimeout(() => setSuccessMessage(''), 3000);
    }
  }, []);

  // 刷新数据
  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchRecords();
    await fetchStats(); // 刷新统计数据
    setTimeout(() => setIsRefreshing(false), 500);
  };

  // 删除记录
  const handleDelete = async (id: number, soupName: string, memberName: string) => {
    if (!confirm(`确定要删除 "${memberName}" 的 "${soupName}" 喝汤记录吗？此操作不可恢复。`)) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/login');
        return;
      }
      await deleteSoupRecord(id, token);
      await fetchRecords(); // 重新加载列表
      await fetchStats(); // 重新加载统计
    } catch (err: unknown) {
      alert('删除失败: ' + (err instanceof Error ? err.message : '删除失败'));
    }
  };

  // 筛选记录（只受筛选影响，不受搜索影响）
  const filteredRecords = records.filter(record => {
    const matchesSoupType = !filterSoupType || record.soup.type === filterSoupType;
    let matchesDateRange = true;
    if (filterDateRange) {
      const recordDate = new Date(record.drinkTime);
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      const weekAgo = new Date(today);
      weekAgo.setDate(weekAgo.getDate() - 7);
      const monthAgo = new Date(today);
      monthAgo.setMonth(monthAgo.getMonth() - 1);

      switch (filterDateRange) {
        case 'today':
          matchesDateRange = recordDate.toDateString() === today.toDateString();
          break;
        case 'yesterday':
          matchesDateRange = recordDate.toDateString() === yesterday.toDateString();
          break;
        case 'week':
          matchesDateRange = recordDate >= weekAgo;
          break;
        case 'month':
          matchesDateRange = recordDate >= monthAgo;
          break;
      }
    }
    return matchesSoupType && matchesDateRange;
  });

  // 排序记录（主列表，只受筛选影响）
  const sortedRecords = [...filteredRecords].sort((a, b) => {
    let aValue: string | number | Date;
    let bValue: string | number | Date;

    switch (sortField) {
      case 'drinkTime':
        aValue = new Date(a.drinkTime);
        bValue = new Date(b.drinkTime);
        break;
      case 'memberName':
        aValue = a.membership.name.toLowerCase();
        bValue = b.membership.name.toLowerCase();
        break;
      case 'soupName':
        aValue = a.soup.name.toLowerCase();
        bValue = b.soup.name.toLowerCase();
        break;
      case 'id':
        aValue = a.id;
        bValue = b.id;
        break;
      default:
        aValue = new Date(a.drinkTime);
        bValue = new Date(b.drinkTime);
    }

    if (sortDirection === 'asc') {
      return aValue > bValue ? 1 : aValue < bValue ? -1 : 0;
    } else {
      return aValue < bValue ? 1 : aValue > bValue ? -1 : 0;
    }
  });

  // 处理排序
  const handleSort = (field: 'drinkTime' | 'memberName' | 'soupName' | 'id') => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // 获取所有汤品类型
  const soupTypes = [...new Set(records.map(r => r.soup.type))];

  // 统计数据
  const totalRecords = records.length;
  // const todayRecords = records.filter(r => {
  //   const recordDate = new Date(r.drinkTime);
  //   const today = new Date();
  //   return recordDate.toDateString() === today.toDateString();
  // }).length;
  // const weekRecords = records.filter(r => {
  //   const recordDate = new Date(r.drinkTime);
  //   const weekAgo = new Date();
  //   weekAgo.setDate(weekAgo.getDate() - 7);
  //   return recordDate >= weekAgo;
  // }).length;
  // const uniqueMembers = new Set(records.map(r => r.membership.id)).size;

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400 text-lg">正在加载喝汤记录...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      {/* 页面头部 */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
            <div className="flex items-center space-x-2 sm:space-x-4">
              <div className="flex items-center">
                <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center shadow-lg">
                  <FiCoffee className="text-white text-sm sm:text-base lg:text-xl" />
                </div>
                <div className="ml-2 sm:ml-3 lg:ml-4">
                  <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white">喝汤记录</h1>
                  <p className="text-xs sm:text-sm lg:text-base text-gray-600 dark:text-gray-400 mt-1">
                    管理系统中的所有喝汤记录 • 共 {totalRecords} 条记录
                  </p>
                </div>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-2 sm:space-y-0 sm:space-x-2 lg:space-x-3">
              <button
                onClick={() => router.push('/dashboard')}
                className="px-3 sm:px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-xl flex items-center justify-center font-medium transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 cursor-pointer text-xs sm:text-sm"
              >
                <FiHome className="mr-1 sm:mr-2 text-xs sm:text-sm" />
                <span className="hidden sm:inline">返回主页</span>
                <span className="sm:hidden">主页</span>
              </button>
              <button
                onClick={() => router.push('/soup-records/new')}
                className="px-3 sm:px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white rounded-xl flex items-center justify-center font-medium transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 cursor-pointer text-xs sm:text-sm"
              >
                <FiPlus className="mr-1 sm:mr-2 text-xs sm:text-sm" />
                <span className="hidden sm:inline">新增记录</span>
                <span className="sm:hidden">新增</span>
              </button>
              <button
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="px-3 sm:px-4 py-2 bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white rounded-xl flex items-center justify-center font-medium transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer text-xs sm:text-sm"
              >
                <FiRefreshCw className={`mr-1 sm:mr-2 text-xs sm:text-sm ${isRefreshing ? 'animate-spin' : ''}`} />
                <span className="hidden sm:inline">{isRefreshing ? '刷新中...' : '刷新'}</span>
                <span className="sm:hidden">{isRefreshing ? "刷新中" : "刷新"}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
        {/* 成功消息 */}
        {successMessage && (
          <div className="mb-6 sm:mb-8 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl sm:rounded-2xl p-4 sm:p-6">
            <div className="flex items-center">
              <FiCheckCircle className="text-green-500 mr-2 sm:mr-3 text-lg sm:text-xl" />
              <p className="text-green-600 dark:text-green-400 font-medium text-sm sm:text-base">{successMessage}</p>
            </div>
          </div>
        )}

        {/* 统计卡片 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-6 border border-gray-100 dark:border-gray-700 hover:shadow-xl transition-all duration-300 transform hover:scale-105">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400">总记录数</p>
                <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white mt-1 sm:mt-2">{stats.total}</p>
              </div>
              <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center">
                <FiCoffee className="text-white text-sm sm:text-base lg:text-xl" />
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-6 border border-gray-100 dark:border-gray-700 hover:shadow-xl transition-all duration-300 transform hover:scale-105">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400">今日记录</p>
                <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-green-600 dark:text-green-400 mt-1 sm:mt-2">{stats.today}</p>
              </div>
              <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center">
                <FiTrendingUp className="text-white text-sm sm:text-base lg:text-xl" />
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-6 border border-gray-100 dark:border-gray-700 hover:shadow-xl transition-all duration-300 transform hover:scale-105">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400">本周记录</p>
                <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-blue-600 dark:text-blue-400 mt-1 sm:mt-2">{stats.week}</p>
              </div>
              <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                <FiCalendar className="text-white text-sm sm:text-base lg:text-xl" />
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-6 border border-gray-100 dark:border-gray-700 hover:shadow-xl transition-all duration-300 transform hover:scale-105">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400">参与会员</p>
                <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-purple-600 dark:text-purple-400 mt-1 sm:mt-2">{stats.uniqueMembers}</p>
              </div>
              <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center">
                <FiUser className="text-white text-sm sm:text-base lg:text-xl" />
              </div>
            </div>
          </div>
        </div>

        {/* 搜索栏和筛选 */}
        <div className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-6 mb-6 sm:mb-8 border border-gray-100 dark:border-gray-700">
          <div className="flex flex-col lg:flex-row gap-3 sm:gap-4">
            <div className="flex-1">
              <div className="relative">
                <FiSearch className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm sm:text-base lg:text-lg" />
                <input
                  type="text"
                  placeholder="搜索会员姓名、手机号、汤品名称或类型..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleSearch()}
                  className="w-full pl-10 sm:pl-12 pr-20 sm:pr-24 py-2 sm:py-3 lg:py-4 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-4 focus:ring-orange-500/20 focus:border-orange-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm sm:text-base lg:text-lg transition-all duration-200"
                />
                <div className="absolute right-2 sm:right-4 top-1/2 transform -translate-y-1/2 flex space-x-1 sm:space-x-2">
                  <button
                    onClick={handleSearch}
                    className="px-2 sm:px-3 lg:px-4 py-1 sm:py-2 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white rounded-lg font-medium shadow-md hover:shadow-lg transition-all duration-200 text-xs sm:text-sm cursor-pointer"
                  >
                    <span className="hidden sm:inline">搜索</span>
                    <span className="sm:hidden">搜</span>
                  </button>
                  <button
                    onClick={handleClearSearch}
                    disabled={!isSearching && !searchTerm}
                    className="px-2 sm:px-3 lg:px-4 py-1 sm:py-2 bg-gradient-to-r from-gray-300 to-gray-400 hover:from-gray-400 hover:to-gray-500 text-gray-700 rounded-lg font-medium shadow-md hover:shadow-lg transition-all duration-200 text-xs sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                  >
                    <span className="hidden sm:inline">清除</span>
                    <span className="sm:hidden">清</span>
                  </button>
                </div>
              </div>
            </div>
            {/* 筛选按钮 */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`px-4 sm:px-6 py-2 sm:py-3 lg:py-4 rounded-xl flex items-center justify-center transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 cursor-pointer text-xs sm:text-sm ${showFilters
                ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white'
                : 'bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600 text-gray-700 dark:text-gray-300'
                }`}
            >
              <FiFilter className="mr-1 sm:mr-2 text-xs sm:text-sm" />
              <span className="hidden sm:inline">筛选</span>
              <span className="sm:hidden">筛</span>
            </button>
          </div>

          {/* 筛选选项 */}
          {showFilters && (
            <div className="mt-4 sm:mt-6 pt-4 sm:pt-6 border-t border-gray-200 dark:border-gray-700 animate-fadeIn">
              <div className="flex flex-col sm:flex-row flex-wrap gap-3 sm:gap-4">
                <div className="flex-1 min-w-[200px]">
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 sm:mb-2">
                    汤品类型
                  </label>
                  <select
                    value={filterSoupType}
                    onChange={(e) => setFilterSoupType(e.target.value)}
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-4 focus:ring-orange-500/20 focus:border-orange-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-all duration-200 cursor-pointer text-sm sm:text-base"
                  >
                    <option value="">全部类型</option>
                    {soupTypes.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>
                <div className="flex-1 min-w-[200px]">
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 sm:mb-2">
                    时间范围
                  </label>
                  <select
                    value={filterDateRange}
                    onChange={(e) => setFilterDateRange(e.target.value)}
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-4 focus:ring-orange-500/20 focus:border-orange-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-all duration-200 cursor-pointer text-sm sm:text-base"
                  >
                    <option value="">全部时间</option>
                    <option value="today">今天</option>
                    <option value="yesterday">昨天</option>
                    <option value="week">最近7天</option>
                    <option value="month">最近30天</option>
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 搜索结果区（独立于主列表） */}
        {isSearching && (
          <div className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-6 mb-6 sm:mb-8 border border-gray-100 dark:border-gray-700 min-h-[200px] sm:min-h-[300px]">
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white flex items-center">
                <FiSearch className="mr-2 sm:mr-3 text-orange-600 text-sm sm:text-base" />
                搜索结果
              </h2>
              <span className="bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200 px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium">
                {searchTotal} 条记录
              </span>
            </div>
            {searchLoading ? (
              <div className="text-center py-8 sm:py-12">
                <div className="animate-spin rounded-full h-8 w-8 sm:h-12 sm:w-12 border-b-2 border-orange-600 mx-auto mb-3 sm:mb-4"></div>
                <p className="text-gray-600 dark:text-gray-400 text-sm sm:text-base lg:text-lg">正在搜索记录...</p>
              </div>
            ) : searchError ? (
              <div className="p-4 sm:p-6 bg-red-50 dark:bg-red-900/20 border-b border-red-200 dark:border-red-800">
                <div className="flex items-center">
                  <div className="w-4 h-4 sm:w-5 sm:h-5 bg-red-500 rounded-full mr-2 sm:mr-3"></div>
                  <p className="text-red-600 dark:text-red-400 font-medium text-sm sm:text-base">{searchError}</p>
                </div>
              </div>
            ) : searchResults.length === 0 ? (
              <div className="p-8 sm:p-12 text-center">
                <div className="w-16 h-16 sm:w-24 sm:h-24 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
                  <FiCoffee className="text-gray-400 text-2xl sm:text-3xl" />
                </div>
                <h3 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  没有找到匹配的记录
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6 sm:mb-8 max-w-md mx-auto text-sm sm:text-base">
                  请尝试调整搜索条件或筛选条件
                </p>
                <button
                  onClick={handleClearSearch}
                  className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-xl font-medium transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 cursor-pointer text-sm sm:text-base"
                >
                  清除搜索
                </button>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  {/* 桌面端表格 */}
                  <div className="hidden lg:block">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                      <thead className="bg-gray-50 dark:bg-gray-700">
                        <tr>
                          <th className="px-4 sm:px-6 lg:px-8 py-3 sm:py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">会员信息</th>
                          <th className="px-4 sm:px-6 lg:px-8 py-3 sm:py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">汤品信息</th>
                          <th className="px-4 sm:px-6 lg:px-8 py-3 sm:py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">喝汤时间</th>
                          <th className="px-4 sm:px-6 lg:px-8 py-3 sm:py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">记录ID</th>
                          <th className="px-4 sm:px-6 lg:px-8 py-3 sm:py-4 text-right text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">操作</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                        {searchResults.map((record, index) => (
                          <tr
                            key={record.id}
                            className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200 transform hover:scale-[1.01]"
                            style={{ animationDelay: `${index * 50}ms` }}
                          >
                            <td className="px-4 sm:px-6 lg:px-8 py-4 sm:py-6 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center mr-3 sm:mr-4">
                                  <span className="text-white font-semibold text-xs sm:text-sm">
                                    {record.membership.name.charAt(0)}
                                  </span>
                                </div>
                                <div>
                                  <div className="text-sm sm:text-base lg:text-lg font-semibold text-gray-900 dark:text-white">
                                    {record.membership.name}
                                  </div>
                                  <div className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                                    {record.membership.phone}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="px-4 sm:px-6 lg:px-8 py-4 sm:py-6 whitespace-nowrap">
                              <div>
                                <div className="text-sm sm:text-base lg:text-lg font-semibold text-gray-900 dark:text-white">
                                  {record.soup.name}
                                </div>
                                <span className="inline-flex items-center px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium bg-gradient-to-r from-orange-100 to-orange-200 text-orange-800 dark:from-orange-900 dark:to-orange-800 dark:text-orange-200">
                                  {record.soup.type}
                                </span>
                              </div>
                            </td>
                            <td className="px-4 sm:px-6 lg:px-8 py-4 sm:py-6 whitespace-nowrap">
                              <div>
                                <div className="text-sm sm:text-base lg:text-lg font-semibold text-gray-900 dark:text-white">
                                  {formatSystemTime(record.drinkTime)}
                                </div>
                                <div className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                                  {formatSystemDate(record.drinkTime)}
                                </div>
                              </div>
                            </td>
                            <td className="px-4 sm:px-6 lg:px-8 py-4 sm:py-6 whitespace-nowrap">
                              <span className="inline-flex items-center px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium bg-gradient-to-r from-gray-100 to-gray-200 text-gray-800 dark:from-gray-700 dark:to-gray-600 dark:text-gray-200">
                                #{record.id}
                              </span>
                            </td>
                            <td className="px-4 sm:px-6 lg:px-8 py-4 sm:py-6 whitespace-nowrap text-right text-xs sm:text-sm font-medium">
                              <div className="flex items-center justify-end space-x-2 sm:space-x-3">
                                <button
                                  onClick={() => router.push(`/soup-records/${record.id}`)}
                                  className="p-1.5 sm:p-2 text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-all duration-200 cursor-pointer"
                                  title="查看详情"
                                >
                                  <FiEye className="h-4 w-4 sm:h-5 sm:w-5" />
                                </button>
                                <button
                                  onClick={() => router.push(`/soup-records/${record.id}/edit`)}
                                  className="p-1.5 sm:p-2 text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg transition-all duration-200 cursor-pointer"
                                  title="编辑"
                                >
                                  <FiEdit2 className="h-4 w-4 sm:h-5 sm:w-5" />
                                </button>
                                <button
                                  onClick={() => handleDelete(record.id, record.soup.name, record.membership.name)}
                                  className="p-1.5 sm:p-2 text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all duration-200 cursor-pointer"
                                  title="删除"
                                >
                                  <FiTrash2 className="h-4 w-4 sm:h-5 sm:w-5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* 移动端卡片列表 */}
                  <div className="lg:hidden space-y-3 sm:space-y-4">
                    {searchResults.map((record, index) => (
                      <div
                        key={record.id}
                        className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4 sm:p-6 border border-gray-200 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-600 transition-all duration-200"
                        style={{ animationDelay: `${index * 50}ms` }}
                      >
                        <div className="flex items-center justify-between mb-3 sm:mb-4">
                          <div className="flex items-center">
                            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center mr-3 sm:mr-4">
                              <span className="text-white font-semibold text-sm sm:text-base">
                                {record.membership.name.charAt(0)}
                              </span>
                            </div>
                            <div>
                              <div className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">
                                {record.membership.name}
                              </div>
                              <div className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                                {record.membership.phone}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => router.push(`/soup-records/${record.id}`)}
                              className="p-2 text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-all duration-200 cursor-pointer"
                              title="查看详情"
                            >
                              <FiEye className="h-4 w-4 sm:h-5 sm:w-5" />
                            </button>
                            <button
                              onClick={() => router.push(`/soup-records/${record.id}/edit`)}
                              className="p-2 text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg transition-all duration-200 cursor-pointer"
                              title="编辑"
                            >
                              <FiEdit2 className="h-4 w-4 sm:h-5 sm:w-5" />
                            </button>
                            <button
                              onClick={() => handleDelete(record.id, record.soup.name, record.membership.name)}
                              className="p-2 text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all duration-200 cursor-pointer"
                              title="删除"
                            >
                              <FiTrash2 className="h-4 w-4 sm:h-5 sm:w-5" />
                            </button>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-3 sm:gap-4">
                          <div>
                            <div className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mb-1">汤品</div>
                            <div className="text-sm sm:text-base font-medium text-gray-900 dark:text-white">
                              {record.soup.name}
                            </div>
                            <span className="inline-flex items-center px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium bg-gradient-to-r from-orange-100 to-orange-200 text-orange-800 dark:from-orange-900 dark:to-orange-800 dark:text-orange-200">
                              {record.soup.type}
                            </span>
                          </div>
                          <div>
                            <div className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mb-1">喝汤时间</div>
                            <div className="text-sm sm:text-base font-medium text-gray-900 dark:text-white">
                              {formatSystemTime(record.drinkTime)}
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                              {formatSystemDate(record.drinkTime)}
                            </div>
                          </div>
                          <div className="col-span-2">
                            <div className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mb-1">记录ID</div>
                            <span className="inline-flex items-center px-3 sm:px-4 py-1 sm:py-2 rounded-full text-xs sm:text-sm font-medium bg-gradient-to-r from-gray-100 to-gray-200 text-gray-800 dark:from-gray-700 dark:to-gray-600 dark:text-gray-200">
                              #{record.id}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                {/* 仅当搜索结果大于10条时显示分页 */}
                {searchTotal > 10 && (
                  <div className="w-full flex justify-center items-center py-2 sm:py-4 text-xs sm:text-sm">
                    <Pagination
                      total={searchTotal}
                      page={searchPage}
                      pageSize={searchPageSize}
                      onPageChange={p => fetchSearchResults(searchTerm, p, searchPageSize)}
                      onPageSizeChange={s => fetchSearchResults(searchTerm, 1, s)}
                    />
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* 主列表始终渲染 */}
        <div className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl shadow-lg overflow-hidden border border-gray-100 dark:border-gray-700">
          <div className="px-4 sm:px-6 lg:px-8 py-4 sm:py-6 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-600">
            <div className="flex items-center justify-between">
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white flex items-center">
                <FiPackage className="mr-2 sm:mr-3 text-orange-600 text-sm sm:text-base" />
                喝汤记录列表
              </h2>
              <span className="bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200 px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium">
                {sortedRecords.length} 条记录
              </span>
            </div>
          </div>
          {error && (
            <div className="p-4 sm:p-6 bg-red-50 dark:bg-red-900/20 border-b border-red-200 dark:border-red-800">
              <div className="flex items-center">
                <div className="w-4 h-4 sm:w-5 sm:h-5 bg-red-500 rounded-full mr-2 sm:mr-3"></div>
                <p className="text-red-600 dark:text-red-400 font-medium text-sm sm:text-base">{error}</p>
              </div>
            </div>
          )}

          {filteredRecords.length === 0 ? (
            <div className="p-8 sm:p-12 text-center">
              <div className="w-16 h-16 sm:w-24 sm:h-24 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
                <FiCoffee className="text-gray-400 text-2xl sm:text-3xl" />
              </div>
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white mb-2">
                {filterSoupType || filterDateRange ? '没有找到匹配的记录' : '暂无喝汤记录'}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6 sm:mb-8 max-w-md mx-auto text-sm sm:text-base">
                {filterSoupType || filterDateRange
                  ? '请尝试调整筛选条件'
                  : '开始添加第一条喝汤记录，记录会员的喝汤情况'
                }
              </p>
              {!filterSoupType && !filterDateRange && (
                <button
                  onClick={() => router.push('/soup-records/new')}
                  className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-xl font-medium transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 cursor-pointer text-sm sm:text-base"
                >
                  <FiUser className="inline mr-2 text-sm sm:text-base" />
                  新增喝汤记录
                </button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              {/* 桌面端表格 */}
              <div className="hidden lg:block">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th
                        className="px-4 sm:px-6 lg:px-8 py-3 sm:py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                        onClick={() => handleSort('memberName')}
                      >
                        <div className="flex items-center">
                          会员信息
                          {sortField === 'memberName' && (
                            <span className="ml-2 text-orange-500">
                              {sortDirection === 'asc' ? '↑' : '↓'}
                            </span>
                          )}
                        </div>
                      </th>
                      <th
                        className="px-4 sm:px-6 lg:px-8 py-3 sm:py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                        onClick={() => handleSort('soupName')}
                      >
                        <div className="flex items-center">
                          汤品信息
                          {sortField === 'soupName' && (
                            <span className="ml-2 text-orange-500">
                              {sortDirection === 'asc' ? '↑' : '↓'}
                            </span>
                          )}
                        </div>
                      </th>
                      <th
                        className="px-4 sm:px-6 lg:px-8 py-3 sm:py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                        onClick={() => handleSort('drinkTime')}
                      >
                        <div className="flex items-center">
                          喝汤时间
                          {sortField === 'drinkTime' && (
                            <span className="ml-2 text-orange-500">
                              {sortDirection === 'asc' ? '↑' : '↓'}
                            </span>
                          )}
                        </div>
                      </th>
                      <th
                        className="px-4 sm:px-6 lg:px-8 py-3 sm:py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                        onClick={() => handleSort('id')}
                      >
                        <div className="flex items-center">
                          记录ID
                          {sortField === 'id' && (
                            <span className="ml-2 text-orange-500">
                              {sortDirection === 'asc' ? '↑' : '↓'}
                            </span>
                          )}
                        </div>
                      </th>
                      <th className="px-4 sm:px-6 lg:px-8 py-3 sm:py-4 text-right text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                        操作
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {sortedRecords.slice((page - 1) * pageSize, page * pageSize).map((record, index) => (
                      <tr
                        key={record.id}
                        className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200 transform hover:scale-[1.01]"
                        style={{ animationDelay: `${index * 50}ms` }}
                      >
                        <td className="px-4 sm:px-6 lg:px-8 py-4 sm:py-6 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center mr-3 sm:mr-4">
                              <span className="text-white font-semibold text-xs sm:text-sm">
                                {record.membership.name.charAt(0)}
                              </span>
                            </div>
                            <div>
                              <div className="text-sm sm:text-base lg:text-lg font-semibold text-gray-900 dark:text-white">
                                {record.membership.name}
                              </div>
                              <div className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                                {record.membership.phone}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 sm:px-6 lg:px-8 py-4 sm:py-6 whitespace-nowrap">
                          <div>
                            <div className="text-sm sm:text-base lg:text-lg font-semibold text-gray-900 dark:text-white">
                              {record.soup.name}
                            </div>
                            <span className="inline-flex items-center px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium bg-gradient-to-r from-orange-100 to-orange-200 text-orange-800 dark:from-orange-900 dark:to-orange-800 dark:text-orange-200">
                              {record.soup.type}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 sm:px-6 lg:px-8 py-4 sm:py-6 whitespace-nowrap">
                          <div>
                            <div className="text-sm sm:text-base lg:text-lg font-semibold text-gray-900 dark:text-white">
                              {formatSystemTime(record.drinkTime)}
                            </div>
                            <div className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                              {formatSystemDate(record.drinkTime)}
                            </div>
                          </div>
                        </td>
                        <td className="px-4 sm:px-6 lg:px-8 py-4 sm:py-6 whitespace-nowrap">
                          <span className="inline-flex items-center px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium bg-gradient-to-r from-gray-100 to-gray-200 text-gray-800 dark:from-gray-700 dark:to-gray-600 dark:text-gray-200">
                            #{record.id}
                          </span>
                        </td>
                        <td className="px-4 sm:px-6 lg:px-8 py-4 sm:py-6 whitespace-nowrap text-right text-xs sm:text-sm font-medium">
                          <div className="flex items-center justify-end space-x-2 sm:space-x-3">
                            <button
                              onClick={() => router.push(`/soup-records/${record.id}`)}
                              className="p-1.5 sm:p-2 text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-all duration-200 cursor-pointer"
                              title="查看详情"
                            >
                              <FiEye className="h-4 w-4 sm:h-5 sm:w-5" />
                            </button>
                            <button
                              onClick={() => router.push(`/soup-records/${record.id}/edit`)}
                              className="p-1.5 sm:p-2 text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg transition-all duration-200 cursor-pointer"
                              title="编辑"
                            >
                              <FiEdit2 className="h-4 w-4 sm:h-5 sm:w-5" />
                            </button>
                            <button
                              onClick={() => handleDelete(record.id, record.soup.name, record.membership.name)}
                              className="p-1.5 sm:p-2 text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all duration-200 cursor-pointer"
                              title="删除"
                            >
                              <FiTrash2 className="h-4 w-4 sm:h-5 sm:w-5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* 移动端卡片列表 */}
              <div className="lg:hidden space-y-3 sm:space-y-4 p-4 sm:p-6">
                {sortedRecords.slice((page - 1) * pageSize, page * pageSize).map((record, index) => (
                  <div
                    key={record.id}
                    className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4 sm:p-6 border border-gray-200 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-600 transition-all duration-200"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <div className="flex items-center justify-between mb-3 sm:mb-4">
                      <div className="flex items-center">
                        <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center mr-3 sm:mr-4">
                          <span className="text-white font-semibold text-sm sm:text-base">
                            {record.membership.name.charAt(0)}
                          </span>
                        </div>
                        <div>
                          <div className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">
                            {record.membership.name}
                          </div>
                          <div className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                            {record.membership.phone}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => router.push(`/soup-records/${record.id}`)}
                          className="p-2 text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-all duration-200 cursor-pointer"
                          title="查看详情"
                        >
                          <FiEye className="h-4 w-4 sm:h-5 sm:w-5" />
                        </button>
                        <button
                          onClick={() => router.push(`/soup-records/${record.id}/edit`)}
                          className="p-2 text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg transition-all duration-200 cursor-pointer"
                          title="编辑"
                        >
                          <FiEdit2 className="h-4 w-4 sm:h-5 sm:w-5" />
                        </button>
                        <button
                          onClick={() => handleDelete(record.id, record.soup.name, record.membership.name)}
                          className="p-2 text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all duration-200 cursor-pointer"
                          title="删除"
                        >
                          <FiTrash2 className="h-4 w-4 sm:h-5 sm:w-5" />
                        </button>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3 sm:gap-4">
                      <div>
                        <div className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mb-1">汤品</div>
                        <div className="text-sm sm:text-base font-medium text-gray-900 dark:text-white">
                          {record.soup.name}
                        </div>
                        <span className="inline-flex items-center px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium bg-gradient-to-r from-orange-100 to-orange-200 text-orange-800 dark:from-orange-900 dark:to-orange-800 dark:text-orange-200">
                          {record.soup.type}
                        </span>
                      </div>
                      <div>
                        <div className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mb-1">喝汤时间</div>
                        <div className="text-sm sm:text-base font-medium text-gray-900 dark:text-white">
                          {formatSystemTime(record.drinkTime)}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {formatSystemDate(record.drinkTime)}
                        </div>
                      </div>
                      <div className="col-span-2">
                        <div className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mb-1">记录ID</div>
                        <span className="inline-flex items-center px-3 sm:px-4 py-1 sm:py-2 rounded-full text-xs sm:text-sm font-medium bg-gradient-to-r from-gray-100 to-gray-200 text-gray-800 dark:from-gray-700 dark:to-gray-600 dark:text-gray-200">
                          #{record.id}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
      {/* 分页组件 */}
      <div className="flex justify-center items-center py-6 sm:py-10">
        <div className="w-full max-w-4xl">
          <Pagination
            total={sortedRecords.length}
            page={page}
            pageSize={pageSize}
            onPageChange={p => setPage(p)}
            onPageSizeChange={s => { setPageSize(s); setPage(1); }}
          />
        </div>
      </div>
    </div>
  );
} 