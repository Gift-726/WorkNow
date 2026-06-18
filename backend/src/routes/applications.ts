import { Router, Response } from 'express';
import { store } from '../store';
import { authenticate, AuthRequest } from '../middleware/auth';
import { ApiResponse } from '../types';

const router = Router();

// GET /api/v1/applications/mine
// Returns all applications for the authenticated worker, with enriched job data
router.get('/mine', authenticate, (req: AuthRequest, res: Response) => {
  const workerId = req.user!.userId;
  const applications = store.getApplicationsByWorker(workerId);

  const enriched = applications.map((app) => {
    const job = store.getJobById(app.jobId);
    return {
      ...app,
      job: job
        ? {
            id: job.id,
            title: job.title,
            description: job.description,
            type: job.type,
            location: job.location,
            pay: job.pay,
            payPeriod: job.payPeriod,
            slotsAvailable: job.slotsAvailable,
            estimatedDuration: job.estimatedDuration,
            status: job.status,
          }
        : null,
    };
  });

  // Stats
  const totalApplications = applications.length;
  const pending = applications.filter((a) => a.status === 'PENDING').length;
  const completedJobs = applications.filter((a) => a.status === 'ACCEPTED').length;

  const response: ApiResponse = {
    success: true,
    message: 'Applications fetched',
    data: {
      stats: { totalApplications, pending, completedJobs },
      applications: enriched,
    },
  };

  res.json(response);
});

// GET /api/v1/applications/employer
// Returns all applications submitted to jobs posted by this employer
router.get('/employer', authenticate, (req: AuthRequest, res: Response) => {
  const employerId = req.user!.userId;
  const applications = store.getApplicationsForEmployer(employerId);

  const enriched = applications.map((app) => {
    const job = store.getJobById(app.jobId);
    const worker = store.findById(app.workerId);
    
    return {
      ...app,
      job: job
        ? {
            id: job.id,
            title: job.title,
            description: job.description,
            type: job.type,
            location: job.location,
            pay: job.pay,
            payPeriod: job.payPeriod,
            slotsAvailable: job.slotsAvailable,
            estimatedDuration: job.estimatedDuration,
            status: job.status,
          }
        : null,
      worker: worker
        ? {
            id: worker.id,
            fullName: worker.fullName,
            phone: worker.phone,
            email: worker.email,
            verificationStatus: worker.verificationStatus,
          }
        : null,
    };
  });

  const response: ApiResponse = {
    success: true,
    message: 'Employer applications fetched',
    data: enriched,
  };

  res.json(response);
});

// PUT /api/v1/applications/:id/status
// Updates application status (e.g. to ACCEPTED/REJECTED).
// If accepted, updates job status to IN_PROGRESS and increments slots filled.
router.put('/:id/status', authenticate, (req: AuthRequest, res: Response) => {
  const { status } = req.body as { status: 'ACCEPTED' | 'REJECTED' };

  if (!status || !['ACCEPTED', 'REJECTED'].includes(status)) {
    res.status(400).json({ success: false, message: 'Status must be ACCEPTED or REJECTED' });
    return;
  }

  const app = store.getApplicationById(req.params.id);
  if (!app) {
    res.status(404).json({ success: false, message: 'Application not found' });
    return;
  }

  const job = store.getJobById(app.jobId);
  if (!job) {
    res.status(404).json({ success: false, message: 'Job not found' });
    return;
  }

  // Verify the requester is the employer of this job
  if (job.employerId !== req.user!.userId) {
    res.status(403).json({ success: false, message: 'Forbidden. You do not own this job listing' });
    return;
  }

  // Update status in store
  app.status = status;
  
  if (status === 'ACCEPTED') {
    job.slotsFilled = Math.min(job.slotsAvailable, job.slotsFilled + 1);
    job.status = 'IN_PROGRESS';
  }

  // Update store entries
  store.updateJob(job.id, { slotsFilled: job.slotsFilled, status: job.status });

  const response: ApiResponse = {
    success: true,
    message: `Application successfully ${status.toLowerCase()}`,
    data: app,
  };

  res.json(response);
});

export default router;
