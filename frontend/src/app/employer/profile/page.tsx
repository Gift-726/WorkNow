'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { api, getStoredUser, PublicUser } from '@/lib/api';

const schema = z.object({
  fullName: z.string().min(3, 'Full name is required'),
  phone: z.string().regex(/^(\+234|0)[0-9]{10}$/, 'Enter a valid Nigerian phone number'),
  businessName: z.string().optional(),
  nextOfKinName: z.string().min(2, 'Next of kin name is required'),
  nextOfKinPhone: z.string().regex(/^(\+234|0)[0-9]{10}$/, 'Enter a valid phone number'),
  nin: z.string().length(11, 'NIN must be exactly 11 digits').regex(/^\d{11}$/, 'NIN must contain only numbers'),
});

type FormData = z.infer<typeof schema>;

export default function EmployerProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<PublicUser | null>(null);
  const [ninLoading, setNinLoading] = useState(false);
  const [ninSuccess, setNinSuccess] = useState(false);
  const [serverError, setServerError] = useState('');
  const [profilePhotoName, setProfilePhotoName] = useState<string | null>(null);
  const [ninPhotoName, setNinPhotoName] = useState<string | null>(null);

  const profilePhotoRef = useRef<HTMLInputElement>(null);
  const ninPhotoRef = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    setValue,
    getValues,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  useEffect(() => {
    const storedUser = getStoredUser();
    if (storedUser) {
      setUser(storedUser);
      setValue('fullName', storedUser.fullName);
      setValue('phone', storedUser.phone);
      if (storedUser.verificationStatus === 'VERIFIED') {
        setNinSuccess(true);
      }
    }
  }, [setValue]);

  const handleVerifyNin = async () => {
    const nin = getValues('nin');
    if (!nin || nin.length !== 11) {
      setServerError('Enter a valid 11-digit NIN first');
      return;
    }

    if (!user) {
      router.push('/auth/login');
      return;
    }

    setNinLoading(true);
    setServerError('');
    try {
      const res = await api.users.verify({ userId: user.id, nin });
      if (res.success) {
        setNinSuccess(true);
        // Mock update in-memory storage status
        const updatedUser = { ...user, verificationStatus: 'PENDING' as const };
        localStorage.setItem('worknow_user', JSON.stringify(updatedUser));
        setUser(updatedUser);
      } else {
        setServerError(res.message);
      }
    } catch {
      setServerError('NIN verification failed. Please try again.');
    } finally {
      setNinLoading(false);
    }
  };

  const onSubmit = async (data: FormData) => {
    if (!user) {
      router.push('/auth/login');
      return;
    }

    try {
      await api.users.updateProfile(user.id, {
        fullName: data.fullName,
        phone: data.phone,
        nextOfKinName: data.nextOfKinName,
        nextOfKinPhone: data.nextOfKinPhone,
      });

      // Update local storage name/phone
      const updatedUser = { ...user, fullName: data.fullName, phone: data.phone };
      localStorage.setItem('worknow_user', JSON.stringify(updatedUser));

      router.push('/employer');
    } catch {
      setServerError('Failed to save profile. Please try again.');
    }
  };

  return (
    <main className="min-h-screen bg-[#F9FAFB] px-4 py-8">
      <div className="w-full max-w-[560px] mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <Link href="/employer" className="text-[#4B5563] hover:text-[#111827]">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M12.5 15L7.5 10L12.5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </Link>
          <Image src="/logo.png" alt="WorkNow" width={90} height={30} className="object-contain" />
        </div>

        <h1 className="text-2xl font-bold text-[#111827] mb-1">Verify Employer Account</h1>
        <p className="text-sm text-[#4B5563] mb-6">
          Complete your profile credentials to post jobs and verify escrow.
        </p>

        {serverError && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-[12px] text-sm text-[#EF4444]">
            {serverError}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          {/* PERSONAL DETAILS */}
          <div className="card mb-4">
            <div className="flex items-center gap-2 mb-4 pt-2">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <circle cx="10" cy="7" r="3.5" stroke="#00C16A" strokeWidth="1.5"/>
                <path d="M3 17c0-3.314 3.134-6 7-6s7 2.686 7 6" stroke="#00C16A" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
              <h2 className="font-semibold text-[#111827]">Employer Details</h2>
            </div>

            <div className="flex items-center gap-4 mb-4">
              <div className="w-16 h-16 rounded-full bg-[#E5E7EB] flex items-center justify-center overflow-hidden shrink-0">
                {profilePhotoName ? (
                  <span className="text-xs text-center text-[#00C16A] px-1 leading-tight">{profilePhotoName}</span>
                ) : (
                  <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
                    <circle cx="14" cy="10" r="4.5" fill="#9CA3AF"/>
                    <path d="M4 24c0-4.418 4.477-8 10-8s10 3.582 10 8" fill="#9CA3AF"/>
                  </svg>
                )}
              </div>
              <button
                type="button"
                onClick={() => profilePhotoRef.current?.click()}
                className="text-sm text-[#00C16A] font-medium border border-[#00C16A] rounded-[8px] px-4 py-2 hover:bg-[#E6FAF2] transition-colors cursor-pointer"
              >
                Upload Logo / Photo
              </button>
              <input
                ref={profilePhotoRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => setProfilePhotoName(e.target.files?.[0]?.name ?? null)}
              />
            </div>

            <div className="mb-4">
              <label htmlFor="fullName" className="label">Full Name / Contact Person</label>
              <input
                id="fullName"
                type="text"
                placeholder="Funmi Johnson"
                className={`input-field ${errors.fullName ? 'input-error' : ''}`}
                {...register('fullName')}
              />
              {errors.fullName && <p className="error-text">{errors.fullName.message}</p>}
            </div>

            <div className="mb-4">
              <label htmlFor="businessName" className="label">Business / Household Name (Optional)</label>
              <input
                id="businessName"
                type="text"
                placeholder="Johnson Catering Services"
                className="input-field"
                {...register('businessName')}
              />
            </div>

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
          </div>

          {/* ID VERIFICATION */}
          <div className="card mb-4">
            <div className="flex items-center gap-2 mb-4 pt-2">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <rect x="2" y="5" width="16" height="10" rx="2" stroke="#00C16A" strokeWidth="1.5"/>
                <circle cx="7" cy="10" r="2" fill="#00C16A"/>
                <path d="M11 8h4M11 10h3M11 12h2" stroke="#00C16A" strokeWidth="1.2" strokeLinecap="round"/>
              </svg>
              <h2 className="font-semibold text-[#111827]">Employer Identity Check</h2>
            </div>

            <div className="mb-3">
              <label htmlFor="nin" className="label">
                NIN Number
                {ninSuccess && (
                  <span className="ml-2 text-xs text-[#00C16A] font-medium">✓ Submitted</span>
                )}
              </label>
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

            <div className="mb-4">
              <p className="text-sm text-[#4B5563] mb-2">Upload NIN Card / Slip (photo)</p>
              <button
                type="button"
                onClick={() => ninPhotoRef.current?.click()}
                className="w-full border-2 border-dashed border-[#E5E7EB] rounded-[12px] p-4 text-center hover:border-[#00C16A] transition-colors cursor-pointer"
              >
                <input
                  ref={ninPhotoRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) setNinPhotoName(file.name);
                  }}
                />
                {ninPhotoName ? (
                  <span className="text-sm text-[#00C16A] font-medium">{ninPhotoName}</span>
                ) : (
                  <span className="text-sm text-[#9CA3AF]">Tap to upload photo</span>
                )}
              </button>
            </div>

            <button
              type="button"
              disabled={ninLoading || ninSuccess}
              onClick={handleVerifyNin}
              className="btn-primary mt-2 cursor-pointer"
            >
              {ninSuccess ? '✓ NIN Submitted for Review' : ninLoading ? 'Submitting…' : 'Verify NIN'}
            </button>
          </div>

          {/* NEXT OF KIN */}
          <div className="card mb-6">
            <div className="flex items-center gap-2 mb-4 pt-2">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M10 9a4 4 0 100-8 4 4 0 000 8zM2 18c0-3.314 3.582-6 8-6s8 2.686 8 6" stroke="#00C16A" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
              <h2 className="font-semibold text-[#111827]">Emergency Contact</h2>
            </div>
            <p className="text-xs text-[#4B5563] mb-4 -mt-2">
              Required contact for security audits and dispute resolution alerts.
            </p>

            <div className="mb-4">
              <label htmlFor="nextOfKinName" className="label">Full Name</label>
              <input
                id="nextOfKinName"
                type="text"
                placeholder="Tunde Johnson"
                className={`input-field ${errors.nextOfKinName ? 'input-error' : ''}`}
                {...register('nextOfKinName')}
              />
              {errors.nextOfKinName && <p className="error-text">{errors.nextOfKinName.message}</p>}
            </div>

            <div>
              <label htmlFor="nextOfKinPhone" className="label">Phone Number</label>
              <input
                id="nextOfKinPhone"
                type="tel"
                placeholder="08087654321"
                className={`input-field ${errors.nextOfKinPhone ? 'input-error' : ''}`}
                {...register('nextOfKinPhone')}
              />
              {errors.nextOfKinPhone && <p className="error-text">{errors.nextOfKinPhone.message}</p>}
            </div>
          </div>

          {/* Save & Continue */}
          <button type="submit" className="btn-primary mb-8 cursor-pointer">
            Save &amp; Return to Dashboard
          </button>
        </form>
      </div>
    </main>
  );
}
