'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  FiArrowLeft,
  FiCoffee,
  FiUser,
  FiPackage,
  FiCalendar,
  FiClock,
  FiSave,
  FiAlertCircle,
  FiCheckCircle,
  FiHome,
  FiSearch,
  FiX
} from 'react-icons/fi';
import { getAllMemberships, searchMemberships } from '@/services/membershipService';
import { getAllSoups } from '@/services/soupService';
import { createSoupRecord } from '@/services/soupRecordService';
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
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const [memberships, setMemberships] = useState<MembershipResponse[]>([]);
  const [soups, setSoups] = useState<SoupResponse[]>([]);

  // 会员搜索相关状态
  const [memberSearchTerm, setMemberSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<MembershipResponse[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [selectedMember, setSelectedMember] = useState<MembershipResponse | null>(null);

  const [formData, setFormData] = useState<CreateSoupRecordRequest>({
    membershipId: 0,
    soupId: 0,
    drinkTime: getSystemDateTimeLocal()
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  // 获取会员和汤品数据
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        if (!token) {
          router.push('/login');
          return;
        }

        const [membershipsData, soupsData] = await Promise.all([
          getAllMemberships(token),
          getAllSoups(token)
        ]);

        setMemberships(membershipsData.data);
        setSoups(soupsData);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [router]);

  // 搜索会员
  const searchMembers = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    try {
      setIsSearching(true);
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/login');
        return;
      }

      const results = await searchMemberships(query, token);
      setSearchResults(results.members);
      setShowSearchResults(true);
    } catch (err: any) {
      console.error('搜索会员失败:', err);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  // 处理会员搜索输入
  const handleMemberSearchChange = (value: string) => {
    setMemberSearchTerm(value);
    setSelectedMember(null);
    setFormData(prev => ({ ...prev, membershipId: 0 }));

    if (value.trim()) {
      searchMembers(value);
    } else {
      setSearchResults([]);
      setShowSearchResults(false);
    }
  };

  // 选择会员
  const handleSelectMember = (member: MembershipResponse) => {
    setSelectedMember(member);
    setMemberSearchTerm(member.name);
    setFormData(prev => ({ ...prev, membershipId: member.id }));
    setShowSearchResults(false);

    // 清除对应字段的错误
    if (errors.membershipId) {
      const newErrors = { ...errors };
      delete newErrors.membershipId;
      setErrors(newErrors);
    }
  };

  // 处理输入变化
  const handleInputChange = (field: keyof CreateSoupRecordRequest, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));

    // 清除对应字段的错误
    if (errors[field]) {
      const newErrors = { ...errors };
      delete newErrors[field];
      setErrors(newErrors);
    }
  };

  // 验证表单
  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.membershipId || !selectedMember) {
      newErrors.membershipId = '请选择会员';
    } else if (selectedMember.remainingSoups <= 0) {
      newErrors.membershipId = '该会员剩余次数不足，无法创建记录';
    }

    if (!formData.soupId) {
      newErrors.soupId = '请选择汤品';
    }

    if (!formData.drinkTime) {
      newErrors.drinkTime = '请选择喝汤时间';
    } else {
      // 将datetime-local格式转换为Date对象进行比较
      const selectedTime = new Date(formData.drinkTime + ':00'); // 添加秒数
      const now = new Date();

      if (selectedTime > now) {
        newErrors.drinkTime = '喝汤时间不能晚于当前时间';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // 提交表单
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

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

      // 确保时间格式包含秒
      const drinkTimeWithSeconds = formData.drinkTime + ':00';

      await createSoupRecord({
        ...formData,
        drinkTime: drinkTimeWithSeconds
      }, token);

      setSuccessMessage('喝汤记录创建成功！');
      setTimeout(() => {
        router.push('/soup-records?success=created');
      }, 1500);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  // 取消操作
  const handleCancel = () => {
    if (Object.keys(errors).length > 0 ||
      formData.membershipId !== 0 ||
      formData.soupId !== 0 ||
      formData.drinkTime !== getSystemDateTimeLocal() ||
      selectedMember !== null ||
      memberSearchTerm !== '') {
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
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400 text-lg">正在加载数据...</p>
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
              <button
                onClick={handleCancel}
                className="p-3 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-all duration-200 cursor-pointer"
              >
                <FiArrowLeft className="w-5 h-5" />
              </button>
              <div className="flex items-center">
                <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center shadow-lg mr-4">
                  <FiCoffee className="text-white text-xl" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-white">新增喝汤记录</h1>
                  <p className="text-gray-600 dark:text-gray-400 mt-1">
                    为会员添加新的喝汤记录
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
                onClick={() => router.push('/soup-records')}
                className="px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white rounded-xl flex items-center font-medium transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 cursor-pointer"
              >
                <FiCoffee className="mr-2" />
                喝汤记录
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* 成功消息 */}
        {successMessage && (
          <div className="mb-8 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-2xl p-6">
            <div className="flex items-center">
              <FiCheckCircle className="text-green-500 mr-3 text-xl" />
              <p className="text-green-600 dark:text-green-400 font-medium">{successMessage}</p>
            </div>
          </div>
        )}

        {/* 错误消息 */}
        {error && (
          <div className="mb-8 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl p-6">
            <div className="flex items-center">
              <FiAlertCircle className="text-red-500 mr-3 text-xl" />
              <p className="text-red-600 dark:text-red-400 font-medium">{error}</p>
            </div>
          </div>
        )}

        {/* 表单卡片 */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 border border-gray-100 dark:border-gray-700">
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* 会员选择 */}
            <div>
              <label className="block text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                <FiUser className="mr-3 text-blue-600" />
                选择会员
              </label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400">
                  {isSearching ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500"></div>
                  ) : (
                    <FiSearch className="h-5 w-5" />
                  )}
                </div>
                <input
                  type="text"
                  placeholder="搜索会员名称或手机号"
                  value={memberSearchTerm}
                  onChange={(e) => handleMemberSearchChange(e.target.value)}
                  onFocus={() => setShowSearchResults(true)}
                  onBlur={() => setTimeout(() => setShowSearchResults(false), 150)}
                  className="w-full pl-12 pr-10 py-4 border rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-lg transition-all duration-200"
                />
                {memberSearchTerm && (
                  <button
                    type="button"
                    onClick={() => setMemberSearchTerm('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                  >
                    <FiX className="h-5 w-5" />
                  </button>
                )}
                {showSearchResults && (
                  <div className="absolute z-10 w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                    {isSearching ? (
                      <div className="p-4 text-center text-gray-400">正在搜索...</div>
                    ) : searchResults.length > 0 ? (
                      searchResults.map(member => (
                        <div
                          key={member.id}
                          className="p-4 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 border-b border-gray-100 dark:border-gray-700 last:border-b-0 transition-colors"
                          onMouseDown={() => handleSelectMember(member)}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <p className="text-gray-900 dark:text-white font-medium">
                                {member.name}
                              </p>
                              <p className="text-gray-500 dark:text-gray-400 text-sm">
                                {member.phone}
                              </p>
                              <p className="text-gray-400 dark:text-gray-500 text-xs">
                                卡号: {member.cardNumber}
                              </p>
                            </div>
                            <div className="text-right">
                              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${member.remainingSoups > 0
                                ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                                : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                                }`}>
                                剩余: {member.remainingSoups}次
                              </span>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : memberSearchTerm.trim() ? (
                      <div className="p-4 text-gray-500 dark:text-gray-400 text-center">
                        未找到相关会员
                      </div>
                    ) : null}
                  </div>
                )}
              </div>
              {selectedMember && (
                <div className="mt-3 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-blue-900 dark:text-blue-100 font-medium">
                        {selectedMember.name} - {selectedMember.phone}
                      </p>
                      <p className="text-blue-700 dark:text-blue-300 text-sm">
                        卡号: {selectedMember.cardNumber} | 剩余次数: {selectedMember.remainingSoups}次
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedMember(null);
                        setMemberSearchTerm('');
                        setFormData(prev => ({ ...prev, membershipId: 0 }));
                      }}
                      className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200"
                    >
                      <FiX className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              )}
              {errors.membershipId && (
                <p className="mt-2 text-red-600 dark:text-red-400 text-sm flex items-center">
                  <FiAlertCircle className="mr-1" />
                  {errors.membershipId}
                </p>
              )}
            </div>

            {/* 汤品选择 */}
            <div>
              <label className="block text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                <FiPackage className="mr-3 text-orange-600" />
                选择汤品
              </label>
              <select
                value={formData.soupId}
                onChange={(e) => handleInputChange('soupId', parseInt(e.target.value))}
                className={`w-full px-4 py-4 border rounded-xl focus:ring-4 focus:ring-orange-500/20 focus:border-orange-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-lg transition-all duration-200 cursor-pointer ${errors.soupId ? 'border-red-500' : 'border-gray-200 dark:border-gray-600'
                  }`}
              >
                <option value={0}>请选择汤品</option>
                {soups.map(soup => (
                  <option key={soup.id} value={soup.id}>
                    {soup.name} - {soup.type}
                  </option>
                ))}
              </select>
              {errors.soupId && (
                <p className="mt-2 text-red-600 dark:text-red-400 text-sm flex items-center">
                  <FiAlertCircle className="mr-1" />
                  {errors.soupId}
                </p>
              )}
            </div>

            {/* 喝汤时间 */}
            <div>
              <label className="block text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                <FiClock className="mr-3 text-green-600" />
                喝汤时间
              </label>
              <input
                type="datetime-local"
                value={formData.drinkTime}
                onChange={(e) => handleInputChange('drinkTime', e.target.value)}
                className={`w-full px-4 py-4 border rounded-xl focus:ring-4 focus:ring-green-500/20 focus:border-green-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-lg transition-all duration-200 ${errors.drinkTime ? 'border-red-500' : 'border-gray-200 dark:border-gray-600'
                  }`}
              />
              {errors.drinkTime && (
                <p className="mt-2 text-red-600 dark:text-red-400 text-sm flex items-center">
                  <FiAlertCircle className="mr-1" />
                  {errors.drinkTime}
                </p>
              )}
            </div>

            {/* 提示信息 */}
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-3 flex items-center">
                <FiAlertCircle className="mr-2" />
                提示信息
              </h3>
              <ul className="text-blue-700 dark:text-blue-300 space-y-1 text-sm">
                <li>• 请选择有剩余次数的会员进行记录</li>
                <li>• 喝汤时间不能晚于当前时间</li>
                <li>• 创建记录后会自动扣除会员的剩余次数</li>
                <li>• 记录创建后可以在喝汤记录列表中查看</li>
                <li>• 如需修改记录，请在记录详情页面操作</li>
              </ul>
            </div>

            {/* 操作按钮 */}
            <div className="flex items-center justify-end space-x-4 pt-6 border-t border-gray-200 dark:border-gray-700">
              <button
                type="button"
                onClick={handleCancel}
                className="px-8 py-4 bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white rounded-xl font-medium transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 cursor-pointer"
              >
                取消
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-8 py-4 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white rounded-xl flex items-center font-medium transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                <FiSave className="mr-2" />
                {saving ? '保存中...' : '保存记录'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
} 