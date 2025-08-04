import { useRouter, usePathname } from 'next/navigation';
import { useState } from 'react';
import { FiHome, FiUsers, FiCoffee, FiClipboard, FiGrid, FiSun, FiMoon, FiLogOut } from 'react-icons/fi';
import LogoutConfirmModal from '@/components/LogoutConfirmModal';
import { useTheme } from '@/components/ThemeProvider';

const menu = [
  { label: '主页', icon: <FiHome />, path: '/dashboard' },
  { label: '会员管理', icon: <FiUsers />, path: '/memberships' },
  { label: '汤品管理', icon: <FiCoffee />, path: '/soups' },
  { label: '喝汤记录', icon: <FiClipboard />, path: '/soup-records' },
];

export default function Sidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();

  const handleLogoutClick = () => {
    setIsLogoutModalOpen(true);
  };

  const handleLogoutConfirm = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('admin');
    router.push('/login');
  };

  return (
    <aside className="w-full lg:w-72 h-auto lg:h-screen bg-white dark:bg-gray-900 shadow-lg flex flex-col py-4 lg:py-6 fixed lg:fixed top-0 left-0 z-20">
      {/* 标题区域 */}
      <div className="px-4 lg:px-6 mb-4 lg:mb-6">
        <div className="flex items-center space-x-2 lg:space-x-3 mb-4">
          <FiGrid className="h-6 w-6 lg:h-8 lg:w-8 text-blue-600 dark:text-blue-400 flex-shrink-0" />
          <span className="font-bold text-lg lg:text-xl text-gray-800 dark:text-white select-none break-words leading-tight">采芝林会员管理系统</span>
        </div>
        
        {/* 操作按钮 - 移动端水平排列 */}
        <div className="flex lg:hidden items-center justify-between space-x-2">
          <button
            onClick={toggleTheme}
            className="flex-1 flex items-center justify-center p-2 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition cursor-pointer"
            title={theme === 'light' ? '切换到暗黑模式' : '切换到亮色模式'}
          >
            {theme === 'light' ? (
              <FiMoon className="w-4 h-4 text-gray-600 dark:text-gray-300" />
            ) : (
              <FiSun className="w-4 h-4 text-gray-600 dark:text-gray-300" />
            )}
          </button>
          <button
            onClick={handleLogoutClick}
            className="flex-1 flex items-center justify-center p-2 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition cursor-pointer"
          >
            <FiLogOut className="w-4 h-4 text-gray-600 dark:text-gray-300" />
          </button>
        </div>
      </div>

      {/* 导航菜单 */}
      <nav className="flex lg:flex-col overflow-x-auto lg:overflow-x-visible flex-1">
        <div className="flex lg:flex-col w-full lg:w-auto">
          {menu.map((item) => (
            <button
              key={item.path}
              onClick={() => router.push(item.path)}
              className={`flex-1 lg:flex-none flex items-center justify-center lg:justify-start px-2 lg:px-6 py-3 lg:my-1 rounded-lg text-sm lg:text-base font-medium transition cursor-pointer whitespace-nowrap min-w-0
                ${pathname === item.path
                  ? 'bg-gradient-to-r from-blue-500 to-blue-700 text-white shadow font-bold'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-blue-900/30 hover:text-blue-700'}
              `}
            >
              <span className="mr-1 lg:mr-3 text-base lg:text-lg flex-shrink-0">{item.icon}</span>
              <span className="hidden md:inline truncate">{item.label}</span>
            </button>
          ))}
        </div>
      </nav>

      {/* 桌面端操作按钮和版权信息 */}
      <div className="hidden lg:block px-6 mt-auto space-y-4">
        <div className="flex items-center justify-between">
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition cursor-pointer"
            title={theme === 'light' ? '切换到暗黑模式' : '切换到亮色模式'}
          >
            {theme === 'light' ? (
              <FiMoon className="w-4 h-4 text-gray-500 dark:text-gray-300" />
            ) : (
              <FiSun className="w-4 h-4 text-gray-500 dark:text-gray-300" />
            )}
          </button>
          <button
            onClick={handleLogoutClick}
            className="flex items-center gap-1 sm:gap-2 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition cursor-pointer"
          > 
            <span className="hidden sm:inline">退出</span>
            <FiLogOut className="w-4 h-4 text-gray-500 dark:text-gray-300" />
          </button>
        </div>
        <div className="text-xs text-gray-400 dark:text-gray-600 select-none text-center">© 采芝林 {new Date().getFullYear()}</div>
      </div>

      {/* 退出确认弹窗 */}
      <LogoutConfirmModal 
        isOpen={isLogoutModalOpen} 
        onClose={() => setIsLogoutModalOpen(false)}
        onConfirm={handleLogoutConfirm}
      />
    </aside>
  );
}
