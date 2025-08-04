'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import {
  FiArrowLeft,
  FiCoffee,
  FiPackage,
  FiClock,
  FiPlus,
  FiCheckCircle,
  FiAlertCircle
} from 'react-icons/fi';
import { getMembershipById } from '@/services/membershipService';
import { createSoupRecord } from '@/services/soupRecordService';
import { getAllSoups } from '@/services/soupService';
import { MembershipResponse } from '@/types/membership';
import { SoupResponse } from '@/types/soup';
import { CreateSoupRecordRequest } from '@/types/soupRecord';

function getSystemDateTimeLocal(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

export default function NewSoupRecordPage() {
  const router = useRouter();
  const params = useParams();
  const membershipId = parseInt(params.id as string);

  const [membership, setMembership] = useState<MembershipResponse | null>(null);
  const [soups, setSoups] = useState<SoupResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState<CreateSoupRecordRequest>({
    membershipId: membershipId,
    soupId: 0,
    drinkTime: getSystemDateTimeLocal()
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  // 获取会员信息和汤品列表
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        if (!token) {
          router.push('/login');
          return;
        }

        // 并行获取会员信息和汤品列表
        const [membershipData, soupsData] = await Promise.all([
          getMembershipById(membershipId, token),
          getAllSoups(token)
        ]);

        setMembership(membershipData);
        setSoups(soupsData);

        // 设置默认汤品
        if (soupsData.length > 0) {
          setFormData(prev => ({ ...prev, soupId: soupsData[0].id }));
        }
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : '获取数据失败');
      } finally {
        setLoading(false);
      }
    };

    if (membershipId) {
      fetchData();
    }
  }, [membershipId, router]);

  // 表单验证
  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.soupId) {
      newErrors.soupId = '请选择汤品';
    }

    if (!formData.drinkTime) {
      newErrors.drinkTime = '请选择喝汤时间';
    } else {
      // 将datetime-local格式转换为Date对象进行比较
      const selectedTime = new Date(formData.drinkTime + ':00'); // 添加秒数
      const now = new Date(); // Changed from getSystemNow()

      if (selectedTime > now) {
        newErrors.drinkTime = '喝汤时间不能晚于当前时间';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // 处理表单提交
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!validateForm()) {
      return;
    }

    try {
      setSaving(true);
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/login');
        return;
      }

      // 确保时间格式正确（添加秒数）
      const submitData = {
        ...formData,
        drinkTime: formData.drinkTime + ':00'
      };

      await createSoupRecord(submitData, token);
      router.push(`/memberships/${membershipId}/soup-records?success=created`);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : '创建喝汤记录失败');
    } finally {
      setSaving(false);
    }
  };

  // 处理输入变化
  const handleInputChange = (field: keyof CreateSoupRecordRequest, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // 清除对应字段的错误
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  // 处理取消
  const handleCancel = () => {
    const defaultTime = getSystemDateTimeLocal();
    if (Object.keys(errors).length > 0 || formData.soupId !== 0 || formData.drinkTime !== defaultTime) {
      if (confirm('您有未保存的修改，确定要取消吗？')) {
        router.back();
      }
    } else {
      router.back();
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400 text-lg">正在加载数据...</p>
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

  const selectedSoup = soups.find(soup => soup.id === formData.soupId);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      {/* 页面头部 */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
            <div className="flex items-center space-x-2 sm:space-x-4">
              <button
                onClick={handleCancel}
                className="p-2 sm:p-3 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-all duration-200 cursor-pointer"
              >
                <FiArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
              <div className="flex items-center">
                <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg mr-2 sm:mr-3 lg:mr-4">
                  <FiPlus className="text-white text-sm sm:text-base lg:text-xl" />
                </div>
                <div>
                  <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white">新增喝汤记录</h1>
                  <p className="text-xs sm:text-sm lg:text-base text-gray-600 dark:text-gray-400 mt-1">
                    为会员 {membership.name} 添加新的喝汤记录
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
              <button
                onClick={() => router.push(`/memberships/${membershipId}/soup-records`)}
                className="px-3 sm:px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white rounded-xl flex items-center justify-center font-medium transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 cursor-pointer text-xs sm:text-sm"
              >
                <FiCoffee className="mr-1 sm:mr-2 text-xs sm:text-sm" />
                <span className="hidden sm:inline">返回喝汤记录</span>
                <span className="sm:hidden">记录</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
        {/* 会员信息卡片 */}
        <div className="mb-6 sm:mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-6 border border-gray-100 dark:border-gray-700">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
              <div className="flex items-center">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center mr-3 sm:mr-4">
                  <FiCoffee className="text-white text-sm sm:text-base lg:text-xl" />
                </div>
                <div>
                  <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">{membership.name}</h2>
                  <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">{membership.cardNumber} • {membership.cardType}</p>
                </div>
              </div>
              <div className="text-left sm:text-right">
                <div className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                  {membership.remainingSoups} 次
                </div>
                <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">剩余汤品</div>
              </div>
            </div>
          </div>
        </div>

        {/* 表单卡片 */}
        <div className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-6 lg:p-8 border border-gray-100 dark:border-gray-700">
          {/* 表单头部 */}
          <div className="mb-6 sm:mb-8">
            <div className="flex items-center mb-3 sm:mb-4">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center mr-3 sm:mr-4">
                <FiPackage className="text-white text-sm sm:text-base" />
              </div>
              <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">喝汤记录信息</h2>
            </div>
            <p className="text-xs sm:text-sm lg:text-base text-gray-600 dark:text-gray-400">
              请填写喝汤记录的基本信息，所有带 * 的字段为必填项
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
              {/* 汤品选择 */}
              <div className="lg:col-span-2">
                <label className="block text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 sm:mb-3 flex items-center">
                  <FiPackage className="mr-1 sm:mr-2 text-orange-500 text-xs sm:text-sm" />
                  选择汤品 *
                </label>
                <div className="relative">
                  <select
                    value={formData.soupId}
                    onChange={(e) => handleInputChange('soupId', parseInt(e.target.value))}
                    className={`w-full px-3 sm:px-4 py-3 sm:py-4 border-2 rounded-xl focus:ring-4 focus:ring-orange-500/20 focus:border-orange-500 transition-all duration-200 text-sm sm:text-base lg:text-lg appearance-none cursor-pointer ${errors.soupId
                      ? 'border-red-300 dark:border-red-600 bg-red-50 dark:bg-red-900/20'
                      : 'border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 hover:border-gray-300 dark:hover:border-gray-500'
                      } text-gray-900 dark:text-white`}
                  >
                    <option value={0}>请选择汤品</option>
                    {soups.map(soup => (
                      <option key={soup.id} value={soup.id}>
                        {soup.name} ({soup.type})
                      </option>
                    ))}
                  </select>
                  <div className="absolute right-3 sm:right-4 top-1/2 transform -translate-y-1/2 pointer-events-none">
                    <svg className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                  {errors.soupId && (
                    <div className="absolute right-10 sm:right-12 top-1/2 transform -translate-y-1/2">
                      <FiAlertCircle className="text-red-500 text-lg sm:text-xl" />
                    </div>
                  )}
                </div>
                {errors.soupId && (
                  <p className="mt-2 text-xs sm:text-sm text-red-600 dark:text-red-400 flex items-center">
                    <FiAlertCircle className="mr-1 text-xs sm:text-sm" />
                    {errors.soupId}
                  </p>
                )}
              </div>

              {/* 喝汤时间 */}
              <div className="lg:col-span-2">
                <label className="block text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 sm:mb-3 flex items-center">
                  <FiClock className="mr-1 sm:mr-2 text-blue-500 text-xs sm:text-sm" />
                  喝汤时间 *
                </label>
                <div className="relative">
                  <input
                    type="datetime-local"
                    value={formData.drinkTime}
                    onChange={(e) => handleInputChange('drinkTime', e.target.value)}
                    className={`w-full px-3 sm:px-4 py-3 sm:py-4 border-2 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 text-sm sm:text-base lg:text-lg ${errors.drinkTime
                      ? 'border-red-300 dark:border-red-600 bg-red-50 dark:bg-red-900/20'
                      : 'border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 hover:border-gray-300 dark:hover:border-gray-500'
                      } text-gray-900 dark:text-white`}
                  />
                  {errors.drinkTime && (
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                      <FiAlertCircle className="text-red-500 text-lg sm:text-xl" />
                    </div>
                  )}
                </div>
                {errors.drinkTime && (
                  <p className="mt-2 text-xs sm:text-sm text-red-600 dark:text-red-400 flex items-center">
                    <FiAlertCircle className="mr-1 text-xs sm:text-sm" />
                    {errors.drinkTime}
                  </p>
                )}
              </div>
            </div>

            {/* 选中汤品信息 */}
            {selectedSoup && (
              <div className="p-3 sm:p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
                <div className="flex items-center">
                  <div className="w-6 h-6 sm:w-8 sm:h-8 bg-blue-100 dark:bg-blue-800 rounded-full flex items-center justify-center mr-2 sm:mr-3">
                    <FiPackage className="text-blue-600 dark:text-blue-400 text-xs sm:text-sm" />
                  </div>
                  <div>
                    <p className="text-xs sm:text-sm font-medium text-blue-800 dark:text-blue-200">
                      已选择汤品
                    </p>
                    <p className="text-xs text-blue-600 dark:text-blue-400">
                      {selectedSoup.name} • {selectedSoup.type}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* 错误信息 */}
            {error && (
              <div className="p-3 sm:p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
                <div className="flex items-center">
                  <FiAlertCircle className="text-red-500 mr-2 sm:mr-3 text-lg sm:text-xl" />
                  <p className="text-red-600 dark:text-red-400 font-medium text-sm sm:text-base">{error}</p>
                </div>
              </div>
            )}

            {/* 操作按钮 */}
            <div className="flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-4 pt-6 sm:pt-8 border-t border-gray-200 dark:border-gray-700">
              <button
                type="button"
                onClick={handleCancel}
                className="w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 border-2 border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-gray-300 dark:hover:border-gray-500 transition-all duration-200 font-medium cursor-pointer text-sm sm:text-base"
              >
                取消
              </button>
              <button
                type="submit"
                disabled={saving}
                className="w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 disabled:from-gray-400 disabled:to-gray-500 text-white rounded-xl transition-all duration-200 flex items-center justify-center font-medium shadow-lg hover:shadow-xl transform hover:scale-105 disabled:transform-none disabled:cursor-not-allowed cursor-pointer text-sm sm:text-base"
              >
                {saving ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 sm:h-5 sm:w-5 border-b-2 border-white mr-2 sm:mr-3"></div>
                    创建中...
                  </>
                ) : (
                  <>
                    <FiPlus className="mr-2 text-sm sm:text-base" />
                    创建记录
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* 提示信息 */}
        <div className="mt-6 sm:mt-8 bg-blue-50 dark:bg-blue-900/20 rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-blue-200 dark:border-blue-800">
          <div className="flex items-start">
            <div className="w-6 h-6 sm:w-8 sm:h-8 bg-blue-100 dark:bg-blue-800 rounded-full flex items-center justify-center mr-3 sm:mr-4 mt-0.5 sm:mt-1">
              <FiCheckCircle className="text-blue-600 dark:text-blue-400 text-xs sm:text-sm" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-semibold text-blue-800 dark:text-blue-200 mb-2">
                创建喝汤记录提示
              </h3>
              <ul className="text-blue-700 dark:text-blue-300 space-y-1 text-xs sm:text-sm">
                <li>• 选择会员要喝的汤品类型</li>
                <li>• 设置准确的喝汤时间，不能晚于当前时间</li>
                <li>• 创建记录后会自动扣除会员的剩余汤品次数</li>
                <li>• 记录创建后可以在喝汤记录列表中查看</li>
                <li>• 如需修改记录，可以在记录列表中进行编辑</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 