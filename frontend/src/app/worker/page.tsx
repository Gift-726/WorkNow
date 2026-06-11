'use client';

import { useEffect, useState } from 'react';
import { api, Job, getStoredUser } from '@/lib/api';
import JobCard from '@/components/JobCard';

const CATEGORIES = [
  'All Categories',
  'Event',
  'Logistics',
  'Retail',
  'Cleaning',
  'Catering',
  'Artisan'
];

export default function WorkerDashboard() {
  const [user, setUser] = useState<any>(null);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All Categories');
  const [activeTab, setActiveTab] = useState<'available' | 'active' | 'completed'>('available');

  useEffect(() => {
    setUser(getStoredUser());
  }, []);

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const res = await api.jobs.list({
        search: search.trim() || undefined,
        category: category !== 'All Categories' ? category : undefined,
      });
      if (res.success && res.data) {
        setJobs(res.data);
      }
    } catch (err) {
      console.error('Failed to fetch jobs', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'available') {
      fetchJobs();
    }
  }, [search, category, activeTab]);

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto w-full">
      {/* Top Welcome Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-[#111827]">
            Welcome back, {user?.fullName || 'Worker'}! 👋
          </h1>
          <p className="text-sm text-[#4B5563] mt-1">
            Find casual jobs, work safely, and get paid guaranteed.
          </p>
        </div>
        
        {/* User Card Badge */}
        <div className="flex items-center gap-3 bg-white border border-[#E5E7EB] rounded-full px-4 py-2 shrink-0 self-start md:self-auto shadow-sm">
          <div className="w-8 h-8 rounded-full bg-[#E6FAF2] flex items-center justify-center text-[#00C16A] font-bold text-sm">
            {user?.fullName?.charAt(0).toUpperCase() || 'W'}
          </div>
          <div>
            <div className="text-xs font-semibold text-[#111827]">{user?.fullName}</div>
            <div className="text-[10px] text-[#00C16A] font-bold flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#00C16A] animate-pulse" />
              Verified Worker
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-[#E5E7EB] mb-6 flex gap-6">
        <button
          onClick={() => setActiveTab('available')}
          className={`pb-3 text-sm font-semibold transition-all relative ${
            activeTab === 'available'
              ? 'text-[#00C16A]'
              : 'text-[#9CA3AF] hover:text-[#4B5563]'
          }`}
        >
          Available Jobs {activeTab === 'available' && jobs.length > 0 && `(${jobs.length})`}
          {activeTab === 'available' && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#00C16A] rounded-full" />
          )}
        </button>
        <button
          onClick={() => setActiveTab('active')}
          className={`pb-3 text-sm font-semibold transition-all relative ${
            activeTab === 'active'
              ? 'text-[#00C16A]'
              : 'text-[#9CA3AF] hover:text-[#4B5563]'
          }`}
        >
          Active Jobs (0)
          {activeTab === 'active' && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#00C16A] rounded-full" />
          )}
        </button>
        <button
          onClick={() => setActiveTab('completed')}
          className={`pb-3 text-sm font-semibold transition-all relative ${
            activeTab === 'completed'
              ? 'text-[#00C16A]'
              : 'text-[#9CA3AF] hover:text-[#4B5563]'
          }`}
        >
          Completed Jobs (0)
          {activeTab === 'completed' && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#00C16A] rounded-full" />
          )}
        </button>
      </div>

      {activeTab === 'available' ? (
        <>
          {/* Filters Bar */}
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
                placeholder="Search job title, location or keywords..."
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

          {/* Jobs Feed */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="bg-white border border-[#E5E7EB] rounded-[12px] p-5 animate-pulse flex flex-col justify-between h-[180px]">
                  <div>
                    <div className="w-20 h-4 bg-gray-200 rounded-full mb-3" />
                    <div className="w-2/3 h-5 bg-gray-200 rounded mb-2" />
                    <div className="w-full h-3 bg-gray-200 rounded mb-1" />
                    <div className="w-4/5 h-3 bg-gray-200 rounded" />
                  </div>
                  <div className="flex items-center justify-between border-t border-[#F3F4F6] pt-4 mt-auto">
                    <div className="w-24 h-4 bg-gray-200 rounded" />
                    <div className="w-20 h-8 bg-gray-200 rounded" />
                  </div>
                </div>
              ))}
            </div>
          ) : jobs.length === 0 ? (
            <div className="bg-white border border-[#E5E7EB] rounded-[12px] p-12 text-center max-w-md mx-auto mt-8">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-[#E6FAF2] text-[#00C16A] mb-4">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <h3 className="text-base font-bold text-[#111827] mb-1">No jobs found</h3>
              <p className="text-sm text-[#4B5563] leading-relaxed">
                We couldn&apos;t find any open jobs matching your search parameters. Try clearing your filters or checking back later.
              </p>
              {(search || category !== 'All Categories') && (
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {jobs.map((job) => (
                <JobCard key={job.id} job={job} />
              ))}
            </div>
          )}
        </>
      ) : (
        /* Empty states for Active / Completed tabs */
        <div className="bg-white border border-[#E5E7EB] rounded-[12px] p-12 text-center max-w-md mx-auto mt-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gray-50 text-[#9CA3AF] mb-4">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <h3 className="text-base font-bold text-[#111827] mb-1">No {activeTab} jobs</h3>
          <p className="text-sm text-[#4B5563] leading-relaxed">
            {activeTab === 'active'
              ? 'You do not have any jobs in progress right now. Apply for jobs to get started!'
              : 'You have not completed any jobs yet. Earn ratings and build your record by completing gigs.'}
          </p>
          <button
            onClick={() => setActiveTab('available')}
            className="mt-4 text-xs font-bold text-[#00C16A] hover:underline"
          >
            Browse Available Jobs
          </button>
        </div>
      )}
    </div>
  );
}
