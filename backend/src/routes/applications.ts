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

export default router;
