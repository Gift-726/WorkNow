'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { api } from '@/lib/api';

const schema = z
  .object({
    firstName: z.string().min(2, 'First name must be at least 2 characters'),
    lastName: z.string().min(2, 'Last name must be at least 2 characters'),
    email: z.string().email('Enter a valid email address'),
    phone: z
      .string()
      .min(11, 'Enter a valid Nigerian phone number')
      .max(14)
      .regex(/^(\+234|0)[0-9]{10}$/, 'Enter a valid Nigerian phone number'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string(),
    nin: z
      .string()
      .optional()
      .refine((val) => !val || (val.length === 11 && /^\d{11}$/.test(val)), {
        message: 'NIN must be exactly 11 digits',
      }),
    bvn: z
      .string()
      .optional()
      .refine((val) => !val || (val.length === 11 && /^\d{11}$/.test(val)), {
        message: 'BVN must be exactly 11 digits',
      }),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

type FormData = z.infer<typeof schema>;

export default function RegisterPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [serverError, setServerError] = useState('');
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    trigger,
    setValue,
    clearErrors,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      password: '',
      confirmPassword: '',
      nin: '',
      bvn: '',
    },
  });

  const handleNextStep = async () => {
    if (step === 1) {
      const isValid = await trigger([
        'firstName',
        'lastName',
        'email',
        'phone',
        'password',
        'confirmPassword',
      ]);
      if (isValid) {
        setStep(2);
      }
    } else if (step === 2) {
      const isValid = await trigger('nin');
      if (isValid) {
        setStep(3);
      }
    }
  };

  const handleSkipNin = () => {
    setValue('nin', '');
    clearErrors('nin');
    setStep(3);
  };

  const handleSkipBvnAndSubmit = () => {
    setValue('bvn', '');
    clearErrors('bvn');
    handleSubmit(onSubmit)();
  };

  const onSubmit = async (data: FormData) => {
    setServerError('');
    setLoading(true);
    try {
      const res = await api.auth.register({
        fullName: `${data.firstName.trim()} ${data.lastName.trim()}`,
        email: data.email,
        phone: data.phone,
        password: data.password,
        nin: data.nin || undefined,
        bvn: data.bvn || undefined,
      });

      if (!res.success || !res.data) {
        setServerError(res.message);
        return;
      }

      // Persist token and user
      localStorage.setItem('worknow_token', res.data.token);
      localStorage.setItem('worknow_user', JSON.stringify(res.data.user));

      // Go to role selection
      router.push('/auth/role-selection');
    } catch {
      setServerError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#F9FAFB] flex flex-col items-center justify-start py-10 px-4">
      <div className="w-full max-w-[480px]">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <Image src="/logo.png" alt="WorkNow" width={120} height={40} priority className="object-contain" />
        </div>

        <div className="card">
          {/* Green Progress Level Bar */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs font-bold text-[#00C16A] uppercase tracking-wider">
                Step {step} of 3
              </span>
              <span className="text-xs font-bold text-[#4B5563]">
                {step === 1 ? '33%' : step === 2 ? '66%' : '100%'} Complete
              </span>
            </div>
            <div className="h-2 w-full bg-[#E5E7EB] rounded-full overflow-hidden">
              <div
                className="h-full bg-[#00C16A] rounded-full transition-all duration-300"
                style={{ width: `${step === 1 ? 33.3 : step === 2 ? 66.6 : 100}%` }}
              />
            </div>
          </div>

          <h1 className="text-2xl font-bold text-[#111827] mb-1">
            {step === 1 ? 'Create an account' : step === 2 ? 'Identity Verification' : 'Financial Verification'}
          </h1>
          <p className="text-sm text-[#4B5563] mb-6">
            {step === 1
              ? 'Sign up to get started on WorkNow'
              : step === 2
              ? 'Step 2: Enter your 11-digit National Identification Number (NIN)'
              : 'Step 3: Enter your 11-digit Bank Verification Number (BVN)'}
          </p>

          {serverError && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-[12px] text-sm text-[#EF4444]">
              {serverError}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} noValidate>
            {/* STEP 1: Basic Info */}
            {step === 1 && (
              <>
                {/* Name row */}
                <div className="flex gap-3 mb-4">
                  <div className="flex-1">
                    <label htmlFor="firstName" className="label">First Name</label>
                    <input
                      id="firstName"
                      type="text"
                      placeholder="Tunde"
                      className={`input-field ${errors.firstName ? 'input-error' : ''}`}
                      {...register('firstName')}
                    />
                    {errors.firstName && <p className="error-text">{errors.firstName.message}</p>}
                  </div>
                  <div className="flex-1">
                    <label htmlFor="lastName" className="label">Last Name</label>
                    <input
                      id="lastName"
                      type="text"
                      placeholder="Bello"
                      className={`input-field ${errors.lastName ? 'input-error' : ''}`}
                      {...register('lastName')}
                    />
                    {errors.lastName && <p className="error-text">{errors.lastName.message}</p>}
                  </div>
                </div>

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

                {/* Phone */}
                <div className="mb-4">
                  <label htmlFor="phone" className="label">Phone Number</label>
                  <input
                    id="phone"
                    type="tel"
                    placeholder="08012345678"
                    className={`input-field ${errors.phone ? 'input-error' : ''}`}
                    {...register('phone')}
                  />
                  {errors.phone && <p className="error-text">{errors.phone.message}</p>}
                </div>

                {/* Password */}
                <div className="mb-4">
                  <label htmlFor="password" className="label">Password</label>
                  <input
                    id="password"
                    type="password"
                    placeholder="Min. 8 characters"
                    className={`input-field ${errors.password ? 'input-error' : ''}`}
                    {...register('password')}
                  />
                  {errors.password && <p className="error-text">{errors.password.message}</p>}
                </div>

                {/* Confirm Password */}
                <div className="mb-5">
                  <label htmlFor="confirmPassword" className="label">Confirm Password</label>
                  <input
                    id="confirmPassword"
                    type="password"
                    placeholder="Repeat your password"
                    className={`input-field ${errors.confirmPassword ? 'input-error' : ''}`}
                    {...register('confirmPassword')}
                  />
                  {errors.confirmPassword && (
                    <p className="error-text">{errors.confirmPassword.message}</p>
                  )}
                </div>

                {/* Terms notice */}
                <p className="text-xs text-[#6B7280] mb-5 leading-relaxed">
                  By creating an account, you agree to our{' '}
                  <span className="text-[#00C16A] font-medium cursor-pointer">Terms of Service</span>{' '}
                  and{' '}
                  <span className="text-[#00C16A] font-medium cursor-pointer">Privacy Policy</span>.
                </p>

                <button
                  type="button"
                  onClick={handleNextStep}
                  className="btn-primary mb-4"
                >
                  Continue
                </button>
              </>
            )}

            {/* STEP 2: NIN */}
            {step === 2 && (
              <>
                <p className="text-sm text-[#4B5563] mb-6 leading-relaxed">
                  WorkNow is a safety-first casual job marketplace. Providing your 11-digit National Identification Number (NIN) helps build trust with employers and unlocks premium features.
                </p>

                <div className="mb-6">
                  <label htmlFor="nin" className="label">NIN Number</label>
                  <input
                    id="nin"
                    type="text"
                    inputMode="numeric"
                    maxLength={11}
                    placeholder="Enter 11-digit NIN"
                    className={`input-field ${errors.nin ? 'input-error' : ''}`}
                    {...register('nin')}
                  />
                  {errors.nin && <p className="error-text">{errors.nin.message}</p>}
                </div>

                <div className="flex flex-col gap-3">
                  <button
                    type="button"
                    onClick={handleNextStep}
                    className="btn-primary"
                  >
                    Continue
                  </button>
                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => setStep(1)}
                      className="btn-secondary flex-1"
                    >
                      Back
                    </button>
                    <button
                      type="button"
                      onClick={handleSkipNin}
                      className="btn-secondary flex-1 text-[#00C16A] hover:text-[#00A558]"
                    >
                      Skip for now
                    </button>
                  </div>
                </div>
              </>
            )}

            {/* STEP 3: BVN */}
            {step === 3 && (
              <>
                <p className="text-sm text-[#4B5563] mb-6 leading-relaxed">
                  Enter your 11-digit Bank Verification Number (BVN) to ensure secure, immediate escrow payouts directly to your digital OPay wallet on job completion.
                </p>

                <div className="mb-6">
                  <label htmlFor="bvn" className="label">BVN Number</label>
                  <input
                    id="bvn"
                    type="text"
                    inputMode="numeric"
                    maxLength={11}
                    placeholder="Enter 11-digit BVN"
                    className={`input-field ${errors.bvn ? 'input-error' : ''}`}
                    {...register('bvn')}
                  />
                  {errors.bvn && <p className="error-text">{errors.bvn.message}</p>}
                </div>

                <div className="flex flex-col gap-3">
                  <button
                    type="submit"
                    disabled={loading}
                    className="btn-primary"
                  >
                    {loading ? 'Creating account…' : 'Create Account'}
                  </button>
                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => setStep(2)}
                      className="btn-secondary flex-1"
                    >
                      Back
                    </button>
                    <button
                      type="button"
                      onClick={handleSkipBvnAndSubmit}
                      className="btn-secondary flex-1 text-[#00C16A] hover:text-[#00A558]"
                    >
                      Skip for now
                    </button>
                  </div>
                </div>
              </>
            )}
          </form>

          {/* Login redirect link (Only on Step 1) */}
          {step === 1 && (
            <>
              <div className="divider mb-4">or</div>

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
                Already have an account?{' '}
                <Link href="/auth/login" className="text-[#00C16A] font-semibold hover:underline">
                  Log in
                </Link>
              </p>
            </>
          )}
        </div>
      </div>
    </main>
  );
}
