'use client';

import { useRouter } from 'next/navigation';
import {
  FiUsers,
  FiPlus,
  FiCoffee,
  FiClipboard,
  FiShield,
  FiSettings,
  FiSearch,
  FiDownload,
  FiBarChart,
} from 'react-icons/fi';

interface QuickLinkCard {
  title: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  route: string;
  action?: 'navigate' | 'modal';
}

export default function QuickLinks() {
  const router = useRouter();

  const quickLinks: QuickLinkCard[] = [
    {
      title: '搜索会员',
      description: '快速搜索会员信息',
      icon: <FiSearch className="w-8 h-8" />,
      color: 'from-teal-500 to-teal-600',
      route: '/search',
    },
    {
      title: '新增会员',
      description: '快速添加新会员',
      icon: <FiPlus className="w-8 h-8" />,
      color: 'from-green-500 to-green-600',
      route: '/memberships/new',
    },
    {
      title: '新增汤品',
      description: '快速添加新汤品',
      icon: <FiCoffee className="w-8 h-8" />,
      color: 'from-orange-500 to-orange-600',
      route: '/soups/new',
    },
    {
      title: '新增喝汤记录',
      description: '快速添加喝汤记录',
      icon: <FiClipboard className="w-8 h-8" />,
      color: 'from-purple-500 to-purple-600',
      route: '/soup-records/new',
    },
  ];

  const handleQuickLinkClick = (link: QuickLinkCard) => {
    if (link.action === 'modal') {
      // 这里可以打开模态框
      console.log('打开模态框:', link.title);
    } else {
      router.push(link.route);
    }
  };

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white">快捷入口</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">常用功能一键直达</p>
      </div>
      {/* 快速操作提示 */}
      <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
        <div className="flex items-center">
          <div className="w-8 h-8 bg-blue-100 dark:bg-blue-800 rounded-full flex items-center justify-center mr-3">
            <FiPlus className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <p className="text-sm font-medium text-blue-800 dark:text-blue-200">
              快速操作提示
            </p>
            <p className="text-xs text-blue-600 dark:text-blue-400">
              点击下方卡片快速访问对应功能，支持键盘快捷键操作
            </p>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {quickLinks.map((link, index) => (
          <div
            key={index}
            onClick={() => handleQuickLinkClick(link)}
            className={`
              group relative bg-white dark:bg-gray-800 rounded-2xl shadow-lg 
              border border-gray-200 dark:border-gray-700 p-6 cursor-pointer
              hover:shadow-2xl hover:scale-105 transition-all duration-200
              hover:border-transparent
            `}
          >
            {/* 背景渐变 */}
            <div className={`
              absolute inset-0 bg-gradient-to-br ${link.color} 
              opacity-0 group-hover:opacity-20 rounded-2xl transition-opacity duration-200
            `} />
            {/* 图标 */}
            <div className={`
              relative w-14 h-14 bg-gradient-to-br ${link.color} 
              rounded-xl flex items-center justify-center mb-4 shadow group-hover:scale-110 transition-transform duration-200
            `}>
              <div className="text-white">
                {link.icon}
              </div>
            </div>
            {/* 内容 */}
            <div className="relative">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">
                {link.title}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                {link.description}
              </p>
            </div>
            {/* 悬停效果 */}
            <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              <div className="w-2 h-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
