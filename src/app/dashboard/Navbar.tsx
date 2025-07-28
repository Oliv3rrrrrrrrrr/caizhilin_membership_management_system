import { useRouter } from 'next/navigation';
import { FiBell, FiSettings, FiLogOut, FiUser, FiGrid } from 'react-icons/fi';

export default function Navbar() {
  const router = useRouter();

  const handleLogout = () => {
    if (window.confirm('确定要退出登录吗？')) {
      localStorage.removeItem('token');
      localStorage.removeItem('admin');
      router.push('/login');
    }
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
        {/* 通知icon */}
        <button className="relative p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition">
          <span className="sr-only">通知</span>
          <FiBell className="w-5 h-5 text-gray-500 dark:text-gray-300" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
        </button>
        {/* 管理员信息 */}
        <div className="flex items-center space-x-2">
          <FiUser className="w-8 h-8 rounded-full text-gray-400 dark:text-gray-500 bg-gray-100 dark:bg-gray-800 p-1" />
          <span className="text-gray-700 dark:text-gray-200 text-sm font-medium select-none">管理员</span>
        </div>
        {/* 设置 */}
        <button className="p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-800 transition cursor-pointer">
          <FiSettings className="w-5 h-5 text-gray-500 dark:text-gray-300" />
        </button>
        {/* 退出 */}
        <button
          className="p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-800 transition cursor-pointer"
          onClick={handleLogout}
        >
          <FiLogOut className="w-5 h-5 text-gray-500 dark:text-gray-300" />
        </button>
      </div>
    </nav>
  );
}
