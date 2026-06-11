'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { api, Application, formatPay } from '@/lib/api';

const CATEGORIES = [
  'All Categories',
  'Event',
  'Logistics',
  'Retail',
  'Cleaning',
  'Catering',
  'Artisan'
];

export default function MyApplicationsPage() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [stats, setStats] = useState({ totalApplications: 0, pending: 0, completedJobs: 0 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All Categories');

  const fetchApplications = async () => {
    setLoading(true);
    try {
      const res = await api.applications.mine();
      if (res.success && res.data) {
        setApplications(res.data.applications);
        setStats(res.data.stats);
      }
    } catch (err) {
      console.error('Failed to fetch applications', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  // Client-side filtering of applications based on search and category
  const filteredApps = applications.filter((app) => {
    const job = app.job;
    if (!job) return false;

    const matchesSearch =
      job.title.toLowerCase().includes(search.toLowerCase()) ||
      job.description.toLowerCase().includes(search.toLowerCase()) ||
      job.location.toLowerCase().includes(search.toLowerCase());

    const matchesCategory =
      category === 'All Categories' ||
      job.type.toLowerCase() === category.toLowerCase();

    return matchesSearch && matchesCategory;
  });

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto w-full">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[#111827]">My Applications</h1>
        <p className="text-sm text-[#4B5563] mt-1">
          Track the status of your applications and job proposals.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
        {/* Stat Card 1 */}
        <div className="bg-white border border-[#E5E7EB] rounded-[12px] p-5 flex items-center justify-between">
          <div>
            <span className="text-[11px] text-[#9CA3AF] uppercase font-bold tracking-wider block">Total Applications</span>
            <span className="text-3xl font-extrabold text-[#111827] mt-1 block">
              {loading ? '...' : stats.totalApplications}
            </span>
          </div>
          <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M10 3a7 7 0 100 14 7 7 0 000-14zm-4 7h8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </div>
        </div>

        {/* Stat Card 2 */}
        <div className="bg-white border border-[#E5E7EB] rounded-[12px] p-5 flex items-center justify-between">
          <div>
            <span className="text-[11px] text-[#9CA3AF] uppercase font-bold tracking-wider block">Pending Review</span>
            <span className="text-3xl font-extrabold text-amber-500 mt-1 block">
              {loading ? '...' : stats.pending}
            </span>
          </div>
          <div className="w-10 h-10 rounded-full bg-amber-50 text-amber-500 flex items-center justify-center shrink-0">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <path d="M12 6v6l4 2" />
            </svg>
          </div>
        </div>

        {/* Stat Card 3 */}
        <div className="bg-white border border-[#E5E7EB] rounded-[12px] p-5 flex items-center justify-between">
          <div>
            <span className="text-[11px] text-[#9CA3AF] uppercase font-bold tracking-wider block">Hired / Completed</span>
            <span className="text-3xl font-extrabold text-[#00C16A] mt-1 block">
              {loading ? '...' : stats.completedJobs}
            </span>
          </div>
          <div className="w-10 h-10 rounded-full bg-emerald-50 text-[#00C16A] flex items-center justify-center shrink-0">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#9CA3AF]">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </span>
          <input
            type="text"
            placeholder="Search applied jobs..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-field !pl-10"
          />
        </div>

        <div className="w-full sm:w-[200px]">
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="input-field appearance-none bg-no-repeat bg-[right_14px_center] pr-10 cursor-pointer"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
              backgroundSize: '1.25rem'
            }}
          >
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Applications list */}
      {loading ? (
        <div className="flex flex-col gap-4">
          {[1, 2].map((i) => (
            <div key={i} className="bg-white border border-[#E5E7EB] rounded-[12px] p-5 animate-pulse h-[140px]" />
          ))}
        </div>
      ) : filteredApps.length === 0 ? (
        <div className="bg-white border border-[#E5E7EB] rounded-[12px] p-12 text-center max-w-md mx-auto mt-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gray-50 text-[#9CA3AF] mb-4">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 12h6M9 16h6M9 8h6M5 3a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2V5a2 2 0 00-2-2H5z" />
            </svg>
          </div>
          <h3 className="text-base font-bold text-[#111827] mb-1">No applications found</h3>
          <p className="text-sm text-[#4B5563] leading-relaxed">
            {applications.length === 0
              ? 'You have not applied for any jobs yet. Check out the dashboard to find available work.'
              : 'No applications match your active filters. Try searching for something else.'}
          </p>
          {applications.length === 0 ? (
            <Link href="/worker" className="btn-primary mt-4 inline-block max-w-[200px] text-sm">
              Find Gigs
            </Link>
          ) : (
            <button
              onClick={() => {
                setSearch('');
                setCategory('All Categories');
              }}
              className="mt-4 text-xs font-bold text-[#00C16A] hover:underline"
            >
              Clear Filters
            </button>
          )}
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {filteredApps.map((app) => {
            const job = app.job;
            if (!job) return null;

            return (
              <div
                key={app.id}
                className="bg-white border border-[#E5E7EB] rounded-[12px] p-5 hover:border-[#00C16A] transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                {/* Job / Application Details */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#E6FAF2] text-[#00C16A]">
                      {job.type}
                    </span>
                    <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      app.status === 'PENDING'
                        ? 'bg-amber-50 text-amber-600'
                        : app.status === 'ACCEPTED'
                          ? 'bg-emerald-50 text-emerald-600'
                          : 'bg-red-50 text-red-600'
                    }`}>
                      {app.status}
                    </span>
                  </div>

                  <h3 className="font-bold text-base text-[#111827] truncate">
                    {job.title}
                  </h3>

                  {/* Location & Pay info */}
                  <div className="flex flex-wrap items-center gap-y-1 gap-x-3 text-xs text-[#4B5563] mt-1">
                    <span className="flex items-center gap-1 font-medium text-[#00C16A]">
                      {formatPay(job.pay, job.payPeriod)}
                    </span>
                    <span className="w-1 h-1 rounded-full bg-[#E5E7EB]" />
                    <span>{job.location}</span>
                    <span className="w-1 h-1 rounded-full bg-[#E5E7EB]" />
                    <span>Duration: {job.estimatedDuration}</span>
                  </div>

                  {app.message && (
                    <p className="text-xs text-[#9CA3AF] mt-3 italic line-clamp-1 border-l-2 border-[#E5E7EB] pl-2">
                      &ldquo;{app.message}&rdquo;
                    </p>
                  )}
                </div>

                {/* View Details Link */}
                <div className="shrink-0 flex items-center">
                  <Link
                    href={`/worker/jobs/${job.id}`}
                    className="px-4 py-2 border border-[#E5E7EB] hover:border-[#00C16A] text-[#4B5563] hover:text-[#00C16A] text-xs font-semibold rounded-[8px] transition-all text-center w-full md:w-auto"
                  >
                    View Details
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
