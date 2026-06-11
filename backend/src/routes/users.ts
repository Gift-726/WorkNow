import { Router, Response } from 'express';
import { authenticate, AuthRequest } from '../middleware/auth';
import { store } from '../store';
import { ApiResponse, PublicUser, UserRole, VerificationStatus } from '../types';

const router = Router();

// GET /api/v1/users/:id
// Returns public profile of a user
router.get('/:id', authenticate, (req: AuthRequest, res: Response) => {
  const user = store.findById(req.params.id);

  if (!user) {
    const response: ApiResponse = { success: false, message: 'User not found' };
    res.status(404).json(response);
    return;
  }

  const publicUser: PublicUser = {
    id: user.id,
    fullName: user.fullName,
    email: user.email,
    phone: user.phone,
    role: user.role,
    verificationStatus: user.verificationStatus,
    createdAt: user.createdAt,
  };

  const response: ApiResponse<PublicUser> = {
    success: true,
    message: 'User found',
    data: publicUser,
  };

  res.status(200).json(response);
});

// PUT /api/v1/users/:id/role
// Sets the user's role (WORKER or EMPLOYER) — called after role selection screen
router.put('/:id/role', authenticate, (req: AuthRequest, res: Response) => {
  const { role } = req.body as { role: UserRole };

  if (!role || !['WORKER', 'EMPLOYER'].includes(role)) {
    const response: ApiResponse = {
      success: false,
      message: 'Role must be WORKER or EMPLOYER',
    };
    res.status(400).json(response);
    return;
  }

  // Only allow user to update their own role
  if (req.user?.userId !== req.params.id) {
    res.status(403).json({ success: false, message: 'Forbidden' });
    return;
  }

  const updated = store.updateUser(req.params.id, { role });

  if (!updated) {
    res.status(404).json({ success: false, message: 'User not found' });
    return;
  }

  const response: ApiResponse<{ role: UserRole }> = {
    success: true,
    message: 'Role updated',
    data: { role: updated.role },
  };

  res.status(200).json(response);
});

// PUT /api/v1/users/:id/profile
// Updates user profile details
router.put('/:id/profile', authenticate, (req: AuthRequest, res: Response) => {
  if (req.user?.userId !== req.params.id) {
    res.status(403).json({ success: false, message: 'Forbidden' });
    return;
  }

  const { fullName, phone, nextOfKinName, nextOfKinPhone } = req.body as {
    fullName?: string;
    phone?: string;
    nextOfKinName?: string;
    nextOfKinPhone?: string;
  };

  const updated = store.updateUser(req.params.id, {
    ...(fullName && { fullName }),
    ...(phone && { phone }),
    ...(nextOfKinName && { nextOfKinName }),
    ...(nextOfKinPhone && { nextOfKinPhone }),
  });

  if (!updated) {
    res.status(404).json({ success: false, message: 'User not found' });
    return;
  }

  const response: ApiResponse = {
    success: true,
    message: 'Profile updated',
  };

  res.status(200).json(response);
});

// POST /api/v1/users/verify
// Mock NIN/BVN verification — sets status to PENDING
// As per docs/09_VERIFICATION_SYSTEM.md and MVP goal: no real NIN checking
router.post('/verify', authenticate, (req: AuthRequest, res: Response) => {
  const { userId, nin, bvn } = req.body as {
    userId: string;
    nin?: string;
    bvn?: string;
  };

  // Validate NIN format (11 digits) if provided
  if (nin && !/^\d{11}$/.test(nin)) {
    const response: ApiResponse = {
      success: false,
      message: 'NIN must be exactly 11 digits',
    };
    res.status(400).json(response);
    return;
  }

  const updated = store.updateUser(userId, {
    verificationStatus: 'PENDING' as VerificationStatus,
    ...(nin && { nin }),
    ...(bvn && { bvn }),
  });

  if (!updated) {
    res.status(404).json({ success: false, message: 'User not found' });
    return;
  }

  const response: ApiResponse = {
    success: true,
    message: 'Verification request submitted. Your ID is under review.',
  };

  res.status(200).json(response);
});

export default router;
