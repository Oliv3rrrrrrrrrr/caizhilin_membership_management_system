'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import {
  FiArrowLeft,
  FiCoffee,
  FiPackage,
  FiUser,
  FiCalendar,
  FiClock,
  FiEdit2,
  FiTrash2,
  FiCheckCircle,
  FiAlertCircle,
  FiTrendingUp,
  FiCreditCard,
  FiPhone
} from 'react-icons/fi';
import { getSoupRecordById, deleteSoupRecord } from '@/services/soupRecordService';
import { SoupRecordWithDetailsResponse } from '@/types/soupRecord';

// 格式化时间显示
function formatSystemTime(timestamp: string | Date): string {
  const date = typeof timestamp === 'string' ? new Date(timestamp) : timestamp;
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  });
}

// 格式化日期显示
function formatSystemDate(timestamp: string | Date): string {
  const date = typeof timestamp === 'string' ? new Date(timestamp) : timestamp;
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });
}

export default function SoupRecordDetailPage() {
  const router = useRouter();
  const params = useParams();
  const recordId = parseInt(params.id as string);

  const [record, setRecord] = useState<SoupRecordWithDetailsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // 获取喝汤记录详情
  useEffect(() => {
    const fetchRecord = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        if (!token) {
          router.push('/login');
          return;
        }

        const data = await getSoupRecordById(recordId, token);
        setRecord(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (recordId) {
      fetchRecord();
    }
  }, [recordId, router]);

  // 检查URL参数中的成功消息
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const success = urlParams.get('success');
    if (success === 'updated') {
      setSuccessMessage('喝汤记录更新成功！');
      window.history.replaceState({}, '', window.location.pathname);
      setTimeout(() => setSuccessMessage(''), 3000);
    }
  }, []);

  // 删除记录
  const handleDelete = async () => {
    if (!record) return;

    if (!confirm(`确定要删除这条喝汤记录吗？此操作不可恢复。`)) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/login');
        return;
      }

      await deleteSoupRecord(record.id, token);
      router.push(`/memberships/${record.membership.id}/soup-records?success=deleted`);
    } catch (err: any) {
      alert('删除失败: ' + err.message);
    }
  };

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

  if (error || !record) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
        <div className="max-w-2xl mx-auto px-6 py-12">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 text-center border border-gray-100 dark:border-gray-700">
            <div className="w-20 h-20 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <FiAlertCircle className="text-red-500 text-3xl" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
              记录不存在
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-8 text-lg">
              {error || '找不到指定的喝汤记录'}
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

  // 格式化时间
  const drinkDate = new Date(record.drinkTime);
  const formattedDate = formatSystemDate(drinkDate);
  const formattedTime = formatSystemTime(drinkDate);

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
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-white">喝汤记录详情</h1>
                  <p className="text-gray-600 dark:text-gray-400 mt-1">
                    查看喝汤记录的详细信息
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
                onClick={() => router.push(`/soup-records/${record.id}/edit`)}
                className="px-4 py-2 bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white rounded-xl flex items-center font-medium transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 cursor-pointer"
              >
                <FiEdit2 className="mr-2" />
                编辑记录
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white rounded-xl flex items-center font-medium transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 cursor-pointer"
              >
                <FiTrash2 className="mr-2" />
                删除记录
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

        {/* 主要信息卡片 */}
        <div className="mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden border border-gray-100 dark:border-gray-700">
            <div className="px-8 py-6 bg-gradient-to-r from-orange-500 to-orange-600">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mr-6">
                    <FiPackage className="text-white text-2xl" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-white mb-1">{record.soup.name}</h2>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-white font-bold text-xl mb-1">{record.soup.type}</div>
                  <div className="text-white/80">汤品类型</div>
                </div>
              </div>
            </div>

            {/* 状态指示器 */}
            <div className="px-8 py-6 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-600">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-4 h-4 rounded-full mr-3 bg-green-500"></div>
                  <div>
                    <p className="text-lg font-semibold text-gray-900 dark:text-white">
                      记录状态正常
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      喝汤记录已成功创建并扣除会员次数
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 详细信息网格 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* 喝汤信息 */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 border border-gray-100 dark:border-gray-700">
            <div className="flex items-center mb-6">
              <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center mr-4">
                <FiCoffee className="text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">喝汤信息</h3>
            </div>

            <div className="space-y-4">
              <div className="flex items-center p-4 bg-gray-50 dark:bg-gray-700 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
                <FiPackage className="text-orange-500 mr-4 text-lg" />
                <div className="flex-1">
                  <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">汤品名称</div>
                  <div className="font-semibold text-gray-900 dark:text-white text-lg">{record.soup.name}</div>
                </div>
              </div>

              <div className="flex items-center p-4 bg-gray-50 dark:bg-gray-700 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
                <FiTrendingUp className="text-blue-500 mr-4 text-lg" />
                <div className="flex-1">
                  <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">汤品类型</div>
                  <div className="font-semibold text-gray-900 dark:text-white text-lg">{record.soup.type}</div>
                </div>
              </div>

              <div className="flex items-center p-4 bg-gray-50 dark:bg-gray-700 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
                <FiCalendar className="text-green-500 mr-4 text-lg" />
                <div className="flex-1">
                  <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">喝汤日期</div>
                  <div className="font-semibold text-gray-900 dark:text-white text-lg">{formattedDate}</div>
                </div>
              </div>

              <div className="flex items-center p-4 bg-gray-50 dark:bg-gray-700 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
                <FiClock className="text-purple-500 mr-4 text-lg" />
                <div className="flex-1">
                  <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">喝汤时间</div>
                  <div className="font-semibold text-gray-900 dark:text-white text-lg">{formattedTime}</div>
                </div>
              </div>
            </div>
          </div>

          {/* 会员信息 */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 border border-gray-100 dark:border-gray-700">
            <div className="flex items-center mb-6">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center mr-4">
                <FiUser className="text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">会员信息</h3>
            </div>

            <div className="space-y-4">
              <div className="flex items-center p-4 bg-gray-50 dark:bg-gray-700 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
                <FiUser className="text-blue-500 mr-4 text-lg" />
                <div className="flex-1">
                  <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">会员姓名</div>
                  <div className="font-semibold text-gray-900 dark:text-white text-lg">{record.membership.name}</div>
                </div>
              </div>

              <div className="flex items-center p-4 bg-gray-50 dark:bg-gray-700 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
                <FiPhone className="text-green-500 mr-4 text-lg" />
                <div className="flex-1">
                  <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">手机号</div>
                  <div className="font-semibold text-gray-900 dark:text-white text-lg">{record.membership.phone}</div>
                </div>
              </div>

              <div className="flex items-center p-4 bg-gray-50 dark:bg-gray-700 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
                <FiCreditCard className="text-purple-500 mr-4 text-lg" />
                <div className="flex-1">
                  <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">卡号</div>
                  <div className="font-semibold text-gray-900 dark:text-white text-lg">{record.membership.cardNumber}</div>
                </div>
              </div>

              <div className="flex items-center p-4 bg-gray-50 dark:bg-gray-700 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
                <FiPackage className="text-orange-500 mr-4 text-lg" />
                <div className="flex-1">
                  <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">剩余次数</div>
                  <div className={`font-semibold text-lg ${record.membership.remainingSoups > 0
                    ? 'text-green-600 dark:text-green-400'
                    : 'text-red-600 dark:text-red-400'
                    }`}>
                    {record.membership.remainingSoups} 次
                  </div>
                </div>
                {record.membership.remainingSoups > 0 ? (
                  <FiCheckCircle className="text-green-500 text-xl" />
                ) : (
                  <FiAlertCircle className="text-red-500 text-xl" />
                )}
              </div>
            </div>
          </div>
        </div>

        {/* 快速操作 */}
        <div className="mt-8 bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 border border-gray-100 dark:border-gray-700">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">快速操作</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              onClick={() => router.push(`/soup-records/${record.id}/edit`)}
              className="p-6 bg-gradient-to-r from-indigo-50 to-indigo-100 dark:from-indigo-900/20 dark:to-indigo-800/20 rounded-xl border border-indigo-200 dark:border-indigo-700 hover:from-indigo-100 hover:to-indigo-200 dark:hover:from-indigo-800/30 dark:hover:to-indigo-700/30 transition-all duration-200 transform hover:scale-105 cursor-pointer"
            >
              <div className="flex items-center">
                <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl flex items-center justify-center mr-4">
                  <FiEdit2 className="text-white text-xl" />
                </div>
                <div className="text-left">
                  <div className="font-semibold text-gray-900 dark:text-white">编辑记录</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">修改喝汤信息</div>
                </div>
              </div>
            </button>

            <button
              onClick={() => router.push(`/memberships/${record.membership.id}/soup-records`)}
              className="p-6 bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-xl border border-green-200 dark:border-green-700 hover:from-green-100 hover:to-green-200 dark:hover:from-green-800/30 dark:hover:to-green-700/30 transition-all duration-200 transform hover:scale-105 cursor-pointer"
            >
              <div className="flex items-center">
                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center mr-4">
                  <FiCoffee className="text-white text-xl" />
                </div>
                <div className="text-left">
                  <div className="font-semibold text-gray-900 dark:text-white">会员喝汤记录</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">查看该会员所有喝汤记录</div>
                </div>
              </div>
            </button>

            <button
              onClick={() => router.push(`/memberships/${record.membership.id}`)}
              className="p-6 bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-xl border border-blue-200 dark:border-blue-700 hover:from-blue-100 hover:to-blue-200 dark:hover:from-blue-800/30 dark:hover:to-blue-700/30 transition-all duration-200 transform hover:scale-105 cursor-pointer"
            >
              <div className="flex items-center">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center mr-4">
                  <FiUser className="text-white text-xl" />
                </div>
                <div className="text-left">
                  <div className="font-semibold text-gray-900 dark:text-white">会员详情</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">查看会员信息</div>
                </div>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 