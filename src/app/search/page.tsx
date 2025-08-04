'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FiSearch, FiEye, FiEdit2, FiUsers, FiArrowLeft } from 'react-icons/fi';
import { searchMemberships } from '@/services/membershipService';
import type { MembershipResponse } from '@/types/membership';
import Pagination from '@/components/Pagination';

export default function SearchPage() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<MembershipResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [hasSearched, setHasSearched] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);
  const router = useRouter();

  const handleSearch = async (pageNum = 1, size = pageSize) => {
    if (!query.trim()) return;
    setLoading(true);
    setError('');
    setHasSearched(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/login');
        return;
      }
      const data = await searchMemberships(query, token, pageNum, size);
      setResults(data.members);
      setTotal(data.total);
      setPage(data.page);
      setPageSize(data.pageSize);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : '搜索失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      {/* 页面头部 */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
            <div className="flex items-center space-x-2 sm:space-x-4">
              <button
                onClick={() => router.back()}
                className="p-2 sm:p-3 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-all duration-200 cursor-pointer"
              >
                <FiArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
              <div className="flex items-center">
                <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg mr-2 sm:mr-3 lg:mr-4">
                  <FiSearch className="text-white text-sm sm:text-base lg:text-xl" />
                </div>
                <div>
                  <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white">会员全局搜索</h1>
                  <p className="text-xs sm:text-sm lg:text-base text-gray-600 dark:text-gray-400 mt-1">
                    支持姓名、手机号、卡号模糊搜索，快速定位会员信息
                  </p>
                </div>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-2 sm:space-y-0 sm:space-x-2 lg:space-x-3">
              <button
                onClick={() => router.push('/dashboard')}
                className="px-3 sm:px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-xl font-medium transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 cursor-pointer text-xs sm:text-sm"
              >
                <span className="hidden sm:inline">返回主页</span>
                <span className="sm:hidden">主页</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 搜索卡片 */}
      <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
        <div className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-6 lg:p-8 border border-gray-100 dark:border-gray-700 mb-6 sm:mb-8 min-h-[200px] sm:min-h-[300px]">
          <div className="flex items-center mb-4 sm:mb-6">
            <FiSearch className="text-blue-500 w-5 h-5 sm:w-6 sm:h-6 mr-2 sm:mr-3" />
            <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 dark:text-white">会员全局搜索</h2>
          </div>
          
          {/* 搜索输入框 */}
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 mb-4 sm:mb-6">
            <input
              type="text"
              className="flex-1 px-3 sm:px-4 py-2 sm:py-3 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm sm:text-base transition-all duration-200"
              placeholder="输入会员姓名、手机号或卡号..."
              value={query}
              onChange={e => {
                setQuery(e.target.value);
                if (e.target.value === '') {
                  setHasSearched(false);
                  setResults([]);
                  setTotal(0);
                  setPage(1);
                }
              }}
              onKeyDown={e => e.key === 'Enter' && handleSearch(1, pageSize)}
            />
            <button
              onClick={() => handleSearch(1, pageSize)}
              className="px-4 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-lg font-medium transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105 cursor-pointer text-sm sm:text-base"
            >
              <FiSearch className="inline mr-1 sm:mr-2 text-sm sm:text-base" />
              <span className="hidden sm:inline">搜索</span>
              <span className="sm:hidden">搜</span>
            </button>
          </div>

          {/* 加载状态 */}
          {loading && (
            <div className="text-gray-400 py-6 sm:py-8 text-center text-sm sm:text-base">
              正在搜索会员...
            </div>
          )}

          {/* 错误状态 */}
          {error && (
            <div className="text-red-500 py-6 sm:py-8 text-center text-sm sm:text-base">
              {error}
            </div>
          )}

          {/* 无结果状态 */}
          {!loading && !error && results.length === 0 && query && hasSearched && (
            <div className="py-8 sm:py-12 text-center">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
                <FiUsers className="text-gray-400 text-2xl sm:text-3xl" />
              </div>
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-2">未找到相关会员</h3>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">请尝试调整搜索关键词</p>
            </div>
          )}

          {/* 搜索结果 */}
          {results.length > 0 && (
            <>
              <div className="mt-4 sm:mt-6 overflow-x-auto">
                {/* 桌面端表格 */}
                <div className="hidden lg:block">
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-700">
                      <tr>
                        <th className="px-4 sm:px-6 lg:px-8 py-3 sm:py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">会员信息</th>
                        <th className="px-4 sm:px-6 lg:px-8 py-3 sm:py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">卡号</th>
                        <th className="px-4 sm:px-6 lg:px-8 py-3 sm:py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">卡类型</th>
                        <th className="px-4 sm:px-6 lg:px-8 py-3 sm:py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">剩余汤品</th>
                        <th className="px-4 sm:px-6 lg:px-8 py-3 sm:py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">操作</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                      {results.map((member, index) => (
                        <tr
                          key={member.id}
                          className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200 transform hover:scale-[1.01]"
                          style={{ animationDelay: `${index * 50}ms` }}
                        >
                          <td className="px-4 sm:px-6 lg:px-8 py-4 sm:py-6 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center mr-3 sm:mr-4">
                                <span className="text-white font-semibold text-xs sm:text-sm">
                                  {member.name.charAt(0)}
                                </span>
                              </div>
                              <div>
                                <div className="text-sm sm:text-base lg:text-lg font-semibold text-gray-900 dark:text-white">
                                  {member.name}
                                </div>
                                <div className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                                  {member.phone}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 sm:px-6 lg:px-8 py-4 sm:py-6 whitespace-nowrap">
                            <span className="inline-flex items-center px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium bg-gradient-to-r from-blue-100 to-blue-200 text-blue-800 dark:from-blue-900 dark:to-blue-800 dark:text-blue-200">
                              {member.cardNumber}
                            </span>
                          </td>
                          <td className="px-4 sm:px-6 lg:px-8 py-4 sm:py-6 whitespace-nowrap">
                            <span className="text-sm sm:text-base lg:text-lg font-medium text-gray-900 dark:text-white">
                              {member.cardType}
                            </span>
                          </td>
                          <td className="px-4 sm:px-6 lg:px-8 py-4 sm:py-6 whitespace-nowrap">
                            <span className={`inline-flex items-center px-2 sm:px-3 py-1 sm:py-2 rounded-full text-xs sm:text-sm font-semibold ${member.remainingSoups > 0
                                ? 'bg-gradient-to-r from-green-100 to-green-200 text-green-800 dark:from-green-900 dark:to-green-800 dark:text-green-200'
                                : 'bg-gradient-to-r from-red-100 to-red-200 text-red-800 dark:from-red-900 dark:to-red-800 dark:text-red-200'
                              }`}>
                              {member.remainingSoups} 次
                            </span>
                          </td>
                          <td className="px-4 sm:px-6 lg:px-8 py-4 sm:py-6 whitespace-nowrap text-right text-xs sm:text-sm font-medium">
                            <div className="flex items-center justify-end space-x-2 sm:space-x-3">
                              <button
                                onClick={() => router.push(`/memberships/${member.id}`)}
                                className="p-1.5 sm:p-2 text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-all duration-200 cursor-pointer"
                                title="查看详情"
                              >
                                <FiEye className="h-4 w-4 sm:h-5 sm:w-5" />
                              </button>
                              <button
                                onClick={() => router.push(`/memberships/${member.id}/edit`)}
                                className="p-1.5 sm:p-2 text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg transition-all duration-200 cursor-pointer"
                                title="编辑"
                              >
                                <FiEdit2 className="h-4 w-4 sm:h-5 sm:w-5" />
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
                  {results.map((member, index) => (
                    <div
                      key={member.id}
                      className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4 sm:p-6 border border-gray-200 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-600 transition-all duration-200"
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      <div className="flex items-center justify-between mb-3 sm:mb-4">
                        <div className="flex items-center">
                          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center mr-3 sm:mr-4">
                            <span className="text-white font-semibold text-sm sm:text-base">
                              {member.name.charAt(0)}
                            </span>
                          </div>
                          <div>
                            <div className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">
                              {member.name}
                            </div>
                            <div className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                              {member.phone}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => router.push(`/memberships/${member.id}`)}
                            className="p-2 text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-all duration-200 cursor-pointer"
                            title="查看详情"
                          >
                            <FiEye className="h-4 w-4 sm:h-5 sm:w-5" />
                          </button>
                          <button
                            onClick={() => router.push(`/memberships/${member.id}/edit`)}
                            className="p-2 text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg transition-all duration-200 cursor-pointer"
                            title="编辑"
                          >
                            <FiEdit2 className="h-4 w-4 sm:h-5 sm:w-5" />
                          </button>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-3 sm:gap-4">
                        <div>
                          <div className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mb-1">卡号</div>
                          <span className="inline-flex items-center px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium bg-gradient-to-r from-blue-100 to-blue-200 text-blue-800 dark:from-blue-900 dark:to-blue-800 dark:text-blue-200">
                            {member.cardNumber}
                          </span>
                        </div>
                        <div>
                          <div className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mb-1">卡类型</div>
                          <div className="text-sm sm:text-base font-medium text-gray-900 dark:text-white">
                            {member.cardType}
                          </div>
                        </div>
                        <div className="col-span-2">
                          <div className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mb-1">剩余汤品</div>
                          <span className={`inline-flex items-center px-3 sm:px-4 py-1 sm:py-2 rounded-full text-xs sm:text-sm font-semibold ${member.remainingSoups > 0
                              ? 'bg-gradient-to-r from-green-100 to-green-200 text-green-800 dark:from-green-900 dark:to-green-800 dark:text-green-200'
                              : 'bg-gradient-to-r from-red-100 to-red-200 text-red-800 dark:from-red-900 dark:to-red-800 dark:text-red-200'
                            }`}>
                            {member.remainingSoups} 次
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* 分页组件 */}
              <div className="w-full flex justify-center items-center py-2 sm:py-4 text-xs sm:text-sm">
                <Pagination
                  total={total}
                  page={page}
                  pageSize={pageSize}
                  onPageChange={p => handleSearch(p, pageSize)}
                  onPageSizeChange={s => handleSearch(1, s)}
                />
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
} 