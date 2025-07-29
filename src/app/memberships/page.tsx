'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  FiUsers, 
  FiPlus, 
  FiSearch, 
  FiFilter, 
  FiEdit2, 
  FiTrash2, 
  FiEye,
  FiRefreshCw,
  FiHome,
  FiTrendingUp,
  FiTrendingDown,
  FiPackage,
  FiCreditCard,
  FiCheckCircle
} from 'react-icons/fi';
import { getMemberships, deleteMembership, searchMemberships, getMembershipStats } from '@/services/membershipService';
import { MembershipResponse } from '@/types/membership';
import { formatSystemDate } from '@/lib/timeUtils';
import Pagination from '@/components/Pagination';

export default function MembershipsPage() {
  const router = useRouter();
  const [memberships, setMemberships] = useState<MembershipResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<MembershipResponse[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState('');
  const [filterCardType, setFilterCardType] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [sortField, setSortField] = useState<'name' | 'phone' | 'cardNumber' | 'remainingSoups' | 'issueDate'>('issueDate');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [successMessage, setSuccessMessage] = useState('');
  // 分页相关
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);
  const [searchPage, setSearchPage] = useState(1);
  const [searchPageSize, setSearchPageSize] = useState(10);
  const [searchTotal, setSearchTotal] = useState(0);
  const [stats, setStats] = useState<{ total: number; active: number; inactive: number; cardTypeCount: number }>({ total: 0, active: 0, inactive: 0, cardTypeCount: 0 });

  // 主列表分页获取
  const fetchMemberships = async (pageNum = page, size = pageSize) => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/login');
        return;
      }
      const result = await getMemberships(token, pageNum, size);
      setMemberships(result.data);
      setTotal(result.total);
      setPage(result.page);
      setPageSize(result.pageSize);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // 搜索分页获取
  const fetchSearchResults = async (term = searchTerm, pageNum = searchPage, size = searchPageSize) => {
    if (!term.trim()) return;
    try {
      setSearchLoading(true);
      setSearchError('');
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/login');
        return;
      }
      const result = await searchMemberships(term, token, pageNum, size);
      setSearchResults(result.members);
      setSearchTotal(result.total);
      setSearchPage(result.page);
      setSearchPageSize(result.pageSize);
    } catch (err: any) {
      setSearchError(err.message);
    } finally {
      setSearchLoading(false);
    }
  };

  // 检查URL参数中的成功消息
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const success = urlParams.get('success');
    if (success === 'created') {
      setSuccessMessage('会员创建成功！');
      window.history.replaceState({}, '', window.location.pathname);
      setTimeout(() => setSuccessMessage(''), 3000);
    }
  }, []);

  useEffect(() => {
    const fetchAll = async () => {
      fetchMemberships();
      try {
        const token = localStorage.getItem('token');
        if (!token) return;
        const s = await getMembershipStats(token);
        setStats(s);
      } catch {}
    };
    fetchAll();
  }, [page, pageSize]);

  useEffect(() => {
    if (isSearching) {
      fetchSearchResults(searchTerm, searchPage, searchPageSize);
    }
  }, [isSearching, searchPage, searchPageSize]);

  // 刷新数据
  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchMemberships();
    setTimeout(() => setIsRefreshing(false), 500);
  };

  // 删除会员
  const handleDelete = async (id: number, name: string) => {
    if (!confirm(`确定要删除会员 "${name}" 吗？此操作不可恢复。`)) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/login');
        return;
      }
      await deleteMembership(id, token);
      await fetchMemberships(); // 重新加载列表
    } catch (err: any) {
      alert('删除失败: ' + err.message);
    }
  };

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

  // 筛选会员
  const filteredMemberships = memberships.filter(membership => {
    const matchesCardType = !filterCardType || membership.cardType === filterCardType;
    return matchesCardType;
  });

  // 排序会员
  const sortedMemberships = [...filteredMemberships].sort((a, b) => {
    let aValue: any;
    let bValue: any;

    switch (sortField) {
      case 'name':
        aValue = a.name.toLowerCase();
        bValue = b.name.toLowerCase();
        break;
      case 'phone':
        aValue = a.phone;
        bValue = b.phone;
        break;
      case 'cardNumber':
        aValue = a.cardNumber.toLowerCase();
        bValue = b.cardNumber.toLowerCase();
        break;
      case 'remainingSoups':
        aValue = a.remainingSoups;
        bValue = b.remainingSoups;
        break;
      case 'issueDate':
        aValue = new Date(a.issueDate);
        bValue = new Date(b.issueDate);
        break;
      default:
        aValue = a.name.toLowerCase();
        bValue = b.name.toLowerCase();
    }

    if (sortDirection === 'asc') {
      return aValue > bValue ? 1 : aValue < bValue ? -1 : 0;
    } else {
      return aValue < bValue ? 1 : aValue > bValue ? -1 : 0;
    }
  });

  // 处理排序
  const handleSort = (field: 'name' | 'phone' | 'cardNumber' | 'remainingSoups' | 'issueDate') => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // 获取所有卡类型
  const cardTypes = [...new Set(memberships.map(m => m.cardType))];

  // 统计数据
  const totalMembers = memberships.length;
  const activeMembers = memberships.filter(m => m.remainingSoups > 0).length;
  const inactiveMembers = memberships.filter(m => m.remainingSoups === 0).length;
  const cardTypeCount = cardTypes.length;

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400 text-lg">正在加载会员数据...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      {/* 页面头部 */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                  <FiUsers className="text-white text-xl" />
                </div>
                <div className="ml-4">
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-white">会员管理</h1>
                  <p className="text-gray-600 dark:text-gray-400 mt-1">
                    管理系统中的所有会员信息 • 共 {stats.total} 位会员
                  </p>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => router.push('/dashboard')}
                className="px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white rounded-xl flex items-center font-medium transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 cursor-pointer"
              >
                <FiHome className="mr-2" />
                返回主页
              </button>
              <button
                onClick={() => router.push('/memberships/new')}
                className="px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-xl flex items-center font-medium transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 cursor-pointer"
              >
                <FiPlus className="mr-2" />
                新增会员
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
        {/* 成功消息 */}
        {successMessage && (
          <div className="mb-8 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-2xl p-6">
            <div className="flex items-center">
              <FiCheckCircle className="text-green-500 mr-3 text-xl" />
              <p className="text-green-600 dark:text-green-400 font-medium">{successMessage}</p>
            </div>
          </div>
        )}

        {/* 统计卡片 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-100 dark:border-gray-700 hover:shadow-xl transition-all duration-300 transform hover:scale-105">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">总会员数</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">{stats.total}</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                <FiUsers className="text-white text-xl" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-100 dark:border-gray-700 hover:shadow-xl transition-all duration-300 transform hover:scale-105">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">活跃会员</p>
                <p className="text-3xl font-bold text-green-600 dark:text-green-400 mt-2">{stats.active}</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center">
                <FiTrendingUp className="text-white text-xl" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-100 dark:border-gray-700 hover:shadow-xl transition-all duration-300 transform hover:scale-105">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">待续费会员</p>
                <p className="text-3xl font-bold text-orange-600 dark:text-orange-400 mt-2">{stats.inactive}</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center">
                <FiTrendingDown className="text-white text-xl" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-100 dark:border-gray-700 hover:shadow-xl transition-all duration-300 transform hover:scale-105">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">卡类型</p>
                <p className="text-3xl font-bold text-purple-600 dark:text-purple-400 mt-2">{stats.cardTypeCount}</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center">
                <FiCreditCard className="text-white text-xl" />
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
                  placeholder="搜索会员姓名、手机号或卡号..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleSearch()}
                  className="w-full pl-12 pr-4 py-4 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-lg transition-all duration-200"
                />
                <div className="absolute right-4 top-1/2 transform -translate-y-1/2 flex space-x-2">
                  <button
                    onClick={handleSearch}
                    className="px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-lg font-medium shadow-md hover:shadow-lg transition-all duration-200 text-sm cursor-pointer"
                  >
                    搜索
                  </button>
                  <button
                    onClick={handleClearSearch}
                    disabled={!isSearching && !searchTerm}
                    className="px-4 py-2 bg-gradient-to-r from-gray-300 to-gray-400 hover:from-gray-400 hover:to-gray-500 text-gray-700 rounded-lg font-medium shadow-md hover:shadow-lg transition-all duration-200 text-sm disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                  >
                    清除
                  </button>
                </div>
              </div>
            </div>

            {/* 筛选按钮 */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`px-6 py-4 rounded-xl flex items-center transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 cursor-pointer ${
                showFilters 
                  ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white' 
                  : 'bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600 text-gray-700 dark:text-gray-300'
              }`}
            >
              <FiFilter className="mr-2" />
              筛选
            </button>
          </div>

          {/* 筛选选项 */}
          {showFilters && (
            <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700 animate-fadeIn">
              <div className="flex flex-wrap gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    卡类型筛选
                  </label>
                  <select
                    value={filterCardType}
                    onChange={(e) => setFilterCardType(e.target.value)}
                    className="px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-all duration-200 cursor-pointer"
                  >
                    <option value="">全部类型</option>
                    {cardTypes.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 搜索结果区（独立于主列表） */}
        {isSearching && (
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 mb-8 border border-gray-100 dark:border-gray-700 min-h-[300px]">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center">
                <FiSearch className="mr-3 text-blue-600" />
                搜索结果
              </h2>
              <span className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-3 py-1 rounded-full text-sm font-medium">
                {searchTotal} 位会员
              </span>
            </div>
            {searchLoading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600 dark:text-gray-400 text-lg">正在搜索会员...</p>
              </div>
            ) : searchError ? (
              <div className="p-6 bg-red-50 dark:bg-red-900/20 border-b border-red-200 dark:border-red-800">
                <div className="flex items-center">
                  <div className="w-5 h-5 bg-red-500 rounded-full mr-3"></div>
                  <p className="text-red-600 dark:text-red-400 font-medium">{searchError}</p>
                </div>
              </div>
            ) : searchResults.length === 0 ? (
              <div className="p-12 text-center">
                <div className="w-24 h-24 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-6">
                  <FiUsers className="text-gray-400 text-3xl" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  没有找到匹配的会员
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-md mx-auto">
                  请尝试调整搜索条件或筛选条件
                </p>
                <button
                  onClick={handleClearSearch}
                  className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-8 py-4 rounded-xl font-medium transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 cursor-pointer"
                >
                  清除搜索
                </button>
              </div>
            ) : (
              <>
                <div>
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-700">
                      <tr>
                        <th className="px-8 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">会员信息</th>
                        <th className="px-8 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">卡号</th>
                        <th className="px-8 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">卡类型</th>
                        <th className="px-8 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">剩余汤品</th>
                        <th className="px-8 py-4 text-right text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">操作</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                      {searchResults.map((membership, index) => (
                        <tr
                          key={membership.id}
                          className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200 transform hover:scale-[1.01]"
                          style={{ animationDelay: `${index * 50}ms` }}
                        >
                          <td className="px-8 py-6 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center mr-4">
                                <span className="text-white font-semibold text-sm">
                                  {membership.name.charAt(0)}
                                </span>
                              </div>
                              <div>
                                <div className="text-lg font-semibold text-gray-900 dark:text-white">
                                  {membership.name}
                                </div>
                                <div className="text-sm text-gray-500 dark:text-gray-400">
                                  {membership.phone}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-8 py-6 whitespace-nowrap">
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gradient-to-r from-blue-100 to-blue-200 text-blue-800 dark:from-blue-900 dark:to-blue-800 dark:text-blue-200">
                              {membership.cardNumber}
                            </span>
                          </td>
                          <td className="px-8 py-6 whitespace-nowrap">
                            <span className="text-lg font-medium text-gray-900 dark:text-white">
                              {membership.cardType}
                            </span>
                          </td>
                          <td className="px-8 py-6 whitespace-nowrap">
                            <span className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold ${
                              membership.remainingSoups > 0 
                                ? 'bg-gradient-to-r from-green-100 to-green-200 text-green-800 dark:from-green-900 dark:to-green-800 dark:text-green-200'
                                : 'bg-gradient-to-r from-red-100 to-red-200 text-red-800 dark:from-red-900 dark:to-red-800 dark:text-red-200'
                            }`}>
                              <FiPackage className="mr-2" />
                              {membership.remainingSoups} 次
                            </span>
                          </td>
                          <td className="px-8 py-6 whitespace-nowrap text-right text-sm font-medium">
                            <div className="flex items-center justify-end space-x-3">
                              <button
                                onClick={() => router.push(`/memberships/${membership.id}`)}
                                className="p-2 text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-all duration-200 cursor-pointer"
                                title="查看详情"
                              >
                                <FiEye className="h-5 w-5" />
                              </button>
                              <button
                                onClick={() => router.push(`/memberships/${membership.id}/edit`)}
                                className="p-2 text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg transition-all duration-200 cursor-pointer"
                                title="编辑"
                              >
                                <FiEdit2 className="h-5 w-5" />
                              </button>
                              <button
                                onClick={() => handleDelete(membership.id, membership.name)}
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
                {/* 仅当搜索结果大于10条时显示分页 */}
                {searchTotal > 10 && (
                  <div className="w-full flex justify-center items-center py-2 text-xs">
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
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden border border-gray-100 dark:border-gray-700">
          <div className="px-8 py-6 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-600">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center">
                <FiPackage className="mr-3 text-blue-600" />
                会员列表
              </h2>
              <span className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-3 py-1 rounded-full text-sm font-medium">
                {sortedMemberships.length} 位会员
              </span>
            </div>
          </div>
          {error && (
            <div className="p-6 bg-red-50 dark:bg-red-900/20 border-b border-red-200 dark:border-red-800">
              <div className="flex items-center">
                <div className="w-5 h-5 bg-red-500 rounded-full mr-3"></div>
                <p className="text-red-600 dark:text-red-400 font-medium">{error}</p>
              </div>
            </div>
          )}
          {filteredMemberships.length === 0 ? (
            <div className="p-12 text-center">
              <div className="w-24 h-24 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-6">
                <FiUsers className="text-gray-400 text-3xl" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                暂无会员
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-md mx-auto">
                开始添加第一个会员，建立您的会员体系
              </p>
              <button
                onClick={() => router.push('/memberships/new')}
                className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-8 py-4 rounded-xl font-medium transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 cursor-pointer"
              >
                <FiPlus className="inline mr-2" />
                添加第一个会员
              </button>
            </div>
          ) : (
            <div>
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th 
                      className="px-8 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                      onClick={() => handleSort('name')}
                    >
                      <div className="flex items-center">
                        会员信息
                        {sortField === 'name' && (
                          <span className="ml-2 text-blue-500">
                            {sortDirection === 'asc' ? '↑' : '↓'}
                          </span>
                        )}
                      </div>
                    </th>
                    <th 
                      className="px-8 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                      onClick={() => handleSort('cardNumber')}
                    >
                      <div className="flex items-center">
                        卡号
                        {sortField === 'cardNumber' && (
                          <span className="ml-2 text-blue-500">
                            {sortDirection === 'asc' ? '↑' : '↓'}
                          </span>
                        )}
                      </div>
                    </th>
                    <th 
                      className="px-8 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                      onClick={() => handleSort('phone')}
                    >
                      <div className="flex items-center">
                        卡类型
                        {sortField === 'phone' && (
                          <span className="ml-2 text-blue-500">
                            {sortDirection === 'asc' ? '↑' : '↓'}
                          </span>
                        )}
                      </div>
                    </th>
                    <th 
                      className="px-8 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                      onClick={() => handleSort('remainingSoups')}
                    >
                      <div className="flex items-center">
                        剩余汤品
                        {sortField === 'remainingSoups' && (
                          <span className="ml-2 text-blue-500">
                            {sortDirection === 'asc' ? '↑' : '↓'}
                          </span>
                        )}
                      </div>
                    </th>
                    <th 
                      className="px-8 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                      onClick={() => handleSort('issueDate')}
                    >
                      <div className="flex items-center">
                        发卡日期
                        {sortField === 'issueDate' && (
                          <span className="ml-2 text-blue-500">
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
                  {sortedMemberships.map((membership, index) => (
                    <tr 
                      key={membership.id} 
                      className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200 transform hover:scale-[1.01]"
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      <td className="px-8 py-6 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center mr-4">
                            <span className="text-white font-semibold text-sm">
                              {membership.name.charAt(0)}
                            </span>
                          </div>
                          <div>
                            <div className="text-lg font-semibold text-gray-900 dark:text-white">
                              {membership.name}
                            </div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                              {membership.phone}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6 whitespace-nowrap">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gradient-to-r from-blue-100 to-blue-200 text-blue-800 dark:from-blue-900 dark:to-blue-800 dark:text-blue-200">
                          {membership.cardNumber}
                        </span>
                      </td>
                      <td className="px-8 py-6 whitespace-nowrap">
                        <span className="text-lg font-medium text-gray-900 dark:text-white">
                          {membership.cardType}
                        </span>
                      </td>
                      <td className="px-8 py-6 whitespace-nowrap">
                        <span className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold ${
                          membership.remainingSoups > 0 
                            ? 'bg-gradient-to-r from-green-100 to-green-200 text-green-800 dark:from-green-900 dark:to-green-800 dark:text-green-200'
                            : 'bg-gradient-to-r from-red-100 to-red-200 text-red-800 dark:from-red-900 dark:to-red-800 dark:text-red-200'
                        }`}>
                          <FiPackage className="mr-2" />
                          {membership.remainingSoups} 次
                        </span>
                      </td>
                      <td className="px-8 py-6 whitespace-nowrap text-lg text-gray-500 dark:text-gray-400">
                        {formatSystemDate(membership.issueDate)}
                      </td>
                      <td className="px-8 py-6 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end space-x-3">
                          <button
                            onClick={() => router.push(`/memberships/${membership.id}`)}
                            className="p-2 text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-all duration-200 cursor-pointer"
                            title="查看详情"
                          >
                            <FiEye className="h-5 w-5" />
                          </button>
                          <button
                            onClick={() => router.push(`/memberships/${membership.id}/edit`)}
                            className="p-2 text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg transition-all duration-200 cursor-pointer"
                            title="编辑"
                          >
                            <FiEdit2 className="h-5 w-5" />
                          </button>
                          <button
                            onClick={() => handleDelete(membership.id, membership.name)}
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
    </div>
  );
} 