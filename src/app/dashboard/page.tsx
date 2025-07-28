'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import StatsCards from './StatsCards';
import QuickLinks from './QuickLinks';
import RecentActivity from './RecentActivity';
import GlobalSearch from './GlobalSearch';
import UserProfile from './UserProfile';
import Notifications from './Notifications';
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
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 p-8 bg-gray-50 dark:bg-gray-900">
          <StatsCards />
          <QuickLinks />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
            <RecentActivity />
            <Charts />
          </div>
          <GlobalSearch />
          <UserProfile />
          <Notifications />
        </main>
      </div>
    </div>
  );
}