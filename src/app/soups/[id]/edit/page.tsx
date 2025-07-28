"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import {
  FiArrowLeft,
  FiCoffee,
  FiPackage,
  FiSave,
  FiAlertCircle,
  FiCheckCircle,
  FiEdit2,
  FiHome,
  FiBarChart,
} from "react-icons/fi";
import { getSoupById, updateSoup } from "@/services/soupService";
import { SoupResponse, UpdateSoupRequest } from "@/types/soup";

export default function EditSoupPage() {
  const router = useRouter();
  const params = useParams();
  const soupId = parseInt(params.id as string);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [soup, setSoup] = useState<SoupResponse | null>(null);
  const [formData, setFormData] = useState<UpdateSoupRequest>({
    name: "",
    type: "",
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  // 获取汤品信息
  useEffect(() => {
    const fetchSoup = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");
        if (!token) {
          router.push("/login");
          return;
        }
        const data = await getSoupById(soupId, token);
        setSoup(data);
        setFormData({
          name: data.name,
          type: data.type,
        });
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    if (soupId) {
      fetchSoup();
    }
  }, [soupId, router]);

  // 表单验证
  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {};
    if (!formData.name?.trim()) {
      newErrors.name = "汤品名称不能为空";
    } else if (formData.name.length < 2 || formData.name.length > 20) {
      newErrors.name = "名称长度需在2-20个字符之间";
    }
    if (!formData.type?.trim()) {
      newErrors.type = "汤品类型不能为空";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // 提交表单
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!validateForm()) {
      return;
    }
    try {
      setSaving(true);
      const token = localStorage.getItem("token");
      if (!token) {
        router.push("/login");
        return;
      }
      await updateSoup(soupId, formData, token);
      setSuccessMessage("汤品信息已更新！");
      setTimeout(() => {
        router.push("/soups");
      }, 1200);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  // 输入变更
  const handleInputChange = (field: keyof UpdateSoupRequest, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value as any }));
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  // 取消编辑
  const handleCancel = () => {
    if (
      Object.keys(errors).length > 0 ||
      formData.name !== soup?.name ||
      formData.type !== soup?.type
    ) {
      if (confirm("您有未保存的修改，确定要取消吗？")) {
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
            <p className="text-gray-600 dark:text-gray-400 text-lg">正在加载汤品信息...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !soup) {
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
              {error || "未找到指定的汤品信息"}
            </p>
            <button
              onClick={() => router.push("/soups")}
              className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white px-8 py-3 rounded-xl font-medium transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              返回汤品列表
            </button>
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
                <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg mr-4">
                  <FiEdit2 className="text-white text-xl" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-white">编辑汤品</h1>
                  <p className="text-gray-600 dark:text-gray-400 mt-1">修改汤品的详细信息</p>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => router.push("/dashboard")}
                className="px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-xl font-medium transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 cursor-pointer"
              >
                返回主页
              </button>
              <button
                onClick={() => router.push("/soups")}
                className="px-4 py-2 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white rounded-xl flex items-center font-medium transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 cursor-pointer"
              >
                <FiCoffee className="mr-2" />
                返回列表
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* 汤品名称 */}
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center">
                  <FiCoffee className="mr-2 text-orange-500" />
                  汤品名称 *
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    className={`w-full px-4 py-4 border-2 rounded-xl focus:ring-4 focus:ring-orange-500/20 focus:border-orange-500 transition-all duration-200 text-lg ${
                      errors.name
                        ? "border-red-300 dark:border-red-600 bg-red-50 dark:bg-red-900/20"
                        : "border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 hover:border-gray-300 dark:hover:border-gray-500"
                    } text-gray-900 dark:text-white`}
                    placeholder="请输入汤品名称"
                  />
                  {errors.name && (
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                      <FiAlertCircle className="text-red-500 text-xl" />
                    </div>
                  )}
                </div>
                {errors.name && (
                  <p className="mt-2 text-sm text-red-600 dark:text-red-400 flex items-center">
                    <FiAlertCircle className="mr-1" />
                    {errors.name}
                  </p>
                )}
              </div>
              {/* 汤品类型 */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center">
                  <FiBarChart className="mr-2 text-indigo-500" />
                  汤品类型 *
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={formData.type}
                    onChange={(e) => handleInputChange("type", e.target.value)}
                    className={`w-full px-4 py-4 border-2 rounded-xl focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all duration-200 text-lg ${
                      errors.type
                        ? "border-red-300 dark:border-red-600 bg-red-50 dark:bg-red-900/20"
                        : "border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 hover:border-gray-300 dark:hover:border-gray-500"
                    } text-gray-900 dark:text-white`}
                    placeholder="请输入汤品类型"
                  />
                  {errors.type && (
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                      <FiAlertCircle className="text-red-500 text-xl" />
                    </div>
                  )}
                </div>
                {errors.type && (
                  <p className="mt-2 text-sm text-red-600 dark:text-red-400 flex items-center">
                    <FiAlertCircle className="mr-1" />
                    {errors.type}
                  </p>
                )}
              </div>
            </div>
            {/* 操作按钮 */}
            <div className="flex justify-end space-x-4 pt-8 border-t border-gray-200 dark:border-gray-700">
              <button
                type="button"
                onClick={handleCancel}
                className="px-8 py-4 border-2 border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-gray-300 dark:hover:border-gray-500 transition-all duration-200 font-medium cursor-pointer"
              >
                取消
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-8 py-4 bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 disabled:from-gray-400 disabled:to-gray-500 text-white rounded-xl transition-all duration-200 flex items-center font-medium shadow-lg hover:shadow-xl transform hover:scale-105 disabled:transform-none disabled:cursor-not-allowed cursor-pointer"
              >
                {saving ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                    保存中...
                  </>
                ) : (
                  <>
                    <FiSave className="mr-2" />
                    保存修改
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
        {/* 提示信息 */}
        <div className="mt-8 bg-blue-50 dark:bg-blue-900/20 rounded-2xl p-6 border border-blue-200 dark:border-blue-800">
          <div className="flex items-start">
            <div className="w-8 h-8 bg-blue-100 dark:bg-blue-800 rounded-full flex items-center justify-center mr-4 mt-1">
              <FiCheckCircle className="text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-blue-800 dark:text-blue-200 mb-2">
                编辑汤品提示
              </h3>
              <ul className="text-blue-700 dark:text-blue-300 space-y-1 text-sm">
                <li>• 汤品名称和类型将用于系统识别和展示</li>
                <li>• 汤品类型可自定义</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 