'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import { getStoredUser } from '@/lib/api';

export default function WorkerLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('worknow_token');
    const user = getStoredUser();

    if (!token || !user) {
      router.push('/auth/login');
      return;
    }

    if (user.role !== 'WORKER') {
      // If they are an employer, redirect appropriately or let them choose.
      // But for this worker section, we require WORKER role.
      if (user.role === 'EMPLOYER') {
        router.push('/employer/jobs');
      } else {
        router.push('/auth/role-selection');
      }
      return;
    }

    setLoading(false);
  }, [router]);

  const isProfile = pathname === '/worker/profile';

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F9FAFB] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-[#00C16A] border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-[#4B5563]">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (isProfile) {
    return <>{children}</>;
  }

  return (
    <div className="flex min-h-screen bg-[#F9FAFB]">
      <Sidebar />
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
