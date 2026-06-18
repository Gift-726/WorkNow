import { Router, Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { store, Job } from '../store';
import { authenticate, AuthRequest } from '../middleware/auth';
import { ApiResponse } from '../types';

const router = Router();

// Helper – relative time string
function timeAgo(isoString: string): string {
  const diff = Math.floor((Date.now() - new Date(isoString).getTime()) / 1000);
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} hours ago`;
  return `${Math.floor(diff / 86400)} days ago`;
}

// GET /api/v1/jobs
// Returns jobs, supports ?employerId=, ?search= and ?category= filters
router.get('/', (_req: Request, res: Response) => {
  const { search, category, employerId } = _req.query as { search?: string; category?: string; employerId?: string };

  let jobs = employerId ? store.getJobsByEmployer(employerId) : store.getAllOpenJobs();

  if (search) {
    const q = search.toLowerCase();
    jobs = jobs.filter(
      (j) =>
        j.title.toLowerCase().includes(q) ||
        j.description.toLowerCase().includes(q) ||
        j.location.toLowerCase().includes(q)
    );
  }

  if (category && category !== 'All Categories') {
    jobs = jobs.filter((j) => j.type.toLowerCase() === category.toLowerCase());
  }

  const result = jobs.map((j) => ({
    ...j,
    applicantCount: store.getApplicationsByJob(j.id).length,
    postedAgo: timeAgo(j.createdAt),
    slotsLeft: j.slotsAvailable - j.slotsFilled,
  }));

  const response: ApiResponse<typeof result> = {
    success: true,
    message: 'Jobs fetched',
    data: result,
  };

  res.json(response);
});

// GET /api/v1/jobs/:id
// Returns single job detail with application count
router.get('/:id', (req: Request, res: Response) => {
  const job = store.getJobById(req.params.id);

  if (!job) {
    res.status(404).json({ success: false, message: 'Job not found' });
    return;
  }

  const applicantCount = store.getApplicationsByJob(job.id).length;

  const response: ApiResponse = {
    success: true,
    message: 'Job found',
    data: {
      ...job,
      applicantCount,
      postedAgo: timeAgo(job.createdAt),
      slotsLeft: job.slotsAvailable - job.slotsFilled,
    },
  };

  res.json(response);
});

// POST /api/v1/jobs
// Employer creates a new job (status starts as OPEN for MVP prototype)
router.post('/', authenticate, (req: AuthRequest, res: Response) => {
  if (req.user?.role !== 'EMPLOYER' && req.user?.role !== 'ADMIN') {
    res.status(403).json({ success: false, message: 'Only employers can post jobs' });
    return;
  }

  const { title, description, type, location, pay, payPeriod, slotsAvailable, estimatedDuration } =
    req.body as Partial<Job>;

  if (!title || !description || !type || !location || !pay) {
    res
      .status(400)
      .json({ success: false, message: 'title, description, type, location, pay are required' });
    return;
  }

  const newJob: Job = {
    id: uuidv4(),
    title: title.trim(),
    description: description.trim(),
    type: type.trim(),
    location: location.trim(),
    pay: Number(pay),
    payPeriod: payPeriod || 'hr',
    slotsAvailable: Number(slotsAvailable) || 1,
    slotsFilled: 0,
    estimatedDuration: estimatedDuration || 'TBD',
    employerId: req.user!.userId,
    status: 'OPEN',
    createdAt: new Date().toISOString(),
  };

  store.addJob(newJob);

  const response: ApiResponse<Job> = {
    success: true,
    message: 'Job posted successfully',
    data: newJob,
  };

  res.status(201).json(response);
});

// POST /api/v1/jobs/:id/apply
// Worker submits application for a job
router.post('/:id/apply', authenticate, (req: AuthRequest, res: Response) => {
  const workerId = req.user!.userId;
  const jobId = req.params.id;

  const job = store.getJobById(jobId);
  if (!job) {
    res.status(404).json({ success: false, message: 'Job not found' });
    return;
  }

  if (job.status !== 'OPEN') {
    res.status(400).json({ success: false, message: 'This job is no longer accepting applications' });
    return;
  }

  // Check for duplicate application
  const existing = store.findApplication(workerId, jobId);
  if (existing) {
    res.status(409).json({ success: false, message: 'You have already applied for this job' });
    return;
  }

  const { message } = req.body as { message?: string };

  const application = {
    id: uuidv4(),
    jobId,
    workerId,
    message: message?.trim() || '',
    status: 'PENDING' as const,
    createdAt: new Date().toISOString(),
  };

  store.addApplication(application);

  const response: ApiResponse = {
    success: true,
    message: 'Application submitted successfully',
    data: application,
  };

  res.status(201).json(response);
});

export default router;
