'use client';

import { useEffect, useState } from 'react';
import { api, Job, Application, PublicUser, getStoredUser, formatPay } from '@/lib/api';

const CATEGORIES = [
  'All Categories',
  'Event',
  'Logistics',
  'Retail',
  'Cleaning',
  'Catering',
  'Artisan'
];

type TabType = 'jobs' | 'proposals' | 'inprogress' | 'completed';

export default function EmployerDashboard() {
  const [user, setUser] = useState<PublicUser | null>(null);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [proposals, setProposals] = useState<(Application & { worker: PublicUser | null })[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All Categories');
  const [activeTab, setActiveTab] = useState<TabType>('proposals'); // Proposals is active in Desktop - 30
  const [selectedProposal, setSelectedProposal] = useState<(Application & { worker: PublicUser | null }) | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [message, setMessage] = useState('');

  const loadDashboardData = async () => {
    const storedUser = getStoredUser();
    if (!storedUser) return;
    setUser(storedUser);

    setLoading(true);
    try {
      // Fetch employer jobs
      const jobsRes = await api.jobs.listByEmployer(storedUser.id);
      if (jobsRes.success && jobsRes.data) {
        setJobs(jobsRes.data);
      }

      // Fetch applications/proposals submitted to employer's jobs
      const appRes = await api.applications.listForEmployer();
      if (appRes.success && appRes.data) {
        setProposals(appRes.data);
      }
    } catch (err) {
      console.error('Failed to load employer dashboard data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  // Filter jobs based on search & category
  const filteredJobs = jobs.filter((job) => {
    const matchSearch =
      job.title.toLowerCase().includes(search.toLowerCase()) ||
      job.description.toLowerCase().includes(search.toLowerCase()) ||
      job.location.toLowerCase().includes(search.toLowerCase());
    const matchCategory =
      category === 'All Categories' ||
      job.type.toLowerCase() === category.toLowerCase();
    return matchSearch && matchCategory;
  });

  // Filter proposals based on search & category of their job
  const filteredProposals = proposals.filter((prop) => {
    const job = prop.job;
    if (!job) return false;
    const matchSearch =
      job.title.toLowerCase().includes(search.toLowerCase()) ||
      prop.worker?.fullName.toLowerCase().includes(search.toLowerCase()) ||
      prop.message.toLowerCase().includes(search.toLowerCase());
    const matchCategory =
      category === 'All Categories' ||
      job.type.toLowerCase() === category.toLowerCase();
    return matchSearch && matchCategory;
  });

  // Count metrics for tabs
  // 1. Job Posts: OPEN, FUNDED, DRAFT
  const jobPostsList = filteredJobs.filter(j => ['OPEN', 'FUNDED', 'DRAFT'].includes(j.status));
  // 2. Proposals: Applications with status PENDING
  const proposalsList = filteredProposals.filter(p => p.status === 'PENDING');
  // 3. In Progress: Jobs with status IN_PROGRESS or ASSIGNED
  const inProgressJobs = filteredJobs.filter(j => ['IN_PROGRESS', 'ASSIGNED'].includes(j.status));
  // 4. Completed: Jobs with status COMPLETED
  const completedJobs = filteredJobs.filter(j => j.status === 'COMPLETED');

  // Hire Worker Action
  const handleHire = async (proposalId: string) => {
    setActionLoading(true);
    setMessage('');
    try {
      const res = await api.applications.updateStatus(proposalId, 'ACCEPTED');
      if (res.success) {
        setMessage('Worker successfully hired! Job status updated to In Progress.');
        setSelectedProposal(null);
        // Refresh data
        await loadDashboardData();
      } else {
        setMessage(res.message || 'Failed to hire worker.');
      }
    } catch {
      setMessage('Something went wrong. Please try again.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDecline = async (proposalId: string) => {
    setActionLoading(true);
    setMessage('');
    try {
      const res = await api.applications.updateStatus(proposalId, 'REJECTED');
      if (res.success) {
        setMessage('Proposal declined.');
        setSelectedProposal(null);
        await loadDashboardData();
      } else {
        setMessage(res.message || 'Failed to update proposal.');
      }
    } catch {
      setMessage('Something went wrong. Please try again.');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto w-full relative min-h-screen">
      {/* Toast Alert message */}
      {message && (
        <div className="fixed top-4 right-4 z-50 p-4 bg-[#E6FAF2] border border-[#00C16A] text-[#00C16A] font-semibold text-sm rounded-[12px] shadow-lg flex items-center gap-2 max-w-md animate-fade-in-down">
          <span>{message}</span>
          <button onClick={() => setMessage('')} className="ml-auto text-xs font-bold text-gray-500 hover:text-gray-700">✕</button>
        </div>
      )}

      {/* Header breadcrumb & info */}
      <div className="flex items-center gap-2 text-xs text-[#9CA3AF] mb-4">
        <span className="flex items-center gap-1">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M15 19l-7-7 7-7" />
          </svg>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M9 5l7 7-7 7" />
          </svg>
        </span>
        <span className="font-medium">Dashboard</span>
      </div>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-[#111827]">
            Employer&apos;s Dashboard
          </h1>
          <p className="text-sm text-[#4B5563] mt-1">
            Post jobs, and get qualified workers to complete your requirements
          </p>
        </div>

        {/* User Card Badge */}
        <div className="flex items-center gap-3 bg-white border border-[#E5E7EB] rounded-full px-4 py-2 shrink-0 self-start md:self-auto shadow-sm">
          <div className="w-8 h-8 rounded-full bg-[#E6FAF2] flex items-center justify-center text-[#00C16A] font-bold text-sm">
            {user?.fullName?.charAt(0).toUpperCase() || 'E'}
          </div>
          <div>
            <div className="text-xs font-semibold text-[#111827]">{user?.fullName || 'Employer'}</div>
            <div className="text-[10px] text-[#00C16A] font-bold flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#00C16A] animate-pulse" />
              Verified Employer
            </div>
          </div>
        </div>
      </div>

      {/* Tabs matching mockup */}
      <div className="border-b border-[#E5E7EB] mb-6 flex flex-wrap gap-4 md:gap-6">
        <button
          onClick={() => setActiveTab('jobs')}
          className={`pb-3 text-sm font-semibold transition-all relative cursor-pointer ${
            activeTab === 'jobs'
              ? 'text-[#00C16A]'
              : 'text-[#9CA3AF] hover:text-[#4B5563]'
          }`}
        >
          Job Posts ({jobPostsList.length})
          {activeTab === 'jobs' && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#00C16A] rounded-full" />
          )}
        </button>
        <button
          onClick={() => setActiveTab('proposals')}
          className={`pb-3 text-sm font-semibold transition-all relative cursor-pointer ${
            activeTab === 'proposals'
              ? 'text-[#00C16A]'
              : 'text-[#9CA3AF] hover:text-[#4B5563]'
          }`}
        >
          Proposals ({proposalsList.length})
          {activeTab === 'proposals' && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#00C16A] rounded-full" />
          )}
        </button>
        <button
          onClick={() => setActiveTab('inprogress')}
          className={`pb-3 text-sm font-semibold transition-all relative cursor-pointer ${
            activeTab === 'inprogress'
              ? 'text-[#00C16A]'
              : 'text-[#9CA3AF] hover:text-[#4B5563]'
          }`}
        >
          In Progress ({inProgressJobs.length})
          {activeTab === 'inprogress' && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#00C16A] rounded-full" />
          )}
        </button>
        <button
          onClick={() => setActiveTab('completed')}
          className={`pb-3 text-sm font-semibold transition-all relative cursor-pointer ${
            activeTab === 'completed'
              ? 'text-[#00C16A]'
              : 'text-[#9CA3AF] hover:text-[#4B5563]'
          }`}
        >
          Completed ({completedJobs.length})
          {activeTab === 'completed' && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#00C16A] rounded-full" />
          )}
        </button>
      </div>

      {/* Filters Bar matching mockup */}
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
            placeholder={activeTab === 'proposals' ? "Search proposals, applicants..." : "Search jobs..."}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-field !pl-10 !h-[48px]"
          />
        </div>

        <div className="w-full sm:w-[200px]">
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="input-field appearance-none bg-no-repeat bg-[right_14px_center] pr-10 cursor-pointer !h-[48px]"
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

      {/* Loading State */}
      {loading ? (
        <div className="grid grid-cols-1 gap-6">
          {[1, 2].map((i) => (
            <div key={i} className="bg-white border border-[#E5E7EB] rounded-[12px] p-6 animate-pulse h-[160px]" />
          ))}
        </div>
      ) : (
        <div>
          {/* Active Tab Content: Job Posts */}
          {activeTab === 'jobs' && (
            jobPostsList.length === 0 ? (
              <EmptyState text="No job posts found" subtext="You haven't posted any jobs under this status yet. Tap 'Create Job' to start." />
            ) : (
              <div className="flex flex-col gap-4">
                {jobPostsList.map((job) => (
                  <div key={job.id} className="bg-white border border-[#E5E7EB] rounded-[12px] p-6 hover:border-[#00C16A] transition-all flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-[#E6FAF2] text-[#00C16A]">
                          {job.type}
                        </span>
                        <span className="text-[10px] text-[#9CA3AF]">{job.postedAgo || 'Posted recently'}</span>
                      </div>
                      <h3 className="font-bold text-lg text-[#111827] mb-2">{job.title}</h3>
                      <p className="text-xs text-[#4B5563] leading-relaxed max-w-3xl mb-4">{job.description}</p>
                      
                      {/* Meta information tags */}
                      <div className="flex flex-wrap items-center gap-4 text-xs text-[#4B5563]">
                        <span className="px-2 py-0.5 rounded-[4px] text-[11px] font-bold bg-[#E6FAF2] text-[#00C16A]">
                          {job.slotsLeft} slot{job.slotsLeft !== 1 ? 's' : ''} left
                        </span>
                        <span className="flex items-center gap-1 text-[#9CA3AF]">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="12" cy="12" r="10" />
                            <polyline points="12 6 12 12 16 14" />
                          </svg>
                          Estimated Duration: {job.estimatedDuration}
                        </span>
                        <span className="flex items-center gap-1 text-[#9CA3AF]">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                            <circle cx="9" cy="7" r="4" />
                            <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                          </svg>
                          {job.applicantCount || 0} application{job.applicantCount !== 1 ? 's' : ''}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex flex-col items-end gap-2 shrink-0">
                      <span className="font-bold text-lg text-[#00C16A]">
                        Pay {formatPay(job.pay, job.payPeriod)}
                      </span>
                      <button 
                        onClick={() => {
                          // View applications for this job by activating Proposals tab and setting filter
                          setActiveTab('proposals');
                          setSearch(job.title);
                        }}
                        className="px-6 py-2.5 bg-[#00C16A] hover:bg-[#00A558] text-white font-semibold text-sm rounded-[8px] transition-colors cursor-pointer"
                      >
                        View
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )
          )}

          {/* Active Tab Content: Proposals */}
          {activeTab === 'proposals' && (
            proposalsList.length === 0 ? (
              <EmptyState text="No proposals received" subtext="You don't have any pending applications from workers right now." />
            ) : (
              <div className="flex flex-col gap-4">
                {proposalsList.map((prop) => (
                  <div key={prop.id} className="bg-white border border-[#E5E7EB] rounded-[12px] p-6 hover:border-[#00C16A] transition-all flex flex-col md:flex-row md:items-start justify-between gap-4">
                    <div className="flex items-start gap-4 flex-1">
                      {/* Avatar placeholder */}
                      <div className="w-12 h-12 rounded-full bg-[#E5E7EB] flex items-center justify-center text-gray-500 font-bold shrink-0 overflow-hidden">
                        {prop.worker?.fullName?.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-bold text-sm text-[#111827]">{prop.worker?.fullName || 'Worker'}</span>
                          {prop.worker?.verificationStatus === 'VERIFIED' && (
                            <span className="inline-flex items-center gap-1 text-[10px] text-[#00C16A] font-bold bg-[#E6FAF2] px-2 py-0.5 rounded-full">
                              <span className="w-1.5 h-1.5 rounded-full bg-[#00C16A]" />
                              Verified Worker
                            </span>
                          )}
                        </div>
                        <div className="text-xs font-semibold text-[#4B5563] mb-2">
                          Applied for: <span className="text-[#00C16A]">{prop.job?.title}</span>
                        </div>
                        
                        <div className="text-xs text-[#9CA3AF] uppercase font-bold tracking-wider mb-1">Proposal</div>
                        <p className="text-xs text-[#4B5563] leading-relaxed line-clamp-2 italic">
                          &ldquo;{prop.message}&rdquo;
                        </p>
                        <button
                          onClick={() => setSelectedProposal(prop)}
                          className="text-xs font-bold text-[#00C16A] hover:underline mt-2 flex items-center gap-1"
                        >
                          View Proposal
                        </button>
                      </div>
                    </div>

                    <div className="shrink-0 pt-2">
                      <button
                        onClick={() => handleHire(prop.id)}
                        disabled={actionLoading}
                        className="px-6 py-2.5 bg-[#00C16A] hover:bg-[#00A558] text-white font-bold text-sm rounded-[8px] transition-colors cursor-pointer"
                      >
                        Hire
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )
          )}

          {/* Active Tab Content: In Progress */}
          {activeTab === 'inprogress' && (
            inProgressJobs.length === 0 ? (
              <EmptyState text="No jobs in progress" subtext="Hired workers will appear here during task execution." />
            ) : (
              <div className="flex flex-col gap-4">
                {inProgressJobs.map((job) => (
                  <div key={job.id} className="bg-white border border-[#E5E7EB] rounded-[12px] p-6 hover:border-[#00C16A] transition-all flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-[#E6FAF2] text-[#00C16A]">
                          {job.type}
                        </span>
                        <span className="text-[10px] text-[#9CA3AF]">Active Shift</span>
                      </div>
                      <h3 className="font-bold text-lg text-[#111827] mb-2">{job.title}</h3>
                      <p className="text-xs text-[#4B5563] leading-relaxed max-w-3xl mb-4">{job.description}</p>
                      
                      <div className="flex flex-wrap items-center gap-4 text-xs text-[#4B5563]">
                        <span className="flex items-center gap-1 text-[#9CA3AF]">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="12" cy="12" r="10" />
                            <polyline points="12 6 12 12 16 14" />
                          </svg>
                          Duration: {job.estimatedDuration}
                        </span>
                        <span className="flex items-center gap-1 text-[#9CA3AF]">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" />
                          </svg>
                          Location: {job.location}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex flex-col items-end gap-2 shrink-0">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border border-amber-300 bg-amber-50 text-amber-600">
                        In Progress
                      </span>
                      <button 
                        onClick={() => {
                          setMessage('Tracking workflow status... Mock GPS updates activated.');
                        }}
                        className="px-6 py-2.5 bg-[#00C16A] hover:bg-[#00A558] text-white font-semibold text-sm rounded-[8px] transition-colors cursor-pointer mt-1"
                      >
                        Track
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )
          )}

          {/* Active Tab Content: Completed */}
          {activeTab === 'completed' && (
            completedJobs.length === 0 ? (
              <EmptyState text="No completed jobs" subtext="Once you approve completion and release escrow funds, completed gigs show up here." />
            ) : (
              <div className="flex flex-col gap-4">
                {completedJobs.map((job) => (
                  <div key={job.id} className="bg-white border border-[#E5E7EB] rounded-[12px] p-6 hover:border-gray-300 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-600">
                          {job.type}
                        </span>
                        <span className="text-[10px] text-gray-400">Completed</span>
                      </div>
                      <h3 className="font-bold text-lg text-[#111827] mb-2">{job.title}</h3>
                      <p className="text-xs text-[#4B5563] leading-relaxed max-w-3xl mb-2">{job.description}</p>
                    </div>
                    
                    <div className="flex flex-col items-end gap-2 shrink-0">
                      <span className="font-bold text-lg text-gray-500">
                        Paid {formatPay(job.pay, job.payPeriod)}
                      </span>
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border border-emerald-300 bg-emerald-50 text-emerald-600">
                        ✓ Released
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )
          )}
        </div>
      )}

      {/* Pagination matching mockup */}
      <div className="flex justify-center items-center gap-2 mt-10 text-xs font-medium text-gray-500 select-none">
        <button className="p-2 border border-[#E5E7EB] rounded-[8px] hover:bg-gray-50 cursor-pointer disabled:opacity-50" disabled>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>
        <button className="w-8 h-8 rounded-full border border-[#00C16A] text-[#00C16A] bg-[#E6FAF2] flex items-center justify-center font-bold">
          1
        </button>
        <button className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center cursor-pointer">
          2
        </button>
        <button className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center cursor-pointer">
          3
        </button>
        <button className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center cursor-pointer">
          4
        </button>
        <span className="px-1">...</span>
        <button className="p-2 border border-[#E5E7EB] rounded-[8px] hover:bg-gray-50 cursor-pointer">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </button>
      </div>

      {/* Slide-over Proposal Details Drawer matching Desktop - 31 */}
      {selectedProposal && (
        <div className="fixed inset-0 z-50 flex justify-end">
          {/* Backdrop overlay */}
          <div 
            onClick={() => setSelectedProposal(null)}
            className="absolute inset-0 bg-black/35 backdrop-blur-[1px] transition-opacity animate-fade-in"
          />

          {/* Drawer content panel */}
          <div className="relative w-full max-w-[560px] bg-white h-full shadow-2xl flex flex-col z-10 animate-slide-in-right border-l border-[#E5E7EB] overflow-y-auto">
            {/* Top Bar with Profile Info & Hire Button */}
            <div className="p-6 border-b border-[#E5E7EB] flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-[#E5E7EB] flex items-center justify-center text-gray-500 font-bold shrink-0">
                  {selectedProposal.worker?.fullName?.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div className="font-bold text-sm text-[#111827]">{selectedProposal.worker?.fullName}</div>
                  {selectedProposal.worker?.verificationStatus === 'VERIFIED' && (
                    <div className="text-[10px] text-[#00C16A] font-bold flex items-center gap-1 mt-0.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#00C16A]" />
                      Verified Worker
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleHire(selectedProposal.id)}
                  disabled={actionLoading}
                  className="px-6 py-2.5 bg-[#00C16A] hover:bg-[#00A558] text-white font-bold text-sm rounded-[8px] transition-colors cursor-pointer shrink-0"
                >
                  Hire
                </button>
                <button
                  onClick={() => handleDecline(selectedProposal.id)}
                  disabled={actionLoading}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-[8px] cursor-pointer"
                  title="Decline"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Proposal Details Info */}
            <div className="p-6 flex-1">
              <h2 className="text-base font-bold text-[#111827] mb-6">Proposal Details</h2>
              
              <div className="mb-6">
                <div className="text-xs text-[#9CA3AF] uppercase font-bold tracking-wider mb-2">Message</div>
                <div className="bg-gray-50 border border-gray-100 rounded-[12px] p-4 text-sm text-[#4B5563] leading-relaxed whitespace-pre-wrap">
                  {selectedProposal.message}
                </div>
              </div>

              {/* Extra mock verification details */}
              <div className="border border-gray-100 rounded-[12px] p-4 flex flex-col gap-3">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-gray-400">Identity Verification</span>
                  <span className="font-bold text-[#00C16A]">100% Mock NIN Checked</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-gray-400">Phone Contact</span>
                  <span className="font-semibold text-[#111827]">{selectedProposal.worker?.phone}</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-gray-400">Trust Badge Tiers</span>
                  <span className="font-semibold text-amber-600">Bronze Level</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Subcomponents
function EmptyState({ text, subtext }: { text: string; subtext: string }) {
  return (
    <div className="bg-white border border-[#E5E7EB] rounded-[12px] p-12 text-center max-w-md mx-auto mt-8">
      <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gray-50 text-[#9CA3AF] mb-4">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
      </div>
      <h3 className="text-base font-bold text-[#111827] mb-1">{text}</h3>
      <p className="text-sm text-[#4B5563] leading-relaxed">{subtext}</p>
    </div>
  );
}
