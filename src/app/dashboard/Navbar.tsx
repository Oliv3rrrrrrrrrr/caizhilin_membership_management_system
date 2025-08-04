import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { FiLogOut, FiGrid } from 'react-icons/fi';
import LogoutConfirmModal from '@/components/LogoutConfirmModal';

export default function Navbar() {
  const router = useRouter();
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

  const handleLogoutClick = () => {
    setIsLogoutModalOpen(true);
  };

  const handleLogoutConfirm = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('admin');
    router.push('/login');
  };

  return (
    <nav className="h-16 flex items-center justify-between px-6 bg-white dark:bg-gray-900 shadow">
      {/* 左侧Logo/系统名 */}
      <div className="flex items-center space-x-3">
        <FiGrid className="h-8 w-8 text-blue-600 dark:text-blue-400" />
        <span className="font-bold text-2xl text-gray-800 dark:text-white select-none">采芝林会员管理系统</span>
      </div>
      {/* 右侧操作区 */}
      <div className="flex items-center space-x-4">
        {/* 退出 */}
        <button
          className="flex items-center gap-2 p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-800 transition cursor-pointer"
          onClick={handleLogoutClick}
        >
          退出
          <FiLogOut className="w-5 h-5 text-gray-500 dark:text-gray-300" />
        </button>
      </div>

      {/* 退出确认弹窗 */}
      <LogoutConfirmModal 
        isOpen={isLogoutModalOpen} 
        onClose={() => setIsLogoutModalOpen(false)}
        onConfirm={handleLogoutConfirm}
      />
    </nav>
  );
}
