'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import SidebarEmployer from '@/components/SidebarEmployer';
import { getStoredUser } from '@/lib/api';

export default function EmployerLayout({ children }: { children: React.ReactNode }) {
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

    if (user.role !== 'EMPLOYER') {
      if (user.role === 'WORKER') {
        router.push('/worker');
      } else {
        router.push('/auth/role-selection');
      }
      return;
    }

    setLoading(false);
  }, [router]);

  const isProfile = pathname === '/employer/profile';

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

  // We render the profile page without the default layout sidebar if that's what was done in worker profile,
  // but looking at isProfile: wait! Is worker profile rendered without sidebar?
  // Let's check:
  // "const isProfile = pathname === '/worker/profile';"
  // Yes, it says if (isProfile) { return <>{children}</>; }
  // Let's do the same for employer profile if we want, or keep the sidebar. Let's make it consistent.
  if (isProfile) {
    return <>{children}</>;
  }

  return (
    <div className="flex min-h-screen bg-[#F9FAFB]">
      <SidebarEmployer />
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
