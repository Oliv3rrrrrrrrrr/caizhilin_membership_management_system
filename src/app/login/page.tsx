'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import LoginForm from '@/components/LoginForm';
import { login } from '@/services/authService';
import { FiShield } from 'react-icons/fi';


export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleLogin = async (form: { phone: string; password: string }) => {
    setLoading(true);
    setError('');
    try {
      const data = await login(form);
      localStorage.setItem('token', data.token);
      localStorage.setItem('admin', JSON.stringify(data.admin));
      router.push('/dashboard');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : '登录失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-200/60 via-white/60 to-blue-400/80 dark:from-gray-900 dark:via-blue-950 dark:to-blue-900 transition p-4 sm:p-6">
      <div className="w-full max-w-sm sm:max-w-md p-6 sm:p-8 lg:p-10 bg-white/60 dark:bg-gray-800/60 rounded-2xl sm:rounded-3xl shadow-2xl backdrop-blur-2xl border border-white/30 dark:border-gray-700/30">
        <div className="flex flex-col items-center mb-6 sm:mb-8 lg:mb-10">
          <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center mb-3 sm:mb-4 shadow-xl">
            <FiShield className="text-white text-2xl sm:text-4xl" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-800 dark:text-white tracking-tight mb-1 text-center">会员管理系统</h1>
          <p className="text-gray-400 dark:text-gray-400 text-sm sm:text-base text-center">管理员登录</p>
        </div>
        <LoginForm onSubmit={handleLogin} loading={loading} error={error} />
        <div className="mt-6 sm:mt-8 lg:mt-10 text-center text-xs text-gray-400">
          © {new Date().getFullYear()} 采芝林养生炖汤馆 版权所有
        </div>
      </div>
    </div>
  );
}