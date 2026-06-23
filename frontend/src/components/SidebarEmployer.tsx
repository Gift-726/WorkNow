'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

const navLinks = [
  {
    href: '/employer',
    label: 'Dashboard',
    icon: (
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
        <rect x="1" y="1" width="6.5" height="6.5" rx="1.5" stroke="currentColor" strokeWidth="1.5"/>
        <rect x="1" y="10.5" width="6.5" height="6.5" rx="1.5" stroke="currentColor" strokeWidth="1.5"/>
        <rect x="10.5" y="1" width="6.5" height="6.5" rx="1.5" stroke="currentColor" strokeWidth="1.5"/>
        <rect x="10.5" y="10.5" width="6.5" height="6.5" rx="1.5" stroke="currentColor" strokeWidth="1.5"/>
      </svg>
    ),
  },
  {
    href: '/employer/jobs/new',
    label: 'Create Job',
    icon: (
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
        <rect x="2" y="2" width="14" height="14" rx="2" stroke="currentColor" strokeWidth="1.5"/>
        <path d="M9 5v8M5 9h8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
    ),
  },
  {
    href: '/employer/wallet',
    label: 'Wallet',
    icon: (
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
        <rect x="1.5" y="4.5" width="15" height="10.5" rx="1.5" stroke="currentColor" strokeWidth="1.5"/>
        <path d="M1.5 7.5h15" stroke="currentColor" strokeWidth="1.5"/>
        <circle cx="12.75" cy="11.25" r="1.25" fill="currentColor"/>
      </svg>
    ),
  },
  {
    href: '/employer/profile',
    label: 'Profile',
    icon: (
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
        <circle cx="9" cy="6" r="3" stroke="currentColor" strokeWidth="1.5"/>
        <path d="M2.25 15.75c0-3.728 3.022-6.75 6.75-6.75s6.75 3.022 6.75 6.75" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
    ),
  },
];

export default function SidebarEmployer() {
  const pathname = usePathname();
  const router = useRouter();

  const isActive = (href: string) => {
    if (href === '/employer') return pathname === '/employer';
    return pathname.startsWith(href);
  };

  const handleLogout = () => {
    localStorage.removeItem('worknow_token');
    localStorage.removeItem('worknow_user');
    router.push('/auth/login');
  };

  return (
    <aside className="w-[220px] min-h-screen border-r border-[#E5E7EB] bg-white flex flex-col shrink-0">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-[#E5E7EB] flex items-center">
        <div className="relative w-[180px] h-[64px]">
          <Image src="/logo.png" alt="WorkNow" fill className="object-contain" priority />
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 flex flex-col gap-1">
        {navLinks.map((link) => {
          const active = isActive(link.href);
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-[10px] text-sm font-medium transition-colors ${
                active
                  ? 'bg-[#E6FAF2] text-[#00C16A]'
                  : 'text-[#4B5563] hover:bg-[#F9FAFB] hover:text-[#111827]'
              }`}
            >
              <span className={active ? 'text-[#00C16A]' : 'text-[#9CA3AF]'}>
                {link.icon}
              </span>
              {link.label}
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="px-3 pb-6">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2.5 w-full rounded-[10px] text-sm font-medium text-[#EF4444] hover:bg-red-50 transition-colors cursor-pointer"
        >
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <path d="M6.75 15.75H3.75a1.5 1.5 0 01-1.5-1.5V3.75a1.5 1.5 0 011.5-1.5h3" stroke="#EF4444" strokeWidth="1.5" strokeLinecap="round"/>
            <path d="M12 12.75L15.75 9 12 5.25" stroke="#EF4444" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M15.75 9H6.75" stroke="#EF4444" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
          Logout
        </button>
      </div>
    </aside>
  );
}
