'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from './Sidebar';
import StatsCards from './StatsCards';
import QuickLinks from './QuickLinks';
import RecentActivity from './RecentActivity';
import Charts from './Charts';

export default function DashboardPage() {
  const router = useRouter();

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/login');
      }
    }
  }, [router]);

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      <Sidebar />
      <div className="flex-1 flex flex-col lg:ml-72">
        <main className="flex-1 p-4 sm:p-6 lg:p-8 bg-gray-50 dark:bg-gray-900 overflow-auto mt-40 lg:mt-0">
          <div className="max-w-full mx-auto space-y-4 sm:space-y-6">
            <StatsCards />
            <QuickLinks />
            <RecentActivity />
            <Charts />
          </div>
        </main>
      </div>
    </div>
  );
}