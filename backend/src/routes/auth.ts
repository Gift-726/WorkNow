import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { store } from '../store';
import { ApiResponse, PublicUser, UserRole } from '../types';
import { OAuth2Client } from 'google-auth-library';

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'worknow-dev-secret-2026';
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Helper — strip sensitive fields for public response
const toPublicUser = (user: ReturnType<typeof store.findById>): PublicUser | null => {
  if (!user) return null;
  return {
    id: user.id,
    fullName: user.fullName,
    email: user.email,
    phone: user.phone,
    role: user.role,
    verificationStatus: user.verificationStatus,
    createdAt: user.createdAt,
  };
};

// POST /api/v1/auth/register
// Creates a new user account
router.post('/register', async (req: Request, res: Response) => {
  try {
    const { fullName, email, phone, password, role, nin, bvn } = req.body as {
      fullName: string;
      email: string;
      phone: string;
      password: string;
      role?: UserRole;
      nin?: string;
      bvn?: string;
    };

    // Validate required fields
    if (!fullName || !email || !phone || !password) {
      const response: ApiResponse = {
        success: false,
        message: 'All fields are required: fullName, email, phone, password',
      };
      res.status(400).json(response);
      return;
    }

    // Validate NIN format (11 digits) if provided
    if (nin && !/^\d{11}$/.test(nin)) {
      const response: ApiResponse = {
        success: false,
        message: 'NIN must be exactly 11 digits',
      };
      res.status(400).json(response);
      return;
    }

    // Validate BVN format (11 digits) if provided
    if (bvn && !/^\d{11}$/.test(bvn)) {
      const response: ApiResponse = {
        success: false,
        message: 'BVN must be exactly 11 digits',
      };
      res.status(400).json(response);
      return;
    }

    // Check for duplicate email
    if (store.findByEmail(email)) {
      const response: ApiResponse = {
        success: false,
        message: 'An account with this email already exists',
      };
      res.status(409).json(response);
      return;
    }

    // Check for duplicate phone
    if (store.findByPhone(phone)) {
      const response: ApiResponse = {
        success: false,
        message: 'An account with this phone number already exists',
      };
      res.status(409).json(response);
      return;
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Create user record
    const newUser = {
      id: uuidv4(),
      fullName: fullName.trim(),
      email: email.toLowerCase().trim(),
      phone: phone.trim(),
      passwordHash,
      role: role || 'WORKER' as UserRole,
      verificationStatus: (nin || bvn) ? 'PENDING' as const : 'UNVERIFIED' as const,
      nin: nin?.trim(),
      bvn: bvn?.trim(),
      createdAt: new Date().toISOString(),
    };

    store.addUser(newUser);

    // Issue JWT
    const token = jwt.sign(
      { userId: newUser.id, role: newUser.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    const response: ApiResponse<{ token: string; user: PublicUser }> = {
      success: true,
      message: 'Account created successfully',
      data: {
        token,
        user: toPublicUser(newUser)!,
      },
    };

    res.status(201).json(response);
  } catch (error) {
    console.error('[register]', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// POST /api/v1/auth/login
// Authenticates user and returns JWT
router.post('/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body as { email: string; password: string };

    if (!email || !password) {
      const response: ApiResponse = {
        success: false,
        message: 'Email and password are required',
      };
      res.status(400).json(response);
      return;
    }

    const user = store.findByEmail(email);

    if (!user) {
      const response: ApiResponse = {
        success: false,
        message: 'Invalid email or password',
      };
      res.status(401).json(response);
      return;
    }

    const passwordMatch = await bcrypt.compare(password, user.passwordHash);

    if (!passwordMatch) {
      const response: ApiResponse = {
        success: false,
        message: 'Invalid email or password',
      };
      res.status(401).json(response);
      return;
    }

    const token = jwt.sign(
      { userId: user.id, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    const response: ApiResponse<{ token: string; user: PublicUser }> = {
      success: true,
      message: 'Login successful',
      data: {
        token,
        user: toPublicUser(user)!,
      },
    };

    res.status(200).json(response);
  } catch (error) {
    console.error('[login]', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// POST /api/v1/auth/google
// Verifies Google JWT ID token, logs in or registers user
router.post('/google', async (req: Request, res: Response) => {
  try {
    const { credential } = req.body as { credential?: string };

    if (!credential) {
      res.status(400).json({ success: false, message: 'Google credential token is required' });
      return;
    }

    // Verify token with Google's API keys
    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    if (!payload || !payload.email) {
      res.status(400).json({ success: false, message: 'Invalid Google token payload' });
      return;
    }

    const { email, name } = payload;

    // Check if user already exists
    let user = store.findByEmail(email);

    if (!user) {
      // Create user record (role defaults to WORKER, but they can select or edit it later)
      const newUser = {
        id: uuidv4(),
        fullName: name || 'Google User',
        email: email.toLowerCase().trim(),
        phone: '', // Mock empty; user will update in profile
        passwordHash: '', // Social logins don't require password hash
        role: 'WORKER' as UserRole,
        verificationStatus: 'UNVERIFIED' as const,
        createdAt: new Date().toISOString(),
      };
      store.addUser(newUser);
      user = newUser;
    }

    // Issue token
    const token = jwt.sign(
      { userId: user.id, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    const response: ApiResponse<{ token: string; user: PublicUser }> = {
      success: true,
      message: 'Google login successful',
      data: {
        token,
        user: toPublicUser(user)!,
      },
    };

    res.status(200).json(response);
  } catch (error) {
    console.error('[google-auth]', error);
    res.status(401).json({ success: false, message: 'Google authentication failed' });
  }
});

export default router;
