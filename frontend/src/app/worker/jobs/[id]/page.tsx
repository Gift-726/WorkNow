'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { api, Job, formatPay } from '@/lib/api';

export default function JobDetailPage() {
  const params = useParams();
  const router = useRouter();
  const jobId = params.id as string;

  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [existingApplication, setExistingApplication] = useState<any>(null);

  const fetchData = async () => {
    setLoading(true);
    setError('');
    try {
      const jobRes = await api.jobs.getById(jobId);
      if (jobRes.success && jobRes.data) {
        setJob(jobRes.data);
      } else {
        setError(jobRes.message || 'Job not found');
        return;
      }

      // Check if already applied
      const appsRes = await api.applications.mine();
      if (appsRes.success && appsRes.data?.applications) {
        const found = appsRes.data.applications.find((a) => a.jobId === jobId);
        if (found) {
          setExistingApplication(found);
        }
      }
    } catch (err) {
      console.error(err);
      setError('An error occurred while loading job details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (jobId) {
      fetchData();
    }
  }, [jobId]);

  const handleApply = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      const res = await api.jobs.apply(jobId, message);
      if (res.success) {
        setSubmitted(true);
      } else {
        setError(res.message);
      }
    } catch (err) {
      console.error(err);
      setError('Failed to submit application. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6 md:p-8 max-w-4xl mx-auto w-full flex-1 flex flex-col justify-center items-center">
        <div className="w-8 h-8 border-4 border-[#00C16A] border-t-transparent rounded-full animate-spin mb-3" />
        <p className="text-sm text-[#4B5563]">Loading gig details...</p>
      </div>
    );
  }

  if (error && !job) {
    return (
      <div className="p-6 md:p-8 max-w-4xl mx-auto w-full">
        <div className="bg-red-50 border border-red-200 rounded-[12px] p-6 text-center">
          <p className="text-[#EF4444] font-medium mb-4">{error}</p>
          <Link
            href="/worker"
            className="inline-flex items-center gap-2 text-sm font-semibold text-[#00C16A] hover:underline"
          >
            ← Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="p-6 md:p-8 max-w-xl mx-auto w-full flex-1 flex items-center justify-center">
        <div className="bg-white border border-[#E5E7EB] rounded-[16px] p-8 text-center shadow-sm w-full">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#E6FAF2] text-[#00C16A] mb-5">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-[#111827] mb-2">Application Submitted!</h2>
          <p className="text-sm text-[#4B5563] mb-6 leading-relaxed">
            Ogbonge worker! Your application has been sent to the employer. We will notify you once they accept.
          </p>
          <div className="flex flex-col gap-3">
            <Link href="/worker/applications" className="btn-primary">
              View My Applications
            </Link>
            <Link
              href="/worker"
              className="btn-secondary"
            >
              Back to Dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 max-w-5xl mx-auto w-full">
      {/* Back to feed */}
      <Link
        href="/worker"
        className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#4B5563] hover:text-[#111827] mb-6 transition-colors"
      >
        <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
          <path d="M12.5 15L7.5 10L12.5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        Back to Dashboard
      </Link>

      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Job Details */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          <div className="bg-white border border-[#E5E7EB] rounded-[12px] p-6">
            <div className="flex items-start justify-between gap-4 mb-4">
              <div>
                <span className="inline-block px-2.5 py-1 rounded-full text-xs font-semibold bg-[#E6FAF2] text-[#00C16A] mb-3">
                  {job?.type}
                </span>
                <h1 className="text-xl md:text-2xl font-bold text-[#111827]">
                  {job?.title}
                </h1>
              </div>
              <div className="text-right shrink-0">
                <span className="font-extrabold text-xl md:text-2xl text-[#00C16A]">
                  {job && formatPay(job.pay, job.payPeriod)}
                </span>
                <p className="text-xs text-[#9CA3AF] mt-1">Posted {job?.postedAgo}</p>
              </div>
            </div>

            {/* Quick Specs */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-4 my-4 border-y border-[#F3F4F6]">
              <div>
                <span className="text-[11px] text-[#9CA3AF] block uppercase font-bold tracking-wider">Location</span>
                <span className="text-sm font-semibold text-[#111827] mt-0.5 block">{job?.location}</span>
              </div>
              <div>
                <span className="text-[11px] text-[#9CA3AF] block uppercase font-bold tracking-wider">Duration</span>
                <span className="text-sm font-semibold text-[#111827] mt-0.5 block">{job?.estimatedDuration}</span>
              </div>
              <div>
                <span className="text-[11px] text-[#9CA3AF] block uppercase font-bold tracking-wider">Slots Left</span>
                <span className="text-sm font-semibold text-[#111827] mt-0.5 block">
                  {job?.slotsLeft} / {job?.slotsAvailable} Available
                </span>
              </div>
              <div>
                <span className="text-[11px] text-[#9CA3AF] block uppercase font-bold tracking-wider">Applicants</span>
                <span className="text-sm font-semibold text-[#111827] mt-0.5 block">{job?.applicantCount || 0} applied</span>
              </div>
            </div>

            {/* Project Description */}
            <div className="mt-4">
              <h3 className="font-bold text-[#111827] text-base mb-3">Project Description</h3>
              <p className="text-sm text-[#4B5563] leading-relaxed whitespace-pre-wrap">
                {job?.description}
              </p>
            </div>
          </div>

          {/* Safety & Escrow Assurance Notice */}
          <div className="bg-white border border-[#E5E7EB] rounded-[12px] p-5 flex gap-4 items-start">
            <div className="w-10 h-10 rounded-full bg-[#E6FAF2] text-[#00C16A] flex items-center justify-center shrink-0">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M10 2a6 6 0 00-6 6v3a2 2 0 00-2 2v2a2 2 0 002 2h12a2 2 0 002-2v-2a2 2 0 00-2-2v-3a6 6 0 00-6-6zm-4 6a4 4 0 118 0v3H6V8z" fill="currentColor"/>
              </svg>
            </div>
            <div>
              <h4 className="font-bold text-sm text-[#111827] mb-1">WorkNow Escrow Guarantee</h4>
              <p className="text-xs text-[#4B5563] leading-relaxed">
                The funds for this gig are locked in escrow and guaranteed by OPay. Once the job is approved by the employer, payout will land immediately in your OPay wallet.
              </p>
            </div>
          </div>
        </div>

        {/* Right Column: Apply / Proposal Form */}
        <div className="flex flex-col gap-6">
          <div className="bg-white border border-[#E5E7EB] rounded-[12px] p-6 shadow-sm">
            {existingApplication ? (
              <div className="text-center">
                <span className={`inline-block px-3 py-1.5 rounded-full text-xs font-bold mb-4 ${
                  existingApplication.status === 'PENDING' 
                    ? 'bg-amber-50 text-amber-600 border border-amber-200'
                    : existingApplication.status === 'ACCEPTED'
                      ? 'bg-emerald-50 text-emerald-600 border border-emerald-200'
                      : 'bg-red-50 text-red-600 border border-red-200'
                }`}>
                  Application status: {existingApplication.status}
                </span>
                
                <h3 className="font-bold text-[#111827] text-base mb-2">Already Applied</h3>
                <p className="text-xs text-[#4B5563] leading-relaxed mb-4">
                  You applied for this job on {new Date(existingApplication.createdAt).toLocaleDateString()}. Your message was:
                </p>
                <div className="bg-[#F9FAFB] p-3 rounded-[8px] text-xs text-left text-[#4B5563] border border-[#E5E7EB] italic max-h-[120px] overflow-y-auto mb-4">
                  &ldquo;{existingApplication.message || 'No custom message.'}&rdquo;
                </div>
                <Link href="/worker/applications" className="btn-secondary text-xs py-2 h-auto min-h-0 w-full inline-block text-center">
                  Manage Applications
                </Link>
              </div>
            ) : (
              <form onSubmit={handleApply}>
                <h3 className="font-bold text-[#111827] text-base mb-2">Apply for this Job</h3>
                <p className="text-xs text-[#4B5563] mb-4">
                  Write a short message to the employer explaining why you&apos;re suitable.
                </p>

                {error && (
                  <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-[8px] text-xs text-[#EF4444]">
                    {error}
                  </div>
                )}

                <div className="mb-4">
                  <label htmlFor="message" className="label text-xs">Message to Employer</label>
                  <textarea
                    id="message"
                    rows={4}
                    placeholder="I am experienced, fit, and live near Lagos Island. Ready to start immediately."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    required
                    className="w-full border border-[#E5E7EB] rounded-[12px] p-3 text-sm focus:border-[#00C16A] outline-none resize-none transition-colors"
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="btn-primary w-full"
                >
                  {submitting ? 'Submitting...' : 'Submit Application'}
                </button>
              </form>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
