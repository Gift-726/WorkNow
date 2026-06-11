'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { api } from '@/lib/api';

const schema = z.object({
  // Personal details
  fullName: z.string().min(3, 'Full name is required'),
  phone: z
    .string()
    .regex(/^(\+234|0)[0-9]{10}$/, 'Enter a valid Nigerian phone number'),
  nextOfKinName: z.string().min(2, 'Next of kin name is required'),
  nextOfKinPhone: z
    .string()
    .regex(/^(\+234|0)[0-9]{10}$/, 'Enter a valid phone number'),
  // NIN
  nin: z
    .string()
    .length(11, 'NIN must be exactly 11 digits')
    .regex(/^\d{11}$/, 'NIN must contain only numbers'),
  // BVN
  bvn: z
    .string()
    .length(11, 'BVN must be exactly 11 digits')
    .regex(/^\d{11}$/, 'BVN must contain only numbers'),
});

type FormData = z.infer<typeof schema>;

// Small section header component
function SectionHeader({ icon, title }: { icon: React.ReactNode; title: string }) {
  return (
    <div className="flex items-center gap-2 mb-4 pt-2">
      {icon}
      <h2 className="font-semibold text-[#111827]">{title}</h2>
    </div>
  );
}

// Progress bar
function ProgressBar({ percent }: { percent: number }) {
  return (
    <div className="mb-6">
      <div className="flex justify-between items-center mb-1">
        <span className="text-sm font-medium text-[#111827]">Complete your profile</span>
        <span className="text-sm font-semibold text-[#00C16A]">{percent}%</span>
      </div>
      <div className="h-2 bg-[#E5E7EB] rounded-full overflow-hidden">
        <div
          className="h-full bg-[#00C16A] rounded-full transition-all duration-500"
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}

// File upload area
function FileUploadArea({
  label,
  inputRef,
  fileName,
  onChange,
}: {
  label: string;
  inputRef: React.RefObject<HTMLInputElement | null>;
  fileName: string | null;
  onChange: (file: File) => void;
}) {
  return (
    <div>
      <p className="text-sm text-[#4B5563] mb-2">{label}</p>
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className="w-full border-2 border-dashed border-[#E5E7EB] rounded-[12px] p-4 text-center hover:border-[#00C16A] transition-colors"
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) onChange(file);
          }}
        />
        {fileName ? (
          <span className="text-sm text-[#00C16A] font-medium">{fileName}</span>
        ) : (
          <span className="text-sm text-[#9CA3AF]">Tap to upload photo</span>
        )}
      </button>
    </div>
  );
}

export default function WorkerProfilePage() {
  const router = useRouter();
  const [ninLoading, setNinLoading] = useState(false);
  const [bvnLoading, setBvnLoading] = useState(false);
  const [ninSuccess, setNinSuccess] = useState(false);
  const [bvnSuccess, setBvnSuccess] = useState(false);
  const [serverError, setServerError] = useState('');
  const [profilePhotoName, setProfilePhotoName] = useState<string | null>(null);
  const [ninPhotoName, setNinPhotoName] = useState<string | null>(null);

  const profilePhotoRef = useRef<HTMLInputElement>(null);
  const ninPhotoRef = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const getUserId = (): string | null => {
    try {
      const raw = localStorage.getItem('worknow_user');
      if (!raw) return null;
      return (JSON.parse(raw) as { id: string }).id;
    } catch {
      return null;
    }
  };

  // Verify NIN only
  const handleVerifyNin = async () => {
    const nin = getValues('nin');
    if (!nin || nin.length !== 11) {
      setServerError('Enter a valid 11-digit NIN first');
      return;
    }

    const userId = getUserId();
    if (!userId) {
      router.push('/auth/login');
      return;
    }

    setNinLoading(true);
    setServerError('');
    try {
      const res = await api.users.verify({ userId, nin });
      if (res.success) {
        setNinSuccess(true);
      } else {
        setServerError(res.message);
      }
    } catch {
      setServerError('NIN verification failed. Please try again.');
    } finally {
      setNinLoading(false);
    }
  };

  // Verify BVN only
  const handleVerifyBvn = async () => {
    const bvn = getValues('bvn');
    if (!bvn || bvn.length !== 11) {
      setServerError('Enter a valid 11-digit BVN first');
      return;
    }

    const userId = getUserId();
    if (!userId) {
      router.push('/auth/login');
      return;
    }

    setBvnLoading(true);
    setServerError('');
    try {
      const res = await api.users.verify({ userId, bvn });
      if (res.success) {
        setBvnSuccess(true);
      } else {
        setServerError(res.message);
      }
    } catch {
      setServerError('BVN verification failed. Please try again.');
    } finally {
      setBvnLoading(false);
    }
  };

  // Save personal details and next of kin
  const onSubmit = async (data: FormData) => {
    const userId = getUserId();
    if (!userId) {
      router.push('/auth/login');
      return;
    }

    try {
      await api.users.updateProfile(userId, {
        fullName: data.fullName,
        phone: data.phone,
        nextOfKinName: data.nextOfKinName,
        nextOfKinPhone: data.nextOfKinPhone,
      });

      router.push('/worker');
    } catch {
      setServerError('Failed to save profile. Please try again.');
    }
  };

  return (
    <main className="min-h-screen bg-[#F9FAFB] px-4 py-8">
      <div className="w-full max-w-[560px] mx-auto">

        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <Link href="/auth/role-selection" className="text-[#4B5563] hover:text-[#111827]">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M12.5 15L7.5 10L12.5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </Link>
          <Image src="/logo.png" alt="WorkNow" width={90} height={30} className="object-contain" />
        </div>

        <h1 className="text-2xl font-bold text-[#111827] mb-1">Verify your Identity</h1>
        <p className="text-sm text-[#4B5563] mb-6">
          Complete your profile to start applying for jobs safely.
        </p>

        <ProgressBar percent={10} />

        {serverError && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-[12px] text-sm text-[#EF4444]">
            {serverError}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} noValidate>

          {/* ── PERSONAL DETAILS ── */}
          <div className="card mb-4">
            <SectionHeader
              title="Personal Details"
              icon={
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <circle cx="10" cy="7" r="3.5" stroke="#00C16A" strokeWidth="1.5"/>
                  <path d="M3 17c0-3.314 3.134-6 7-6s7 2.686 7 6" stroke="#00C16A" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
              }
            />

            {/* Profile photo upload */}
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
                className="text-sm text-[#00C16A] font-medium border border-[#00C16A] rounded-[8px] px-4 py-2 hover:bg-[#E6FAF2] transition-colors"
              >
                Upload Photo
              </button>
              <input
                ref={profilePhotoRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => setProfilePhotoName(e.target.files?.[0]?.name ?? null)}
              />
            </div>

            {/* Full name */}
            <div className="mb-4">
              <label htmlFor="fullName" className="label">Full Name</label>
              <input
                id="fullName"
                type="text"
                placeholder="Tunde Bello"
                className={`input-field ${errors.fullName ? 'input-error' : ''}`}
                {...register('fullName')}
              />
              {errors.fullName && <p className="error-text">{errors.fullName.message}</p>}
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
          </div>

          {/* ── NIN VERIFICATION ── */}
          <div className="card mb-4">
            <SectionHeader
              title="ID Verification"
              icon={
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <rect x="2" y="5" width="16" height="10" rx="2" stroke="#00C16A" strokeWidth="1.5"/>
                  <circle cx="7" cy="10" r="2" fill="#00C16A"/>
                  <path d="M11 8h4M11 10h3M11 12h2" stroke="#00C16A" strokeWidth="1.2" strokeLinecap="round"/>
                </svg>
              }
            />

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

            <FileUploadArea
              label="Upload NIN Card / Slip (photo)"
              inputRef={ninPhotoRef}
              fileName={ninPhotoName}
              onChange={(f) => setNinPhotoName(f.name)}
            />

            <button
              type="button"
              disabled={ninLoading || ninSuccess}
              onClick={handleVerifyNin}
              className="btn-primary mt-4"
            >
              {ninSuccess ? '✓ NIN Submitted for Review' : ninLoading ? 'Submitting…' : 'Verify NIN'}
            </button>
          </div>

          {/* ── BVN VERIFICATION ── */}
          <div className="card mb-4">
            <SectionHeader
              title="BVN Verification"
              icon={
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <rect x="3" y="4" width="14" height="12" rx="2" stroke="#00C16A" strokeWidth="1.5"/>
                  <path d="M7 9h6M7 12h4" stroke="#00C16A" strokeWidth="1.2" strokeLinecap="round"/>
                </svg>
              }
            />

            <div className="mb-3">
              <label htmlFor="bvn" className="label">
                BVN Number
                {bvnSuccess && (
                  <span className="ml-2 text-xs text-[#00C16A] font-medium">✓ Submitted</span>
                )}
              </label>
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

            <button
              type="button"
              disabled={bvnLoading || bvnSuccess}
              onClick={handleVerifyBvn}
              className="btn-primary mt-3"
            >
              {bvnSuccess ? '✓ BVN Submitted for Review' : bvnLoading ? 'Submitting…' : 'Verify BVN'}
            </button>
          </div>

          {/* ── NEXT OF KIN ── */}
          <div className="card mb-6">
            <SectionHeader
              title="Next of Kin"
              icon={
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <path d="M10 9a4 4 0 100-8 4 4 0 000 8zM2 18c0-3.314 3.582-6 8-6s8 2.686 8 6" stroke="#00C16A" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
              }
            />
            <p className="text-xs text-[#4B5563] mb-4 -mt-2">
              This person will be alerted if you trigger an SOS during a job.
            </p>

            <div className="mb-4">
              <label htmlFor="nextOfKinName" className="label">Next of Kin Name</label>
              <input
                id="nextOfKinName"
                type="text"
                placeholder="Amaka Bello"
                className={`input-field ${errors.nextOfKinName ? 'input-error' : ''}`}
                {...register('nextOfKinName')}
              />
              {errors.nextOfKinName && <p className="error-text">{errors.nextOfKinName.message}</p>}
            </div>

            <div>
              <label htmlFor="nextOfKinPhone" className="label">Next of Kin Phone</label>
              <input
                id="nextOfKinPhone"
                type="tel"
                placeholder="08012345678"
                className={`input-field ${errors.nextOfKinPhone ? 'input-error' : ''}`}
                {...register('nextOfKinPhone')}
              />
              {errors.nextOfKinPhone && <p className="error-text">{errors.nextOfKinPhone.message}</p>}
            </div>
          </div>

          {/* Save & Continue */}
          <button type="submit" className="btn-primary mb-8">
            Save &amp; Continue
          </button>
        </form>
      </div>
    </main>
  );
}
