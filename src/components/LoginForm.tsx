'use client';

import { useState } from 'react';
import { LoginForm as LoginFormType } from '@/types/auth';
import { FiUser, FiLock } from 'react-icons/fi';

interface Props {
  onSubmit: (data: LoginFormType) => Promise<void>;
  loading: boolean;
  error: string;
}

export default function LoginForm({ onSubmit, loading, error }: Props) {
  const [form, setForm] = useState<LoginFormType>({ phone: '', password: '' });

  return (
    <form
      onSubmit={e => {
        e.preventDefault();
        onSubmit(form);
      }}
      className="flex flex-col gap-5 sm:gap-6 lg:gap-7"
    >
      <div className="relative group">
        <FiUser className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-400 text-lg sm:text-xl pointer-events-none" />
        <input
          type="text"
          placeholder="手机号"
          value={form.phone}
          onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
          required
          className="peer w-full pl-10 pr-4 py-2.5 sm:py-3 rounded-lg sm:rounded-xl border border-gray-200 dark:border-gray-700 bg-white/60 dark:bg-gray-800/60 text-gray-900 dark:text-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition placeholder-gray-400 text-sm sm:text-base"
        />
      </div>
      <div className="relative group">
        <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-400 text-lg sm:text-xl pointer-events-none" />
        <input
          type="password"
          placeholder="密码"
          value={form.password}
          onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
          required
          className="peer w-full pl-10 pr-4 py-2.5 sm:py-3 rounded-lg sm:rounded-xl border border-gray-200 dark:border-gray-700 bg-white/60 dark:bg-gray-800/60 text-gray-900 dark:text-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition placeholder-gray-400 text-sm sm:text-base"
        />
      </div>
      <button
        type="submit"
        disabled={loading}
        className="w-full py-2.5 sm:py-3 rounded-lg sm:rounded-xl bg-gradient-to-r from-blue-600 to-blue-400 hover:from-blue-700 hover:to-blue-500 text-white font-bold text-base sm:text-lg shadow-lg transition-all duration-200 disabled:opacity-60 active:scale-95 cursor-pointer"
      >
        {loading ? '登录中...' : '登录'}
      </button>
      {error && (
        <div className="text-red-500 text-xs sm:text-sm text-center animate-shake px-2">{error}</div>
      )}
      <style jsx global>{`
        @keyframes shake {
          10%, 90% { transform: translateX(-1px); }
          20%, 80% { transform: translateX(2px); }
          30%, 50%, 70% { transform: translateX(-4px); }
          40%, 60% { transform: translateX(4px); }
        }
        .animate-shake {
          animation: shake 0.4s;
        }
      `}</style>
    </form>
  );
}