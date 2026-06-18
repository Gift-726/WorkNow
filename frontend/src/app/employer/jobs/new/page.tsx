'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { api, JobPayPeriod } from '@/lib/api';

const jobSchema = z.object({
  title: z.string().min(3, 'Job title is required'),
  category: z.string().min(1, 'Category is required'),
  location: z.string().min(3, 'Location is required'),
  slotsAvailable: z.number().min(1, 'Slots must be at least 1'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  jobType: z.string().min(1, 'Job type is required'),
  estimatedDuration: z.string().min(1, 'Estimated duration is required'),
  paymentType: z.string().min(1, 'Payment type is required'),
  amount: z.number().min(100, 'Minimum pay amount is ₦100'),
});

type FormData = z.infer<typeof jobSchema>;

export default function CreateJobPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState('');
  
  // OPay Checkout simulation state
  const [showCheckout, setShowCheckout] = useState(false);
  const [pendingJobData, setPendingJobData] = useState<FormData | null>(null);
  const [paying, setPaying] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(jobSchema),
    defaultValues: {
      slotsAvailable: 5,
      category: 'Event',
      jobType: 'Salary-based',
      paymentType: 'Monthly',
      amount: 5000,
    }
  });

  const onSubmit = (data: FormData) => {
    // Open OPay checkout modal first to fund escrow
    setPendingJobData(data);
    setShowCheckout(true);
  };

  const handleConfirmOPayPayment = async () => {
    if (!pendingJobData) return;
    setPaying(true);
    setServerError('');

    try {
      // Create job in the backend
      const res = await api.jobs.create({
        title: pendingJobData.title,
        description: pendingJobData.description,
        type: pendingJobData.category,
        location: pendingJobData.location,
        pay: pendingJobData.amount,
        // Map form payPeriod to api payPeriod
        payPeriod: (pendingJobData.paymentType === 'Monthly' 
          ? 'month' 
          : pendingJobData.paymentType === 'Hourly' 
            ? 'hr' 
            : pendingJobData.paymentType === 'Daily' 
              ? 'day' 
              : 'fixed') as JobPayPeriod,
        slotsAvailable: pendingJobData.slotsAvailable,
        estimatedDuration: pendingJobData.estimatedDuration,
      });

      if (res.success) {
        // Success payment notification & redirect
        setShowCheckout(false);
        router.push('/employer');
      } else {
        setServerError(res.message || 'Failed to create job');
        setShowCheckout(false);
      }
    } catch {
      setServerError('An error occurred. Please try again.');
      setShowCheckout(false);
    } finally {
      setPaying(false);
    }
  };

  return (
    <div className="p-6 md:p-8 max-w-3xl mx-auto w-full relative">
      {/* Header breadcrumbs */}
      <div className="flex items-center gap-2 text-xs text-[#9CA3AF] mb-4">
        <button onClick={() => router.push('/employer')} className="hover:text-[#00C16A] cursor-pointer">
          Dashboard
        </button>
        <span>/</span>
        <span className="font-medium">Create Job</span>
      </div>

      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#111827]">Create Job</h1>
        <p className="text-sm text-[#4B5563] mt-1">
          Define your job requirements to connect with the right workers.
        </p>
      </div>

      {serverError && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-[12px] text-sm text-[#EF4444]">
          {serverError}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6" noValidate>
        {/* SECTION 1: Job Overview */}
        <div className="card">
          <h2 className="text-base font-bold text-[#111827] mb-4 border-b border-[#E5E7EB] pb-2">
            Job Overview
          </h2>

          <div className="flex flex-col gap-4">
            {/* Job Title */}
            <div>
              <label htmlFor="title" className="label">Job Title</label>
              <input
                id="title"
                type="text"
                placeholder="Event setup crew"
                className={`input-field ${errors.title ? 'input-error' : ''}`}
                {...register('title')}
              />
              {errors.title && <p className="error-text">{errors.title.message}</p>}
            </div>

            {/* Category & Location */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="category" className="label">Category</label>
                <select
                  id="category"
                  className="input-field cursor-pointer"
                  {...register('category')}
                >
                  <option value="Event">Event Helpers</option>
                  <option value="Logistics">Logistics / Delivery</option>
                  <option value="Retail">Retail / Sales</option>
                  <option value="Cleaning">Cleaning / Sanitization</option>
                  <option value="Catering">Catering / Cooking</option>
                  <option value="Artisan">Artisan (Electrician/Plumber)</option>
                </select>
                {errors.category && <p className="error-text">{errors.category.message}</p>}
              </div>

              <div>
                <label htmlFor="location" className="label">Location</label>
                <input
                  id="location"
                  type="text"
                  placeholder="Lagos Island, Lagos"
                  className={`input-field ${errors.location ? 'input-error' : ''}`}
                  {...register('location')}
                />
                {errors.location && <p className="error-text">{errors.location.message}</p>}
              </div>
            </div>

            {/* Slots available */}
            <div>
              <label htmlFor="slotsAvailable" className="label">Slots / Workers Needed</label>
              <select
                id="slotsAvailable"
                className="input-field cursor-pointer"
                {...register('slotsAvailable', { valueAsNumber: true })}
              >
                {[1, 2, 3, 4, 5, 10, 15, 20].map((num) => (
                  <option key={num} value={num}>
                    {num}
                  </option>
                ))}
              </select>
              {errors.slotsAvailable && <p className="error-text">{errors.slotsAvailable.message}</p>}
            </div>

            {/* Description */}
            <div>
              <label htmlFor="description" className="label">Description</label>
              <textarea
                id="description"
                placeholder="Enter your job description details (e.g. duties, requirements, setup location)..."
                rows={4}
                className={`input-field !py-3 !h-auto ${errors.description ? 'input-error' : ''}`}
                {...register('description')}
              />
              {errors.description && <p className="error-text">{errors.description.message}</p>}
            </div>

            {/* Mock Attachment Button */}
            <div>
              <button
                type="button"
                className="inline-flex items-center gap-2 px-4 py-2 border border-[#E5E7EB] hover:border-[#00C16A] text-sm font-semibold rounded-[12px] text-[#4B5563] hover:text-[#00C16A] transition-all cursor-pointer"
                onClick={() => alert('Mock file attachment activated (supports images, slips up to 25MB).')}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48" />
                </svg>
                Attach file
              </button>
              <p className="text-[10px] text-[#9CA3AF] mt-1">Max file size: 25 MB</p>
            </div>
          </div>
        </div>

        {/* SECTION 2: Scope & Timeline */}
        <div className="card">
          <h2 className="text-base font-bold text-[#111827] mb-4 border-b border-[#E5E7EB] pb-2">
            Scope & Timeline
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="jobType" className="label">Job Type</label>
              <select
                id="jobType"
                className="input-field cursor-pointer"
                {...register('jobType')}
              >
                <option value="Salary-based">Salary-based (Ongoing)</option>
                <option value="Per-hour">Per hour (Shift-based)</option>
                <option value="One-Off">One-Off (Task-based)</option>
              </select>
              {errors.jobType && <p className="error-text">{errors.jobType.message}</p>}
            </div>

            <div>
              <label htmlFor="estimatedDuration" className="label">Estimated Duration</label>
              <input
                id="estimatedDuration"
                type="text"
                placeholder="1 Day"
                className={`input-field ${errors.estimatedDuration ? 'input-error' : ''}`}
                {...register('estimatedDuration')}
              />
              {errors.estimatedDuration && <p className="error-text">{errors.estimatedDuration.message}</p>}
            </div>
          </div>
        </div>

        {/* SECTION 3: Budget & Rewards */}
        <div className="card">
          <h2 className="text-base font-bold text-[#111827] mb-4 border-b border-[#E5E7EB] pb-2">
            Budget & Rewards
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="paymentType" className="label">Payment Type</label>
              <select
                id="paymentType"
                className="input-field cursor-pointer"
                {...register('paymentType')}
              >
                <option value="Monthly">Monthly</option>
                <option value="Daily">Daily</option>
                <option value="Hourly">Hourly</option>
                <option value="Flat">Flat Fee</option>
              </select>
              {errors.paymentType && <p className="error-text">{errors.paymentType.message}</p>}
            </div>

            <div>
              <label htmlFor="amount" className="label">Amount (NGN)</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-500 font-medium">
                  ₦
                </span>
                <input
                  id="amount"
                  type="number"
                  placeholder="0.00"
                  className={`input-field !pl-8 ${errors.amount ? 'input-error' : ''}`}
                  {...register('amount', { valueAsNumber: true })}
                />
              </div>
              {errors.amount && <p className="error-text">{errors.amount.message}</p>}
            </div>
          </div>
        </div>

        {/* Form Action Button */}
        <div className="flex justify-end gap-3 mt-4">
          <button
            type="button"
            onClick={() => router.push('/employer')}
            className="btn-secondary !w-auto !min-h-[48px] px-6"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="btn-primary !w-auto !min-h-[48px] px-8 cursor-pointer"
          >
            Create Job
          </button>
        </div>
      </form>

      {/* Simulated OPay Escrow Payment Modal */}
      {showCheckout && pendingJobData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            onClick={() => setShowCheckout(false)}
            className="absolute inset-0 bg-black/60 backdrop-blur-[2px]"
          />

          <div className="relative bg-white w-full max-w-md rounded-[12px] p-6 shadow-2xl flex flex-col z-10 animate-scale-up border border-[#E5E7EB]">
            {/* OPay Brand Bar */}
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-[#00C16A] flex items-center justify-center text-white font-bold text-lg">
                  op
                </div>
                <span className="font-black text-[#00C16A] text-lg">OPay Escrow Checkout</span>
              </div>
              <button 
                onClick={() => setShowCheckout(false)} 
                className="text-gray-400 hover:text-gray-600 font-bold"
              >
                ✕
              </button>
            </div>

            {/* Escrow details info box */}
            <div className="bg-[#E6FAF2] border border-[#00C16A] rounded-[12px] p-4 mb-6 flex flex-col gap-2">
              <div className="text-xs text-[#00C16A] font-bold uppercase tracking-wider">Milestone Escrow</div>
              <div className="text-2xl font-black text-[#111827]">
                ₦{(pendingJobData.amount * pendingJobData.slotsAvailable).toLocaleString('en-NG')}
              </div>
              <div className="text-[11px] text-[#4B5563] leading-relaxed">
                Funds will be locked in OPay Escrow. Payout is guaranteed and only released once you verify completion of each gig slot.
              </div>
            </div>

            <div className="flex flex-col gap-4 text-xs text-[#4B5563] mb-6">
              <div className="flex justify-between border-b border-[#F3F4F6] pb-2">
                <span>Job Title</span>
                <span className="font-semibold text-[#111827]">{pendingJobData.title}</span>
              </div>
              <div className="flex justify-between border-b border-[#F3F4F6] pb-2">
                <span>Workers Slots Needed</span>
                <span className="font-semibold text-[#111827]">{pendingJobData.slotsAvailable}</span>
              </div>
              <div className="flex justify-between border-b border-[#F3F4F6] pb-2">
                <span>Rate per Worker</span>
                <span className="font-semibold text-[#111827]">₦{pendingJobData.amount.toLocaleString()} ({pendingJobData.paymentType})</span>
              </div>
            </div>

            {/* Payment buttons */}
            <button
              onClick={handleConfirmOPayPayment}
              disabled={paying}
              className="btn-primary !min-h-[48px] w-full flex items-center justify-center gap-2 cursor-pointer"
            >
              {paying ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                'Lock Funds & Create Listing'
              )}
            </button>
            
            <p className="text-[10px] text-[#9CA3AF] text-center mt-3">
              Powered by OPay payment layer. Securing casual labor payments across Nigeria.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
