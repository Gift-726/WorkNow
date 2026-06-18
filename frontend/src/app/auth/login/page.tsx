'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { api } from '@/lib/api';
import GoogleLoginButton from '@/components/GoogleLoginButton';

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

  const handleGoogleSuccess = async (credential: string) => {
    setServerError('');
    setLoading(true);
    try {
      const res = await api.auth.googleLogin(credential);

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
      setServerError('Google authentication failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#F9FAFB] flex flex-col items-center justify-center py-10 px-4">
      <div className="w-full max-w-[440px]">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <Image src="/log.png" alt="WorkNow" width={120} height={40} priority className="object-contain" />
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

          {/* Google sign-in */}
          <GoogleLoginButton 
            onSuccess={handleGoogleSuccess} 
            onError={(err) => setServerError(err)} 
          />

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
