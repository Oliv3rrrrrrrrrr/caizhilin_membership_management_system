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
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 py-10 px-4">
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
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg mr-4">
                  <FiSearch className="text-white text-xl" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-white">会员全局搜索</h1>
                  <p className="text-gray-600 dark:text-gray-400 mt-1">
                    支持姓名、手机号、卡号模糊搜索，快速定位会员信息
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
            </div>
          </div>
        </div>
      </div>
      {/* 搜索卡片与顶部拉开距离 */}
      <div className="max-w-4xl mx-auto mt-10">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 border border-gray-100 dark:border-gray-700 mb-8 min-h-[300px]">
          <div className="flex items-center mb-6">
            <FiSearch className="text-blue-500 w-6 h-6 mr-3" />
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">会员全局搜索</h1>
          </div>
          <div className="flex gap-2 mb-4">
            <input
              type="text"
              className="flex-1 px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-base transition-all duration-200"
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
              className="px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-lg font-medium transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105 cursor-pointer text-base"
            >
              <FiSearch className="inline mr-2" />搜索
            </button>
          </div>
          {loading && <div className="text-gray-400 py-8 text-center">正在搜索会员...</div>}
          {error && <div className="text-red-500 py-8 text-center">{error}</div>}
          {!loading && !error && results.length === 0 && query && hasSearched && (
            <div className="py-12 text-center">
              <div className="w-20 h-20 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-6">
                <FiUsers className="text-gray-400 text-3xl" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">未找到相关会员</h3>
              <p className="text-gray-600 dark:text-gray-400">请尝试调整搜索关键词</p>
            </div>
          )}
          {results.length > 0 && (
            <>
              <div className="mt-6">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th className="px-8 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">会员信息</th>
                      <th className="px-8 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">卡号</th>
                      <th className="px-8 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">卡类型</th>
                      <th className="px-8 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">剩余汤品</th>
                      <th className="px-8 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">操作</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {results.map((member, index) => (
                      <tr
                        key={member.id}
                        className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200 transform hover:scale-[1.01]"
                        style={{ animationDelay: `${index * 50}ms` }}
                      >
                        <td className="px-8 py-6 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center mr-4">
                              <span className="text-white font-semibold text-sm">
                                {member.name.charAt(0)}
                              </span>
                            </div>
                            <div>
                              <div className="text-lg font-semibold text-gray-900 dark:text-white">
                                {member.name}
                              </div>
                              <div className="text-sm text-gray-500 dark:text-gray-400">
                                {member.phone}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-8 py-6 whitespace-nowrap">
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gradient-to-r from-blue-100 to-blue-200 text-blue-800 dark:from-blue-900 dark:to-blue-800 dark:text-blue-200">
                            {member.cardNumber}
                          </span>
                        </td>
                        <td className="px-8 py-6 whitespace-nowrap">
                          <span className="text-lg font-medium text-gray-900 dark:text-white">
                            {member.cardType}
                          </span>
                        </td>
                        <td className="px-8 py-6 whitespace-nowrap">
                          <span className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold ${member.remainingSoups > 0
                              ? 'bg-gradient-to-r from-green-100 to-green-200 text-green-800 dark:from-green-900 dark:to-green-800 dark:text-green-200'
                              : 'bg-gradient-to-r from-red-100 to-red-200 text-red-800 dark:from-red-900 dark:to-red-800 dark:text-red-200'
                            }`}>
                            {member.remainingSoups} 次
                          </span>
                        </td>
                        <td className="px-8 py-6 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex items-center justify-end space-x-3">
                            <button
                              onClick={() => router.push(`/memberships/${member.id}`)}
                              className="p-2 text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-all duration-200 cursor-pointer"
                              title="查看详情"
                            >
                              <FiEye className="h-5 w-5" />
                            </button>
                            <button
                              onClick={() => router.push(`/memberships/${member.id}/edit`)}
                              className="p-2 text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg transition-all duration-200 cursor-pointer"
                              title="编辑"
                            >
                              <FiEdit2 className="h-5 w-5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {/* 分页组件更紧凑 */}
              <div className="w-full flex justify-center items-center py-2 text-xs">
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