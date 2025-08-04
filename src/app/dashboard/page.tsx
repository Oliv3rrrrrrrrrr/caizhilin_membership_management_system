'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from './Navbar';
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
    <div className="min-h-screen flex">
      <Sidebar />
      <div className="flex-1 flex flex-col ml-56">
        <Navbar />
        <main className="flex-1 p-8 bg-gray-50 dark:bg-gray-900 overflow-auto">
          <StatsCards />
          <QuickLinks />
          <RecentActivity />
          <Charts />
        </main>
      </div>
    </div>
  );
}