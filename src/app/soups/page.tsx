"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  FiCoffee,
  FiPlus,
  FiSearch,
  FiFilter,
  FiEdit2,
  FiTrash2,
  FiRefreshCw,
  FiHome,
  FiBarChart,
  FiPackage,
} from "react-icons/fi";
import { getAllSoups, deleteSoup } from "@/services/soupService";
import { SoupResponse } from "@/types/soup";
import Pagination from "@/components/Pagination";

export default function SoupsPage() {
  const router = useRouter();
  const [soups, setSoups] = useState<SoupResponse[]>([]); // 汤品列表
  const [loading, setLoading] = useState(true); // 加载状态
  const [error, setError] = useState(""); // 错误信息
  const [searchTerm, setSearchTerm] = useState(""); // 搜索关键词
  const [filterType, setFilterType] = useState(""); // 筛选类型
  const [showFilters, setShowFilters] = useState(false); // 是否显示筛选
  const [isRefreshing, setIsRefreshing] = useState(false); // 是否正在刷新
  const [sortField, setSortField] = useState<"name" | "type">("name"); // 排序字段
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc"); // 排序方向
  const [page, setPage] = useState(1); // 当前页码
  const [pageSize, setPageSize] = useState(10); // 每页条数

  // 添加搜索相关状态
  const [isSearching, setIsSearching] = useState(false);

  // 获取汤品列表
  const fetchSoups = useCallback(async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      if (!token) {
        router.push("/login");
        return;
      }
      const result = await getAllSoups(token);
      setSoups(result);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : '获取汤品列表失败');
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    fetchSoups();
  }, [fetchSoups]);

  // 刷新数据
  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchSoups();
    setTimeout(() => setIsRefreshing(false), 500);
  };

  // 删除汤品
  const handleDelete = async (id: number, name: string) => {
    if (!confirm(`确定要删除汤品 "${name}" 吗？此操作不可恢复。`)) {
      return;
    }
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        router.push("/login");
        return;
      }
      await deleteSoup(id, token);
      await fetchSoups();
    } catch (err: unknown) {
      alert("删除失败: " + (err instanceof Error ? err.message : '删除失败'));
    }
  };

  // 搜索事件
  const handleSearch = () => {
    if (!searchTerm.trim()) return;
    setIsSearching(true);
  };

  // 清除搜索
  const handleClearSearch = () => {
    setIsSearching(false);
    setSearchTerm("");
  };

  // 搜索和筛选
  const filteredSoups = soups.filter((soup) => {
    const matchesSearch =
      soup.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      soup.type.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = !filterType || soup.type === filterType;
    return matchesSearch && matchesType;
  });

  // 排序
  const sortedSoups = [...filteredSoups].sort((a, b) => {
    let aValue: string;
    let bValue: string;
    switch (sortField) {
      case "name":
        aValue = a.name.toLowerCase();
        bValue = b.name.toLowerCase();
        break;
      case "type":
        aValue = a.type.toLowerCase();
        bValue = b.type.toLowerCase();
        break;
      default:
        aValue = a.name.toLowerCase();
        bValue = b.name.toLowerCase();
    }
    if (sortDirection === "asc") {
      return aValue > bValue ? 1 : aValue < bValue ? -1 : 0;
    } else {
      return aValue < bValue ? 1 : aValue > bValue ? -1 : 0;
    }
  });

  const handleSort = (field: "name" | "type") => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const soupTypes = [...new Set(soups.map((s) => s.type))];
  const totalSoups = soups.length;
  const uniqueTypes = soupTypes.length;

  // 本地分页
  const pagedSoups = sortedSoups.slice((page - 1) * pageSize, page * pageSize);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 sm:h-12 sm:w-12 border-b-2 border-orange-600 mx-auto mb-3 sm:mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400 text-sm sm:text-base lg:text-lg">正在加载汤品数据...</p>
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
                  <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white">汤品管理</h1>
                  <p className="text-xs sm:text-sm lg:text-base text-gray-600 dark:text-gray-400 mt-1">
                    管理系统中的所有汤品信息 • 共 {totalSoups} 款汤品
                  </p>
                </div>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-2 sm:space-y-0 sm:space-x-2 lg:space-x-3">
              <button
                onClick={() => router.push("/dashboard")}
                className="px-3 sm:px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-xl flex items-center justify-center font-medium transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 cursor-pointer text-xs sm:text-sm"
              >
                <FiHome className="mr-1 sm:mr-2 text-xs sm:text-sm" />
                <span className="hidden sm:inline">返回主页</span>
                <span className="sm:hidden">主页</span>
              </button>
              <button
                onClick={() => router.push("/soups/new")}
                className="px-3 sm:px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white rounded-xl flex items-center justify-center font-medium transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 cursor-pointer text-xs sm:text-sm"
              >
                <FiPlus className="mr-1 sm:mr-2 text-xs sm:text-sm" />
                <span className="hidden sm:inline">新增汤品</span>
                <span className="sm:hidden">新增</span>
              </button>
              <button
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="px-3 sm:px-4 py-2 bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white rounded-xl flex items-center justify-center font-medium transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer text-xs sm:text-sm"
              >
                <FiRefreshCw className={`mr-1 sm:mr-2 text-xs sm:text-sm ${isRefreshing ? "animate-spin" : ""}`} />
                <span className="hidden sm:inline">{isRefreshing ? "刷新中..." : "刷新"}</span>
                <span className="sm:hidden">{isRefreshing ? "刷新中" : "刷新"}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
        {/* 统计卡片 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-6 border border-gray-100 dark:border-gray-700 hover:shadow-xl transition-all duration-300 transform hover:scale-105">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400">总汤品数</p>
                <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white mt-1 sm:mt-2">{totalSoups}</p>
              </div>
              <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center">
                <FiCoffee className="text-white text-sm sm:text-base lg:text-xl" />
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-6 border border-gray-100 dark:border-gray-700 hover:shadow-xl transition-all duration-300 transform hover:scale-105">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400">汤品类型</p>
                <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-indigo-600 dark:text-indigo-400 mt-1 sm:mt-2">{uniqueTypes}</p>
              </div>
              <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl flex items-center justify-center">
                <FiBarChart className="text-white text-sm sm:text-base lg:text-xl" />
              </div>
            </div>
          </div>
        </div>

        {/* 搜索和筛选 */}
        <div className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-6 mb-6 sm:mb-8 border border-gray-100 dark:border-gray-700">
          <div className="flex flex-col lg:flex-row gap-3 sm:gap-4">
            {/* 搜索框 */}
            <div className="flex-1">
              <div className="relative">
                <FiSearch className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm sm:text-base lg:text-lg" />
                <input
                  type="text"
                  placeholder="搜索汤品名称或类型..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleSearch()}
                  className="w-full pl-10 sm:pl-12 pr-20 sm:pr-24 py-3 sm:py-4 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-4 focus:ring-orange-500/20 focus:border-orange-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm sm:text-base lg:text-lg transition-all duration-200"
                />
                <div className="absolute right-2 sm:right-4 top-1/2 transform -translate-y-1/2 flex space-x-1 sm:space-x-2">
                  <button
                    onClick={handleSearch}
                    className="px-2 sm:px-4 py-1 sm:py-2 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white rounded-lg font-medium shadow-md hover:shadow-lg transition-all duration-200 text-xs sm:text-sm cursor-pointer"
                  >
                    <span className="hidden sm:inline">搜索</span>
                    <span className="sm:hidden">搜</span>
                  </button>
                  <button
                    onClick={handleClearSearch}
                    disabled={!isSearching && !searchTerm}
                    className="px-2 sm:px-4 py-1 sm:py-2 bg-gradient-to-r from-gray-300 to-gray-400 hover:from-gray-400 hover:to-gray-500 text-gray-700 rounded-lg font-medium shadow-md hover:shadow-lg transition-all duration-200 text-xs sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
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
              className={`px-4 sm:px-6 py-3 sm:py-4 rounded-xl flex items-center justify-center transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 cursor-pointer text-sm sm:text-base ${showFilters
                  ? "bg-gradient-to-r from-orange-500 to-orange-600 text-white"
                  : "bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600 text-gray-700 dark:text-gray-300"
                }`}
            >
              <FiFilter className="mr-1 sm:mr-2 text-sm sm:text-base" />
              <span className="hidden sm:inline">筛选</span>
              <span className="sm:hidden">筛选</span>
            </button>
          </div>
          {/* 筛选选项 */}
          {showFilters && (
            <div className="mt-4 sm:mt-6 pt-4 sm:pt-6 border-t border-gray-200 dark:border-gray-700 animate-fadeIn">
              <div className="flex flex-wrap gap-3 sm:gap-4">
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 sm:mb-2">
                    汤品类型筛选
                  </label>
                  <select
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value)}
                    className="px-3 sm:px-4 py-2 sm:py-3 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-4 focus:ring-orange-500/20 focus:border-orange-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-all duration-200 cursor-pointer text-sm sm:text-base"
                  >
                    <option value="">全部类型</option>
                    {soupTypes.map((type) => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 汤品列表 */}
        <div className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl shadow-lg overflow-hidden border border-gray-100 dark:border-gray-700">
          <div className="px-4 sm:px-6 lg:px-8 py-4 sm:py-6 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-600">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white flex items-center">
                <FiPackage className="mr-2 sm:mr-3 text-orange-600 text-sm sm:text-base" />
                汤品列表
              </h2>
              <span className="bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200 px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium">
                {sortedSoups.length} 款汤品
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
          {filteredSoups.length === 0 ? (
            <div className="p-6 sm:p-8 lg:p-12 text-center">
              <div className="w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
                <FiCoffee className="text-gray-400 text-xl sm:text-2xl lg:text-3xl" />
              </div>
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white mb-2">
                {searchTerm || filterType ? "没有找到匹配的汤品" : "暂无汤品"}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6 sm:mb-8 max-w-md mx-auto text-sm sm:text-base">
                {searchTerm || filterType
                  ? "请尝试调整搜索条件或筛选条件"
                  : "开始添加第一个汤品，建立你的汤品体系"}
              </p>
              {!searchTerm && !filterType && (
                <button
                  onClick={() => router.push("/soups/new")}
                  className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-xl font-medium transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 cursor-pointer text-sm sm:text-base"
                >
                  <FiPlus className="inline mr-1 sm:mr-2 text-sm sm:text-base" />
                  <span className="hidden sm:inline">添加第一个汤品</span>
                  <span className="sm:hidden">添加汤品</span>
                </button>
              )}
              {(searchTerm || filterType) && (
                <button
                  onClick={handleClearSearch}
                  className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-xl font-medium transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 cursor-pointer text-sm sm:text-base"
                >
                  <span className="hidden sm:inline">清除搜索</span>
                  <span className="sm:hidden">清除</span>
                </button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th
                      className="px-4 sm:px-6 lg:px-8 py-3 sm:py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                      onClick={() => handleSort("name")}
                    >
                      <div className="flex items-center">
                        汤品名称
                        {sortField === "name" && (
                          <span className="ml-1 sm:ml-2 text-orange-500">
                            {sortDirection === "asc" ? "↑" : "↓"}
                          </span>
                        )}
                      </div>
                    </th>
                    <th
                      className="px-4 sm:px-6 lg:px-8 py-3 sm:py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                      onClick={() => handleSort("type")}
                    >
                      <div className="flex items-center">
                        汤品类型
                        {sortField === "type" && (
                          <span className="ml-1 sm:ml-2 text-orange-500">
                            {sortDirection === "asc" ? "↑" : "↓"}
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
                  {pagedSoups.map((soup, index) => (
                    <tr
                      key={soup.id}
                      className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200 transform hover:scale-[1.01]"
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      <td className="px-4 sm:px-6 lg:px-8 py-4 sm:py-6 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-orange-500 to-orange-600 rounded-full flex items-center justify-center mr-2 sm:mr-3 lg:mr-4">
                            <span className="text-white font-semibold text-xs sm:text-sm">
                              {soup.name.charAt(0)}
                            </span>
                          </div>
                          <div>
                            <div className="text-sm sm:text-base lg:text-lg font-semibold text-gray-900 dark:text-white">
                              {soup.name}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 sm:px-6 lg:px-8 py-4 sm:py-6 whitespace-nowrap">
                        <span className="inline-flex items-center px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium bg-gradient-to-r from-orange-100 to-orange-200 text-orange-800 dark:from-orange-900 dark:to-orange-800 dark:text-orange-200">
                          {soup.type}
                        </span>
                      </td>
                      <td className="px-4 sm:px-6 lg:px-8 py-4 sm:py-6 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end space-x-2 sm:space-x-3">
                          <button
                            onClick={() => router.push(`/soups/${soup.id}/edit`)}
                            className="p-1 sm:p-2 text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg transition-all duration-200 cursor-pointer"
                            title="编辑"
                          >
                            <FiEdit2 className="h-4 w-4 sm:h-5 sm:w-5" />
                          </button>
                          <button
                            onClick={() => handleDelete(soup.id, soup.name)}
                            className="p-1 sm:p-2 text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all duration-200 cursor-pointer"
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
          )}
        </div>
        {/* 分页组件 */}
        <div className="flex justify-center items-center py-6 sm:py-8 lg:py-10">
          <div className="w-full max-w-4xl">
            <Pagination
              total={sortedSoups.length}
              page={page}
              pageSize={pageSize}
              onPageChange={(p) => setPage(p)}
              onPageSizeChange={(s) => {
                setPageSize(s);
                setPage(1);
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
} 