'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  FiArrowLeft,
  FiUser,
  FiPhone,
  FiCreditCard,
  FiPackage,
  FiPlus,
  FiCheckCircle,
  FiAlertCircle,
  FiUsers
} from 'react-icons/fi';
import { createMembership } from '@/services/membershipService';
import { CreateMembershipRequest } from '@/types/membership';

export default function NewMembershipPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState<CreateMembershipRequest>({
    name: '',
    phone: '',
    cardType: '',
    remainingSoups: 0
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  // 表单验证
  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.name.trim()) {
      newErrors.name = '姓名不能为空';
    } else if (formData.name.length < 2 || formData.name.length > 20) {
      newErrors.name = '姓名长度必须在2-20个字符之间';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = '手机号不能为空';
    } else if (!/^1[3-9]\d{9}$/.test(formData.phone)) {
      newErrors.phone = '请输入正确的手机号格式';
    }

    if (!formData.cardType.trim()) {
      newErrors.cardType = '卡类型不能为空';
    }

    if (formData.remainingSoups < 0) {
      newErrors.remainingSoups = '剩余汤品数量不能为负数';
    }

    if (formData.remainingSoups > 1000) {
      newErrors.remainingSoups = '剩余汤品数量不能大于1000';
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
      setLoading(true);
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/login');
        return;
      }

      await createMembership(formData, token);
      router.push('/memberships?success=created');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : '创建会员失败');
    } finally {
      setLoading(false);
    }
  };

  // 处理输入变化
  const handleInputChange = (field: keyof CreateMembershipRequest, value: string | number) => {
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
                <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg mr-2 sm:mr-3 lg:mr-4">
                  <FiPlus className="text-white text-sm sm:text-base lg:text-xl" />
                </div>
                <div>
                  <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white">新增会员</h1>
                  <p className="text-xs sm:text-sm lg:text-base text-gray-600 dark:text-gray-400 mt-1">
                    添加新的会员信息到系统
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
                onClick={() => router.push('/memberships')}
                className="px-3 sm:px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white rounded-xl flex items-center justify-center font-medium transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 cursor-pointer text-xs sm:text-sm"
              >
                <FiUsers className="mr-1 sm:mr-2 text-xs sm:text-sm" />
                <span className="hidden sm:inline">会员列表</span>
                <span className="sm:hidden">列表</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
        {/* 表单卡片 */}
        <div className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-6 lg:p-8 border border-gray-100 dark:border-gray-700">
          {/* 表单头部 */}
          <div className="mb-6 sm:mb-8">
            <div className="flex items-center mb-3 sm:mb-4">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center mr-3 sm:mr-4">
                <FiUser className="text-white text-sm sm:text-base" />
              </div>
              <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">会员信息</h2>
            </div>
            <p className="text-xs sm:text-sm lg:text-base text-gray-600 dark:text-gray-400">
              请填写会员的基本信息，所有带 * 的字段为必填项
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
              {/* 姓名 */}
              <div className="lg:col-span-2">
                <label className="block text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 sm:mb-3 flex items-center">
                  <FiUser className="mr-1 sm:mr-2 text-blue-500 text-xs sm:text-sm" />
                  会员姓名 *
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    className={`w-full px-3 sm:px-4 py-3 sm:py-4 border-2 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 text-sm sm:text-base lg:text-lg ${errors.name
                        ? 'border-red-300 dark:border-red-600 bg-red-50 dark:bg-red-900/20'
                        : 'border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 hover:border-gray-300 dark:hover:border-gray-500'
                      } text-gray-900 dark:text-white`}
                    placeholder="请输入会员姓名"
                  />
                  {errors.name && (
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                      <FiAlertCircle className="text-red-500 text-lg sm:text-xl" />
                    </div>
                  )}
                </div>
                {errors.name && (
                  <p className="mt-2 text-xs sm:text-sm text-red-600 dark:text-red-400 flex items-center">
                    <FiAlertCircle className="mr-1 text-xs sm:text-sm" />
                    {errors.name}
                  </p>
                )}
              </div>

              {/* 手机号 */}
              <div>
                <label className="block text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 sm:mb-3 flex items-center">
                  <FiPhone className="mr-1 sm:mr-2 text-green-500 text-xs sm:text-sm" />
                  手机号 *
                </label>
                <div className="relative">
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    className={`w-full px-3 sm:px-4 py-3 sm:py-4 border-2 rounded-xl focus:ring-4 focus:ring-green-500/20 focus:border-green-500 transition-all duration-200 text-sm sm:text-base lg:text-lg ${errors.phone
                        ? 'border-red-300 dark:border-red-600 bg-red-50 dark:bg-red-900/20'
                        : 'border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 hover:border-gray-300 dark:hover:border-gray-500'
                      } text-gray-900 dark:text-white`}
                    placeholder="请输入手机号"
                  />
                  {errors.phone && (
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                      <FiAlertCircle className="text-red-500 text-lg sm:text-xl" />
                    </div>
                  )}
                </div>
                {errors.phone && (
                  <p className="mt-2 text-xs sm:text-sm text-red-600 dark:text-red-400 flex items-center">
                    <FiAlertCircle className="mr-1 text-xs sm:text-sm" />
                    {errors.phone}
                  </p>
                )}
              </div>

              {/* 卡类型 */}
              <div>
                <label className="block text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 sm:mb-3 flex items-center">
                  <FiCreditCard className="mr-1 sm:mr-2 text-purple-500 text-xs sm:text-sm" />
                  卡类型 *
                </label>
                <div className="relative">
                  <select
                    value={formData.cardType}
                    onChange={(e) => handleInputChange('cardType', e.target.value)}
                    className={`w-full px-3 sm:px-4 py-3 sm:py-4 border-2 rounded-xl focus:ring-4 focus:ring-purple-500/20 focus:border-purple-500 transition-all duration-200 text-sm sm:text-base lg:text-lg appearance-none cursor-pointer ${errors.cardType
                        ? 'border-red-300 dark:border-red-600 bg-red-50 dark:bg-red-900/20'
                        : 'border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 hover:border-gray-300 dark:hover:border-gray-500'
                      } text-gray-900 dark:text-white`}
                  >
                    <option value="">请选择卡类型</option>
                    <option value="350卡">350卡</option>
                    <option value="500卡">500卡</option>
                    <option value="1000卡">1000卡</option>
                  </select>
                  <div className="absolute right-3 sm:right-4 top-1/2 transform -translate-y-1/2 pointer-events-none">
                    <svg className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                  {errors.cardType && (
                    <div className="absolute right-10 sm:right-12 top-1/2 transform -translate-y-1/2">
                      <FiAlertCircle className="text-red-500 text-lg sm:text-xl" />
                    </div>
                  )}
                </div>
                {errors.cardType && (
                  <p className="mt-2 text-xs sm:text-sm text-red-600 dark:text-red-400 flex items-center">
                    <FiAlertCircle className="mr-1 text-xs sm:text-sm" />
                    {errors.cardType}
                  </p>
                )}
              </div>

              {/* 剩余汤品数量 */}
              <div className="lg:col-span-2">
                <label className="block text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 sm:mb-3 flex items-center">
                  <FiPackage className="mr-1 sm:mr-2 text-orange-500 text-xs sm:text-sm" />
                  剩余汤品数量 *
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="0"
                    onChange={(e) => handleInputChange('remainingSoups', parseInt(e.target.value) || 0)}
                    className={`w-full px-3 sm:px-4 py-3 sm:py-4 border-2 rounded-xl focus:ring-4 focus:ring-orange-500/20 focus:border-orange-500 transition-all duration-200 text-sm sm:text-base lg:text-lg ${errors.remainingSoups
                        ? 'border-red-300 dark:border-red-600 bg-red-50 dark:bg-red-900/20'
                        : 'border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 hover:border-gray-300 dark:hover:border-gray-500'
                      } text-gray-900 dark:text-white`}
                    placeholder="请输入剩余汤品数量"
                  />
                  {errors.remainingSoups && (
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                      <FiAlertCircle className="text-red-500 text-lg sm:text-xl" />
                    </div>
                  )}
                </div>
                {errors.remainingSoups && (
                  <p className="mt-2 text-xs sm:text-sm text-red-600 dark:text-red-400 flex items-center">
                    <FiAlertCircle className="mr-1 text-xs sm:text-sm" />
                    {errors.remainingSoups}
                  </p>
                )}
              </div>
            </div>

            {/* 错误提示 */}
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
                onClick={() => router.back()}
                className="w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 border-2 border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-gray-300 dark:hover:border-gray-500 transition-all duration-200 font-medium cursor-pointer text-sm sm:text-base"
              >
                取消
              </button>
              <button
                type="submit"
                disabled={loading}
                className="w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 disabled:from-gray-400 disabled:to-gray-500 text-white rounded-xl transition-all duration-200 flex items-center justify-center font-medium shadow-lg hover:shadow-xl transform hover:scale-105 disabled:transform-none disabled:cursor-not-allowed cursor-pointer text-sm sm:text-base"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 sm:h-5 sm:w-5 border-b-2 border-white mr-2 sm:mr-3"></div>
                    创建中...
                  </>
                ) : (
                  <>
                    <FiPlus className="mr-2 text-sm sm:text-base" />
                    创建会员
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
                创建会员提示
              </h3>
              <ul className="text-blue-700 dark:text-blue-300 space-y-1 text-xs sm:text-sm">
                <li>• 会员姓名将用于系统识别和显示</li>
                <li>• 手机号将作为会员的唯一联系方式</li>
                <li>• 卡号将自动生成，格式为 VIP + 序号</li>
                <li>• 剩余汤品数量由卡类型决定，350卡为10次，500卡为20次，1000卡为40次</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 