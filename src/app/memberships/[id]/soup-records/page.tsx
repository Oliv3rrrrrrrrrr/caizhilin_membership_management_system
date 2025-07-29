'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { 
  FiArrowLeft, 
  FiUser, 
  FiPackage, 
  FiCoffee,
  FiPlus,
  FiSearch,
  FiEdit2,
  FiTrash2,
  FiEye,
  FiRefreshCw,
  FiTrendingUp,
  FiCalendar,
  FiClock,
  FiCheckCircle,
  FiAlertCircle
} from 'react-icons/fi';
import { getMembershipById } from '@/services/membershipService';
import { getSoupRecordsByMembershipId, deleteSoupRecord } from '@/services/soupRecordService';
import { MembershipResponse } from '@/types/membership';
import { SoupRecordResponse } from '@/types/soupRecord';
import { formatSystemTime, formatSystemDate } from '@/lib/timeUtils';
import Pagination from '@/components/Pagination';

export default function MembershipSoupRecordsPage() {
  const router = useRouter();
  const params = useParams();
  const membershipId = parseInt(params.id as string);
  
  const [membership, setMembership] = useState<MembershipResponse | null>(null);
  const [soupRecords, setSoupRecords] = useState<SoupRecordResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDateRange, setFilterDateRange] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [sortField, setSortField] = useState<'drinkTime' | 'soupName' | 'id'>('drinkTime');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  // 分页相关
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);

  // 获取会员信息和喝汤记录
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        if (!token) {
          router.push('/login');
          return;
        }
        
        // 并行获取会员信息和喝汤记录
        const [membershipData, recordsResult] = await Promise.all([
          getMembershipById(membershipId, token),
          getSoupRecordsByMembershipId(membershipId, token, page, pageSize)
        ]);
        
        setMembership(membershipData);
        setSoupRecords(recordsResult.data);
        setTotal(recordsResult.total);
        setPage(recordsResult.page);
        setPageSize(recordsResult.pageSize);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (membershipId) {
      fetchData();
    }
  }, [membershipId, page, pageSize, router]);

  // 检查URL参数中的成功消息
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const success = urlParams.get('success');
    if (success === 'created') {
      setSuccessMessage('喝汤记录创建成功！');
      window.history.replaceState({}, '', window.location.pathname); // 清除URL参数
      setTimeout(() => setSuccessMessage(''), 3000); // 3秒后清除消息
    }
  }, []);

  // 刷新数据
  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/login');
        return;
      }
      
      const recordsResult = await getSoupRecordsByMembershipId(membershipId, token, page, pageSize);
      setSoupRecords(recordsResult.data);
      setTotal(recordsResult.total);
      setPage(recordsResult.page);
      setPageSize(recordsResult.pageSize);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setTimeout(() => setIsRefreshing(false), 500);
    }
  };

  // 删除记录
  const handleDeleteRecord = async (recordId: number, soupName: string) => {
    if (!confirm(`确定要删除 "${soupName}" 的喝汤记录吗？此操作不可恢复。`)) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/login');
        return;
      }
      
      await deleteSoupRecord(recordId, token);
      await handleRefresh(); // 重新加载数据
    } catch (err: any) {
      alert('删除失败: ' + err.message);
    }
  };

  // 筛选记录
  const filteredRecords = soupRecords.filter(record => {
    const matchesSearch = record.soup.name.toLowerCase().includes(searchTerm.toLowerCase());
    
    let matchesDateRange = true;
    if (filterDateRange) {
      const recordDate = new Date(record.drinkTime);
      const today = new Date();
      
      switch (filterDateRange) {
        case 'today':
          matchesDateRange = recordDate.toDateString() === today.toDateString();
          break;
        case 'week':
          const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
          matchesDateRange = recordDate >= weekAgo;
          break;
        case 'month':
          const monthAgo = new Date(today.getFullYear(), today.getMonth() - 1, today.getDate());
          matchesDateRange = recordDate >= monthAgo;
          break;
      }
    }
    
    return matchesSearch && matchesDateRange;
  });

  // 排序记录
  const sortedRecords = [...filteredRecords].sort((a, b) => {
    let aValue: any;
    let bValue: any;

    switch (sortField) {
      case 'drinkTime':
        aValue = new Date(a.drinkTime);
        bValue = new Date(b.drinkTime);
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
  const handleSort = (field: 'drinkTime' | 'soupName' | 'id') => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // 统计数据
  const totalRecords = soupRecords.length;
  const todayRecords = soupRecords.filter(record => {
    const recordDate = new Date(record.drinkTime);
    const today = new Date();
    return recordDate.toDateString() === today.toDateString();
  }).length;
  
  const weekRecords = soupRecords.filter(record => {
    const recordDate = new Date(record.drinkTime);
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    return recordDate >= weekAgo;
  }).length;

  // 最常喝的汤品
  const soupFrequency = soupRecords.reduce((acc, record) => {
    acc[record.soup.name] = (acc[record.soup.name] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  const mostFrequentSoup = Object.entries(soupFrequency)
    .sort(([,a], [,b]) => b - a)[0];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400 text-lg">正在加载喝汤记录...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !membership) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
        <div className="max-w-2xl mx-auto px-6 py-12">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 text-center border border-gray-100 dark:border-gray-700">
            <div className="w-20 h-20 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <FiAlertCircle className="text-red-500 text-3xl" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
              加载失败
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-8 text-lg">
              {error || '找不到指定的会员信息'}
            </p>
            <button
              onClick={() => router.push('/memberships')}
              className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-8 py-3 rounded-xl font-medium transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              返回会员列表
            </button>
          </div>
        </div>
      </div>
    );
  }

  const isActive = membership.remainingSoups > 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      {/* 页面头部 */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.back()}
                className="p-3 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-all duration-200 cursor-pointer"
              >
                <FiArrowLeft className="w-5 h-5" />
              </button>
              <div className="flex items-center">
                <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center shadow-lg mr-4">
                  <FiCoffee className="text-white text-xl" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-white">喝汤记录</h1>
                  <p className="text-gray-600 dark:text-gray-400 mt-1">
                    查看会员 {membership.name} 的喝汤记录
                  </p>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => router.push('/dashboard')}
                className="px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-xl font-medium transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 cursor-pointer"
              >
                返回主页
              </button>
              <button
                onClick={() => router.push(`/memberships/${membershipId}/soup-records/new`)}
                className="px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white rounded-xl flex items-center font-medium transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 cursor-pointer"
              >
                <FiPlus className="mr-2" />
                新增记录
              </button>
              <button
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="px-4 py-2 bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white rounded-xl flex items-center font-medium transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                <FiRefreshCw className={`mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
                {isRefreshing ? '刷新中...' : '刷新'}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* 会员信息卡片 */}
        <div className="mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden border border-gray-100 dark:border-gray-700">
            <div className={`px-8 py-6 ${
              isActive 
                ? 'bg-gradient-to-r from-green-500 to-green-600' 
                : 'bg-gradient-to-r from-orange-500 to-orange-600'
            }`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mr-6">
                    <FiUser className="text-white text-2xl" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-white mb-1">{membership.name}</h2>
                    <p className="text-white/80 text-lg">{membership.cardNumber} • {membership.cardType}</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-white font-bold text-xl mb-1">
                    {membership.remainingSoups} 次
                  </div>
                  <div className="text-white/80">剩余汤品</div>
                </div>
              </div>
            </div>

            {/* 状态指示器 */}
            <div className="px-8 py-6 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-600">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className={`w-4 h-4 rounded-full mr-3 ${
                    isActive ? 'bg-green-500' : 'bg-red-500'
                  }`}></div>
                  <div>
                    <p className="text-lg font-semibold text-gray-900 dark:text-white">
                      {isActive ? '会员状态正常' : '需要续费'}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {isActive 
                        ? '可以继续使用汤品服务' 
                        : '会员汤品已用完，建议续费'
                      }
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* 成功消息 */}
            {successMessage && (
              <div className="px-8 py-4 bg-green-50 dark:bg-green-900/20 border-b border-green-200 dark:border-green-800">
                <div className="flex items-center">
                  <FiCheckCircle className="text-green-500 mr-3 text-xl" />
                  <p className="text-green-600 dark:text-green-400 font-medium">{successMessage}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 统计卡片 */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-100 dark:border-gray-700 hover:shadow-xl transition-all duration-300 transform hover:scale-105">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">总记录数</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">{totalRecords}</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                <FiCoffee className="text-white text-xl" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-100 dark:border-gray-700 hover:shadow-xl transition-all duration-300 transform hover:scale-105">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">今日记录</p>
                <p className="text-3xl font-bold text-green-600 dark:text-green-400 mt-2">{todayRecords}</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center">
                <FiTrendingUp className="text-white text-xl" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-100 dark:border-gray-700 hover:shadow-xl transition-all duration-300 transform hover:scale-105">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">本周记录</p>
                <p className="text-3xl font-bold text-orange-600 dark:text-orange-400 mt-2">{weekRecords}</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center">
                <FiCalendar className="text-white text-xl" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-100 dark:border-gray-700 hover:shadow-xl transition-all duration-300 transform hover:scale-105">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">最爱汤品</p>
                <p className="text-lg font-bold text-purple-600 dark:text-purple-400 mt-2">
                  {mostFrequentSoup ? mostFrequentSoup[0] : '暂无'}
                </p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center">
                <FiPackage className="text-white text-xl" />
              </div>
            </div>
          </div>
        </div>

        {/* 搜索和筛选 */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 mb-8 border border-gray-100 dark:border-gray-700">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* 搜索框 */}
            <div className="flex-1">
              <div className="relative">
                <FiSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 text-lg" />
                <input
                  type="text"
                  placeholder="搜索汤品名称..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-lg transition-all duration-200"
                />
              </div>
            </div>

            {/* 时间筛选 */}
            <div className="lg:w-48">
              <select
                value={filterDateRange}
                onChange={(e) => setFilterDateRange(e.target.value)}
                className="w-full px-4 py-4 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-all duration-200 cursor-pointer"
              >
                <option value="">全部时间</option>
                <option value="today">今天</option>
                <option value="week">最近7天</option>
                <option value="month">最近30天</option>
              </select>
            </div>
          </div>
        </div>

        {/* 记录列表 */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden border border-gray-100 dark:border-gray-700">
          <div className="px-8 py-6 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-600">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center">
                <FiCoffee className="mr-3 text-orange-600" />
                喝汤记录
              </h2>
              <span className="bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200 px-3 py-1 rounded-full text-sm font-medium">
                {totalRecords} 条记录
              </span>
            </div>
          </div>

          {filteredRecords.length === 0 ? (
            <div className="p-12 text-center">
              <div className="w-24 h-24 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-6">
                <FiCoffee className="text-gray-400 text-3xl" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                {searchTerm || filterDateRange ? '没有找到匹配的记录' : '暂无喝汤记录'}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-md mx-auto">
                {searchTerm || filterDateRange 
                  ? '请尝试调整搜索条件或筛选条件' 
                  : '开始添加第一条喝汤记录吧'
                }
              </p>
              {!searchTerm && !filterDateRange && (
                <button
                  onClick={() => router.push(`/memberships/${membershipId}/soup-records/new`)}
                  className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white px-8 py-4 rounded-xl font-medium transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                  <FiPlus className="inline mr-2" />
                  添加第一条记录
                </button>
              )}
            </div>
          ) : (
            <div>
              <table className="w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th 
                      className="px-8 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
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
                      className="px-8 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
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
                    <th className="px-8 py-4 text-right text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                      操作
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {sortedRecords.map((record, index) => (
                    <tr 
                      key={record.id} 
                      className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200 transform hover:scale-[1.01]"
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      <td className="px-8 py-6 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-orange-600 rounded-full flex items-center justify-center mr-4">
                            <FiPackage className="text-white text-sm" />
                          </div>
                          <div>
                            <div className="text-lg font-semibold text-gray-900 dark:text-white">
                              {record.soup.name}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6 whitespace-nowrap">
                        <div className="flex items-center">
                          <FiClock className="text-gray-400 mr-2" />
                          <div>
                            <div className="text-lg font-medium text-gray-900 dark:text-white">
                              {formatSystemDate(record.drinkTime)}
                            </div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                              {formatSystemTime(record.drinkTime)}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end space-x-3">
                          <button
                            onClick={() => router.push(`/soup-records/${record.id}`)}
                            className="p-2 text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-all duration-200 cursor-pointer"
                            title="查看详情"
                          >
                            <FiEye className="h-5 w-5" />
                          </button>
                          <button
                            onClick={() => router.push(`/soup-records/${record.id}/edit`)}
                            className="p-2 text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg transition-all duration-200 cursor-pointer"
                            title="编辑"
                          >
                            <FiEdit2 className="h-5 w-5" />
                          </button>
                          <button
                            onClick={() => handleDeleteRecord(record.id, record.soup.name)}
                            className="p-2 text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all duration-200 cursor-pointer"
                            title="删除"
                          >
                            <FiTrash2 className="h-5 w-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
      {/* 分页组件 */}
      <div className="flex justify-center items-center py-10">
        <div className="w-full max-w-4xl">
          <Pagination
            total={total}
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