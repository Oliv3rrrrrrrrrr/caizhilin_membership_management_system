'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { 
  FiArrowLeft, 
  FiUser, 
  FiPhone, 
  FiCreditCard, 
  FiPackage, 
  FiCalendar,
  FiEdit2,
  FiCoffee,
  FiTrendingUp,
  FiTrendingDown,
  FiClock,
  FiCheckCircle,
  FiAlertCircle
} from 'react-icons/fi';
import { getMembershipById } from '@/services/membershipService';
import { MembershipResponse } from '@/types/membership';

export default function MembershipDetailPage() {
  const router = useRouter();
  const params = useParams();
  const membershipId = parseInt(params.id as string);
  
  const [membership, setMembership] = useState<MembershipResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // 获取会员信息
  useEffect(() => {
    const fetchMembership = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        if (!token) {
          router.push('/login');
          return;
        }
        
        const data = await getMembershipById(membershipId, token);
        setMembership(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (membershipId) {
      fetchMembership();
    }
  }, [membershipId, router]);

  // 检查URL参数中的成功消息
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const success = urlParams.get('success');
    if (success === 'updated') {
      setSuccessMessage('会员信息更新成功！');
      // 清除URL参数
      window.history.replaceState({}, '', window.location.pathname);
      // 3秒后自动清除成功消息
      setTimeout(() => setSuccessMessage(''), 3000);
    }
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400 text-lg">正在加载会员信息...</p>
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
              <FiUser className="text-red-500 text-3xl" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
              会员不存在
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

  // 计算会员时长
  const membershipDuration = Math.floor((new Date().getTime() - new Date(membership.issueDate).getTime()) / (1000 * 60 * 60 * 24));
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
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg mr-4">
                  <FiUser className="text-white text-xl" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-white">会员详情</h1>
                  <p className="text-gray-600 dark:text-gray-400 mt-1">
                    查看会员 {membership.name} 的详细信息
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
                onClick={() => router.push(`/memberships/${membership.id}/edit`)}
                className="px-4 py-2 bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white rounded-xl flex items-center font-medium transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 cursor-pointer"
              >
                <FiEdit2 className="mr-2" />
                编辑会员
              </button>
              <button
                onClick={() => router.push(`/memberships/${membership.id}/soup-records`)}
                className="px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white rounded-xl flex items-center font-medium transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 cursor-pointer"
              >
                <FiCoffee className="mr-2" />
                喝汤记录
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* 会员状态卡片 */}
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
                    <p className="text-white/80 text-lg">会员ID: {membership.id}</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-white font-bold text-xl mb-1">{membership.cardNumber}</div>
                  <div className="text-white/80">{membership.cardType}</div>
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
                <div className="flex items-center space-x-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">
                      {membership.remainingSoups}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">剩余次数</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">
                      {membershipDuration}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">会员天数</div>
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

        {/* 详细信息网格 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* 基本信息 */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 border border-gray-100 dark:border-gray-700">
            <div className="flex items-center mb-6">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center mr-4">
                <FiUser className="text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">基本信息</h3>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center p-4 bg-gray-50 dark:bg-gray-700 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
                <FiUser className="text-blue-500 mr-4 text-lg" />
                <div className="flex-1">
                  <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">姓名</div>
                  <div className="font-semibold text-gray-900 dark:text-white text-lg">{membership.name}</div>
                </div>
              </div>

              <div className="flex items-center p-4 bg-gray-50 dark:bg-gray-700 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
                <FiPhone className="text-green-500 mr-4 text-lg" />
                <div className="flex-1">
                  <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">手机号</div>
                  <div className="font-semibold text-gray-900 dark:text-white text-lg">{membership.phone}</div>
                </div>
              </div>

              <div className="flex items-center p-4 bg-gray-50 dark:bg-gray-700 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
                <FiCreditCard className="text-purple-500 mr-4 text-lg" />
                <div className="flex-1">
                  <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">卡号</div>
                  <div className="font-semibold text-gray-900 dark:text-white text-lg">{membership.cardNumber}</div>
                </div>
              </div>

              <div className="flex items-center p-4 bg-gray-50 dark:bg-gray-700 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
                <FiCreditCard className="text-indigo-500 mr-4 text-lg" />
                <div className="flex-1">
                  <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">卡类型</div>
                  <div className="font-semibold text-gray-900 dark:text-white text-lg">{membership.cardType}</div>
                </div>
              </div>
            </div>
          </div>

          {/* 业务信息 */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 border border-gray-100 dark:border-gray-700">
            <div className="flex items-center mb-6">
              <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center mr-4">
                <FiTrendingUp className="text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">业务信息</h3>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center p-4 bg-gray-50 dark:bg-gray-700 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
                <FiPackage className={`mr-4 text-lg ${
                  isActive ? 'text-green-500' : 'text-red-500'
                }`} />
                <div className="flex-1">
                  <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">剩余汤品</div>
                  <div className={`font-semibold text-lg ${
                    isActive 
                      ? 'text-green-600 dark:text-green-400' 
                      : 'text-red-600 dark:text-red-400'
                  }`}>
                    {membership.remainingSoups} 次
                  </div>
                </div>
                {isActive ? (
                  <FiCheckCircle className="text-green-500 text-xl" />
                ) : (
                  <FiAlertCircle className="text-red-500 text-xl" />
                )}
              </div>

              <div className="flex items-center p-4 bg-gray-50 dark:bg-gray-700 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
                <FiCalendar className="text-blue-500 mr-4 text-lg" />
                <div className="flex-1">
                  <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">发卡日期</div>
                  <div className="font-semibold text-gray-900 dark:text-white text-lg">
                    {new Date(membership.issueDate).toLocaleDateString('zh-CN')}
                  </div>
                </div>
              </div>

              <div className="flex items-center p-4 bg-gray-50 dark:bg-gray-700 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
                <FiClock className="text-orange-500 mr-4 text-lg" />
                <div className="flex-1">
                  <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">会员时长</div>
                  <div className="font-semibold text-gray-900 dark:text-white text-lg">
                    {membershipDuration} 天
                  </div>
                </div>
              </div>

              <div className="flex items-center p-4 bg-gray-50 dark:bg-gray-700 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
                <FiTrendingDown className="text-purple-500 mr-4 text-lg" />
                <div className="flex-1">
                  <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">使用情况</div>
                  <div className="font-semibold text-gray-900 dark:text-white text-lg">
                    {isActive ? '正常使用中' : '已用完'}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 快速操作 */}
        <div className="mt-8 bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 border border-gray-100 dark:border-gray-700">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">快速操作</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              onClick={() => router.push(`/memberships/${membership.id}/edit`)}
              className="p-6 bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-xl border border-blue-200 dark:border-blue-700 hover:from-blue-100 hover:to-blue-200 dark:hover:from-blue-800/30 dark:hover:to-blue-700/30 transition-all duration-200 transform hover:scale-105 cursor-pointer"
            >
              <div className="flex items-center">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center mr-4">
                  <FiEdit2 className="text-white text-xl" />
                </div>
                <div className="text-left">
                  <div className="font-semibold text-gray-900 dark:text-white">编辑会员</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">修改会员信息</div>
                </div>
              </div>
            </button>

            <button
              onClick={() => router.push(`/memberships/${membership.id}/soup-records`)}
              className="p-6 bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-xl border border-green-200 dark:border-green-700 hover:from-green-100 hover:to-green-200 dark:hover:from-green-800/30 dark:hover:to-green-700/30 transition-all duration-200 transform hover:scale-105 cursor-pointer"
            >
              <div className="flex items-center">
                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center mr-4">
                  <FiCoffee className="text-white text-xl" />
                </div>
                <div className="text-left">
                  <div className="font-semibold text-gray-900 dark:text-white">喝汤记录</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">查看使用记录</div>
                </div>
              </div>
            </button>

            <button
              onClick={() => router.push('/memberships')}
              className="p-6 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-600 rounded-xl border border-gray-200 dark:border-gray-600 hover:from-gray-100 hover:to-gray-200 dark:hover:from-gray-600 dark:hover:to-gray-500 transition-all duration-200 transform hover:scale-105 cursor-pointer"
            >
              <div className="flex items-center">
                <div className="w-12 h-12 bg-gradient-to-br from-gray-500 to-gray-600 rounded-xl flex items-center justify-center mr-4">
                  <FiArrowLeft className="text-white text-xl" />
                </div>
                <div className="text-left">
                  <div className="font-semibold text-gray-900 dark:text-white">返回会员列表</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">查看所有会员</div>
                </div>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 