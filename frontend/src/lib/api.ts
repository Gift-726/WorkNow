// WorkNow API client
// Covers all MVP endpoints as per docs/08_ROUTES.md

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
}

export interface PublicUser {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  role: 'WORKER' | 'EMPLOYER' | 'ADMIN';
  verificationStatus: 'UNVERIFIED' | 'PENDING' | 'VERIFIED' | 'REJECTED';
  createdAt: string;
}

export interface AuthData {
  token: string;
  user: PublicUser;
}

export type JobPayPeriod = 'hr' | 'day' | 'month' | 'fixed';
export type JobStatus = 'DRAFT' | 'FUNDED' | 'OPEN' | 'ASSIGNED' | 'IN_PROGRESS' | 'PENDING_APPROVAL' | 'COMPLETED' | 'CANCELLED' | 'DISPUTED';
export type ApplicationStatus = 'PENDING' | 'ACCEPTED' | 'REJECTED';

export interface Job {
  id: string;
  title: string;
  description: string;
  type: string;
  location: string;
  pay: number;
  payPeriod: JobPayPeriod;
  slotsAvailable: number;
  slotsFilled: number;
  slotsLeft: number;
  estimatedDuration: string;
  employerId: string;
  status: JobStatus;
  createdAt: string;
  postedAgo: string;
  applicantCount: number;
}

export interface Application {
  id: string;
  jobId: string;
  workerId: string;
  message: string;
  status: ApplicationStatus;
  createdAt: string;
  job: Pick<Job, 'id' | 'title' | 'description' | 'type' | 'location' | 'pay' | 'payPeriod' | 'slotsAvailable' | 'estimatedDuration' | 'status'> | null;
}

export interface ApplicationsData {
  stats: {
    totalApplications: number;
    pending: number;
    completedJobs: number;
  };
  applications: Application[];
}

async function request<T>(
  path: string,
  options?: RequestInit
): Promise<ApiResponse<T>> {
  const token = typeof window !== 'undefined' ? localStorage.getItem('worknow_token') : null;

  const res = await fetch(`${API_BASE}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    ...options,
  });

  return res.json() as Promise<ApiResponse<T>>;
}

export const api = {
  auth: {
    register: (body: { fullName: string; email: string; phone: string; password: string; nin?: string; bvn?: string }) =>
      request<AuthData>('/auth/register', { method: 'POST', body: JSON.stringify(body) }),

    login: (body: { email: string; password: string }) =>
      request<AuthData>('/auth/login', { method: 'POST', body: JSON.stringify(body) }),

    googleLogin: (credential: string) =>
      request<AuthData>('/auth/google', { method: 'POST', body: JSON.stringify({ credential }) }),
  },

  users: {
    getById: (id: string) => request<PublicUser>(`/users/${id}`),

    setRole: (id: string, role: 'WORKER' | 'EMPLOYER') =>
      request<{ role: string }>(`/users/${id}/role`, {
        method: 'PUT',
        body: JSON.stringify({ role }),
      }),

    verify: (body: { userId: string; nin?: string; bvn?: string }) =>
      request('/users/verify', { method: 'POST', body: JSON.stringify(body) }),

    updateProfile: (id: string, body: { fullName?: string; phone?: string; nextOfKinName?: string; nextOfKinPhone?: string }) =>
      request(`/users/${id}/profile`, { method: 'PUT', body: JSON.stringify(body) }),
  },

  jobs: {
    list: (params?: { search?: string; category?: string }) => {
      const qs = params
        ? '?' + new URLSearchParams(Object.entries(params).filter(([, v]) => v) as [string, string][]).toString()
        : '';
      return request<Job[]>(`/jobs${qs}`);
    },

    getById: (id: string) => request<Job>(`/jobs/${id}`),

    create: (body: {
      title: string;
      description: string;
      type: string;
      location: string;
      pay: number;
      payPeriod: JobPayPeriod;
      slotsAvailable: number;
      estimatedDuration: string;
    }) =>
      request<Job>('/jobs', {
        method: 'POST',
        body: JSON.stringify(body),
      }),

    listByEmployer: (employerId: string) =>
      request<Job[]>(`/jobs?employerId=${employerId}`),

    apply: (jobId: string, message: string) =>
      request(`/jobs/${jobId}/apply`, {
        method: 'POST',
        body: JSON.stringify({ message }),
      }),
  },

  applications: {
    mine: () => request<ApplicationsData>('/applications/mine'),
    
    listForEmployer: () => request<(Application & { worker: PublicUser | null })[]>('/applications/employer'),
    
    updateStatus: (id: string, status: 'ACCEPTED' | 'REJECTED') =>
      request<Application>(`/applications/${id}/status`, {
        method: 'PUT',
        body: JSON.stringify({ status }),
      }),
  },
};

// ── Helpers ──

export function getStoredUser(): PublicUser | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem('worknow_user');
    return raw ? (JSON.parse(raw) as PublicUser) : null;
  } catch {
    return null;
  }
}

export function formatPay(pay: number, period: JobPayPeriod): string {
  const formatted = '₦' + pay.toLocaleString('en-NG');
  const labels: Record<JobPayPeriod, string> = {
    hr: '/hr',
    day: '/day',
    month: '/mo',
    fixed: '',
  };
  return `${formatted}${labels[period]}`;
}
