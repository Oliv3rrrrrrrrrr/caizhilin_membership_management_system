import { useRouter, usePathname } from 'next/navigation';
import { FiHome, FiUsers, FiCoffee, FiClipboard, FiSettings, FiShield, FiBarChart } from 'react-icons/fi';

const menu = [
  { label: '主页', icon: <FiHome />, path: '/dashboard' },
  { label: '会员管理', icon: <FiUsers />, path: '/memberships' },
  { label: '汤品管理', icon: <FiCoffee />, path: '/soups' },
  { label: '喝汤记录', icon: <FiClipboard />, path: '/soup-records' },
];

export default function Sidebar() {
  const router = useRouter();
  const pathname = usePathname();

  return (
    <aside className="w-56 h-screen bg-white dark:bg-gray-900 shadow-lg flex flex-col py-6 fixed left-0 top-0 z-10">
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
      <div className="px-6 mt-auto text-xs text-gray-400 dark:text-gray-600 select-none text-center">© 采芝林 2025</div>
    </aside>
  );
}
