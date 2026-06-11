'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { api } from '@/lib/api';

const schema = z.object({
  email: z.string().email('Enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

type FormData = z.infer<typeof schema>;

export default function LoginPage() {
  const router = useRouter();
  const [serverError, setServerError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const handleQuickLogin = (role: 'worker' | 'employer') => {
    if (role === 'worker') {
      setValue('email', 'worker@worknow.com');
      setValue('password', 'Password123');
    } else {
      setValue('email', 'employer@worknow.com');
      setValue('password', 'Password123');
    }
  };


  const onSubmit = async (data: FormData) => {
    setServerError('');
    setLoading(true);
    try {
      const res = await api.auth.login(data);

      if (!res.success || !res.data) {
        setServerError(res.message);
        return;
      }

      localStorage.setItem('worknow_token', res.data.token);
      localStorage.setItem('worknow_user', JSON.stringify(res.data.user));

      // Route based on role
      const { role } = res.data.user;
      if (role === 'WORKER') router.push('/worker');
      else if (role === 'EMPLOYER') router.push('/employer');
      else router.push('/auth/role-selection');
    } catch {
      setServerError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#F9FAFB] flex flex-col items-center justify-center py-10 px-4">
      <div className="w-full max-w-[440px]">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <Image src="/logo.png" alt="WorkNow" width={120} height={40} priority className="object-contain" />
        </div>

        <div className="card">
          <h1 className="text-2xl font-bold text-[#111827] mb-1">Log in</h1>
          <p className="text-sm text-[#4B5563] mb-6">Welcome back. Enter your details to continue.</p>

          {serverError && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-[12px] text-sm text-[#EF4444]">
              {serverError}
            </div>
          )}

          {/* Quick Demo Logins */}
          <div className="mb-6 p-4 bg-[#F3F4F6] border border-[#E5E7EB] rounded-[12px]">
            <p className="text-xs font-semibold text-[#374151] mb-2 uppercase tracking-wider">Demo Accounts</p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => handleQuickLogin('worker')}
                className="flex-1 text-xs py-2 px-3 bg-white border border-[#D1D5DB] hover:border-[#00C16A] hover:text-[#00C16A] text-[#111827] font-medium rounded-[8px] transition-colors shadow-sm text-center cursor-pointer"
              >
                ⚡ Worker Login
              </button>
              <button
                type="button"
                onClick={() => handleQuickLogin('employer')}
                className="flex-1 text-xs py-2 px-3 bg-white border border-[#D1D5DB] hover:border-[#00C16A] hover:text-[#00C16A] text-[#111827] font-medium rounded-[8px] transition-colors shadow-sm text-center cursor-pointer"
              >
                💼 Employer Login
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} noValidate>

            {/* Email */}
            <div className="mb-4">
              <label htmlFor="email" className="label">Email</label>
              <input
                id="email"
                type="email"
                placeholder="tunde@example.com"
                className={`input-field ${errors.email ? 'input-error' : ''}`}
                {...register('email')}
              />
              {errors.email && <p className="error-text">{errors.email.message}</p>}
            </div>

            {/* Password */}
            <div className="mb-2">
              <div className="flex items-center justify-between mb-1.5">
                <label htmlFor="password" className="label" style={{ margin: 0 }}>Password</label>
                <button
                  type="button"
                  className="text-xs text-[#00C16A] font-medium hover:underline"
                  onClick={() => alert('Password reset coming soon')}
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Your password"
                  className={`input-field !pr-12 ${errors.password ? 'input-error' : ''}`}
                  {...register('password')}
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9CA3AF] hover:text-[#4B5563] text-xs font-medium"
                  onClick={() => setShowPassword((s) => !s)}
                >
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>
              {errors.password && <p className="error-text">{errors.password.message}</p>}
            </div>

            <button type="submit" disabled={loading} className="btn-primary mt-5 mb-4">
              {loading ? 'Logging in…' : 'Log In'}
            </button>
          </form>

          {/* Divider */}
          <div className="divider mb-4">or</div>

          {/* Google sign-in (mock) */}
          <button
            type="button"
            className="btn-secondary mb-6 gap-2"
            onClick={() => alert('Google sign-in coming soon')}
          >
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path d="M17.64 9.2c0-.638-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
              <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z" fill="#34A853"/>
              <path d="M3.964 10.71A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 000 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
              <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
            </svg>
            Sign in with Google
          </button>

          <p className="text-center text-sm text-[#4B5563]">
            Don&apos;t have an account?{' '}
            <Link href="/auth/register" className="text-[#00C16A] font-semibold hover:underline">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}
