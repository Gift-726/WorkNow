'use client';

import Image from 'next/image';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';

type Role = 'WORKER' | 'EMPLOYER';

const roles = [
  {
    id: 'EMPLOYER' as Role,
    title: 'Employer',
    subtitle: 'Post jobs and hire workers',
    description:
      'I need to find workers for my shop, home, event, or business.',
    icon: (
      <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
        <rect width="32" height="32" rx="8" fill="#E6FAF2" />
        <path d="M22 13h-2v-1a4 4 0 00-8 0v1h-2a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2v-8a2 2 0 00-2-2zm-8-1a2 2 0 014 0v1h-4v-1zm-4 11v-8h12v8H10z" fill="#00C16A"/>
        <circle cx="16" cy="19" r="2" fill="#00C16A"/>
      </svg>
    ),
  },
  {
    id: 'WORKER' as Role,
    title: 'Worker',
    subtitle: 'Find jobs and get paid',
    description:
      'I am looking for work — casual, hourly, or one-off jobs near me.',
    icon: (
      <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
        <rect width="32" height="32" rx="8" fill="#E6FAF2" />
        <path d="M16 8a4 4 0 100 8 4 4 0 000-8zm0 10c-4.42 0-8 1.79-8 4v2h16v-2c0-2.21-3.58-4-8-4z" fill="#00C16A"/>
      </svg>
    ),
  },
];

export default function RoleSelectionPage() {
  const router = useRouter();
  const [selected, setSelected] = useState<Role | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleContinue = async () => {
    if (!selected) return;
    setError('');
    setLoading(true);

    try {
      const raw = localStorage.getItem('worknow_user');
      if (!raw) {
        router.push('/auth/login');
        return;
      }

      const user = JSON.parse(raw) as { id: string };
      const res = await api.users.setRole(user.id, selected);

      if (!res.success) {
        setError(res.message);
        return;
      }

      // Update stored user role
      const updated = { ...user, role: selected };
      localStorage.setItem('worknow_user', JSON.stringify(updated));

      // Navigate to appropriate profile/dashboard
      if (selected === 'WORKER') {
        router.push('/worker/profile');
      } else {
        router.push('/employer/profile');
      }
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#F9FAFB] flex flex-col items-center justify-center py-10 px-4">
      <div className="w-full max-w-[480px]">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <Image src="/logo.png" alt="WorkNow" width={120} height={40} priority className="object-contain" />
        </div>

        <div className="card">
          <h1 className="text-2xl font-bold text-[#111827] mb-1 text-center">Welcome to WorkNow</h1>
          <p className="text-sm text-[#4B5563] mb-8 text-center">
            Tell us who you are so we can get you set up correctly.
          </p>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-[12px] text-sm text-[#EF4444]">
              {error}
            </div>
          )}

          {/* Role cards */}
          <div className="flex flex-col gap-4 mb-8">
            {roles.map((role) => (
              <button
                key={role.id}
                type="button"
                onClick={() => setSelected(role.id)}
                className={`w-full text-left p-4 rounded-[12px] border-2 transition-all duration-150 ${
                  selected === role.id
                    ? 'border-[#00C16A] bg-[#E6FAF2]'
                    : 'border-[#E5E7EB] bg-white hover:border-[#00C16A]'
                }`}
              >
                <div className="flex items-start gap-4">
                  <div className="shrink-0">{role.icon}</div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-[#111827]">{role.title}</span>
                      {selected === role.id && (
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                          <circle cx="8" cy="8" r="8" fill="#00C16A"/>
                          <path d="M5 8l2.5 2.5L11 5.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      )}
                    </div>
                    <p className="text-xs font-medium text-[#00C16A] mb-1">{role.subtitle}</p>
                    <p className="text-sm text-[#4B5563]">{role.description}</p>
                  </div>
                </div>
              </button>
            ))}
          </div>

          <button
            type="button"
            disabled={!selected || loading}
            onClick={handleContinue}
            className="btn-primary"
          >
            {loading ? 'Setting up your account…' : 'Continue'}
          </button>
        </div>
      </div>
    </main>
  );
}
