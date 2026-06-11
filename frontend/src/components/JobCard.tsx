import Link from 'next/link';
import { Job, formatPay } from '@/lib/api';

interface JobCardProps {
  job: Job;
  actionLabel?: string;
  onActionClick?: () => void;
}

export default function JobCard({ job, actionLabel, onActionClick }: JobCardProps) {
  return (
    <div className="bg-white border border-[#E5E7EB] rounded-[12px] p-5 hover:border-[#00C16A] hover:shadow-[0_4px_20px_rgba(0,193,106,0.05)] transition-all flex flex-col justify-between">
      <div>
        {/* Top Header info */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div>
            <span className="inline-block px-2.5 py-1 rounded-full text-xs font-semibold bg-[#E6FAF2] text-[#00C16A] mb-2">
              {job.type}
            </span>
            <h3 className="font-bold text-base text-[#111827] line-clamp-1">
              {job.title}
            </h3>
          </div>
          <div className="text-right shrink-0">
            <span className="font-bold text-base text-[#00C16A]">
              {formatPay(job.pay, job.payPeriod)}
            </span>
            <p className="text-xs text-[#9CA3AF] mt-0.5">{job.postedAgo || 'Just now'}</p>
          </div>
        </div>

        {/* Location & Duration */}
        <div className="flex flex-wrap items-center gap-y-1 gap-x-3 text-xs text-[#4B5563] mb-3">
          <span className="flex items-center gap-1">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className="text-[#9CA3AF]">
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" fill="currentColor"/>
            </svg>
            {job.location}
          </span>
          <span className="w-1.5 h-1.5 rounded-full bg-[#E5E7EB]" />
          <span className="flex items-center gap-1">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className="text-[#9CA3AF]">
              <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67V7z" fill="currentColor"/>
            </svg>
            {job.estimatedDuration}
          </span>
        </div>

        {/* Description */}
        <p className="text-xs text-[#4B5563] line-clamp-2 mb-4 leading-relaxed">
          {job.description}
        </p>
      </div>

      {/* Footer Info & CTA */}
      <div className="flex items-center justify-between border-t border-[#F3F4F6] pt-4 mt-auto">
        <div className="flex items-center gap-3">
          {/* Slots Left Badge */}
          <span className={`px-2 py-0.5 rounded-[4px] text-[11px] font-bold ${
            job.slotsLeft <= 1 
              ? 'bg-red-50 text-red-600' 
              : job.slotsLeft <= 3 
                ? 'bg-amber-50 text-amber-600' 
                : 'bg-emerald-50 text-emerald-600'
          }`}>
            {job.slotsLeft} slot{job.slotsLeft !== 1 ? 's' : ''} left
          </span>
          
          <span className="text-[11px] text-[#9CA3AF]">
            {job.applicantCount || 0} applicant{job.applicantCount !== 1 ? 's' : ''}
          </span>
        </div>

        {onActionClick ? (
          <button
            onClick={onActionClick}
            className="px-4 py-2 bg-[#00C16A] hover:bg-[#00A558] text-white font-semibold text-xs rounded-[8px] transition-colors shrink-0"
          >
            {actionLabel || 'Apply Now'}
          </button>
        ) : (
          <Link
            href={`/worker/jobs/${job.id}`}
            className="px-4 py-2 bg-[#E6FAF2] hover:bg-[#00C16A] text-[#00C16A] hover:text-white font-semibold text-xs rounded-[8px] transition-all shrink-0 text-center"
          >
            {actionLabel || 'View Details'}
          </Link>
        )}
      </div>
    </div>
  );
}
