import { useRouter, usePathname } from 'next/navigation';
import { FiHome, FiUsers, FiCoffee, FiClipboard, FiSettings, FiShield, FiBarChart } from 'react-icons/fi';

const menu = [
  { label: '仪表盘', icon: <FiHome />, path: '/dashboard' },
  { label: '会员管理', icon: <FiUsers />, path: '/memberships' },
  { label: '汤品管理', icon: <FiCoffee />, path: '/soups' },
  { label: '喝汤记录', icon: <FiClipboard />, path: '/soup-records' },
  { label: '管理员管理', icon: <FiShield />, path: '/admins' },
  { label: '数据统计', icon: <FiBarChart />, path: '/dashboard/analytics' },
  { label: '系统设置', icon: <FiSettings />, path: '/settings' },
];

export default function Sidebar() {
  const router = useRouter();
  const pathname = usePathname();

  return (
    <aside className="w-56 h-full bg-white dark:bg-gray-900 shadow-lg flex flex-col py-6">
      <nav className="flex-1">
        {menu.map((item) => (
          <button
            key={item.path}
            onClick={() => router.push(item.path)}
            className={`w-full flex items-center px-6 py-3 my-1 rounded-lg text-base font-medium transition cursor-pointer
              ${pathname === item.path
                ? 'bg-gradient-to-r from-blue-500 to-blue-700 text-white shadow font-bold'
                : 'text-gray-700 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-blue-900/30 hover:text-blue-700'}
            `}
          >
            <span className="mr-3 text-lg">{item.icon}</span>
            {item.label}
          </button>
        ))}
      </nav>
      <div className="px-6 mt-auto text-xs text-gray-400 dark:text-gray-600 select-none">© 采芝林 2025</div>
    </aside>
  );
}
