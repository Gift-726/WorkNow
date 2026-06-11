// WorkNow – Mock store
// Includes: Users, Jobs, Applications
// All data is in-memory for the MVP prototype
// Source: docs/01_PROJECT_VISION.md (MVP Goal: no real data)

import bcrypt from 'bcryptjs';
import { User } from '../types';


export type JobStatus = 'DRAFT' | 'FUNDED' | 'OPEN' | 'ASSIGNED' | 'IN_PROGRESS' | 'PENDING_APPROVAL' | 'COMPLETED' | 'CANCELLED' | 'DISPUTED';
export type ApplicationStatus = 'PENDING' | 'ACCEPTED' | 'REJECTED';

export interface Job {
  id: string;
  title: string;
  description: string;
  type: string; // e.g. Event, Delivery, Cleaning
  location: string;
  pay: number; // in NGN
  payPeriod: 'hr' | 'day' | 'month' | 'fixed';
  slotsAvailable: number;
  slotsFilled: number;
  estimatedDuration: string; // e.g. "3 hours", "2 days"
  employerId: string;
  status: JobStatus;
  createdAt: string;
}

export interface Application {
  id: string;
  jobId: string;
  workerId: string;
  message: string;
  status: ApplicationStatus;
  createdAt: string;
}

// ── Seed mock jobs (as per WORKNOW_CONCEPT_NOTE.md real-world scenarios) ──
const MOCK_EMPLOYER_ID = 'mock-employer-001';

const seedJobs: Job[] = [
  {
    id: 'job-001',
    title: 'Event Setup Crew',
    description:
      'We need strong, reliable hands to help set up a large event. Work includes arranging chairs and tables, moving equipment, setting up canopies, and getting the venue ready before guests arrive. The job is physical and fast-paced.',
    type: 'Event',
    location: 'Lagos Island, Lagos',
    pay: 5000,
    payPeriod: 'hr',
    slotsAvailable: 3,
    slotsFilled: 0,
    estimatedDuration: '5 hours',
    employerId: MOCK_EMPLOYER_ID,
    status: 'OPEN',
    createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(), // 3h ago
  },
  {
    id: 'job-002',
    title: 'Delivery Loader',
    description:
      'We need loaders to help move and load goods for delivery. Work includes carrying boxes, loading them into vehicles, and making sure items are packed safely and securely. You must be physically fit and able to lift heavy loads. Location and vehicle details will be provided on confirmation.',
    type: 'Logistics',
    location: 'Ikeja, Lagos',
    pay: 5000,
    payPeriod: 'hr',
    slotsAvailable: 3,
    slotsFilled: 0,
    estimatedDuration: '2 days',
    employerId: MOCK_EMPLOYER_ID,
    status: 'OPEN',
    createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(), // 5h ago
  },
  {
    id: 'job-003',
    title: 'Salesgirl Needed',
    description:
      'Shop owner in Akure needs a reliable salesgirl to manage front-of-store sales, customer service, and stock tracking. Full-time ongoing role with monthly salary.',
    type: 'Retail',
    location: 'Akure, Ondo State',
    pay: 35000,
    payPeriod: 'month',
    slotsAvailable: 1,
    slotsFilled: 0,
    estimatedDuration: 'Ongoing',
    employerId: MOCK_EMPLOYER_ID,
    status: 'OPEN',
    createdAt: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'job-004',
    title: 'Wedding Event Helpers',
    description:
      'Need 10 helpers for a Saturday wedding in Victoria Island. Duties include guest reception, food service, and venue cleanup after the event. Smart casual dress required.',
    type: 'Event',
    location: 'Victoria Island, Lagos',
    pay: 4000,
    payPeriod: 'hr',
    slotsAvailable: 10,
    slotsFilled: 2,
    estimatedDuration: '6 hours',
    employerId: MOCK_EMPLOYER_ID,
    status: 'OPEN',
    createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
  },
];

class MockStore {
  private users: Map<string, User> = new Map();
  private emailIndex: Map<string, string> = new Map();
  private phoneIndex: Map<string, string> = new Map();
  private jobs: Map<string, Job> = new Map();
  private applications: Map<string, Application> = new Map();

  constructor() {
    // Seed jobs
    seedJobs.forEach((job) => this.jobs.set(job.id, job));

    // Seed default users
    const saltRounds = 10;
    const defaultPasswordHash = bcrypt.hashSync('Password123', saltRounds);

    const defaultEmployer: User = {
      id: MOCK_EMPLOYER_ID, // 'mock-employer-001'
      fullName: 'Funmi Johnson',
      email: 'employer@worknow.com',
      phone: '08012345678',
      passwordHash: defaultPasswordHash,
      role: 'EMPLOYER',
      verificationStatus: 'VERIFIED',
      nin: '12345678901',
      bvn: '12345678901',
      nextOfKinName: 'Tunde Johnson',
      nextOfKinPhone: '08087654321',
      createdAt: new Date().toISOString(),
    };

    const defaultWorker: User = {
      id: 'mock-worker-001',
      fullName: 'Tunde Bakare',
      email: 'worker@worknow.com',
      phone: '08087654321',
      passwordHash: defaultPasswordHash,
      role: 'WORKER',
      verificationStatus: 'VERIFIED',
      nin: '98765432109',
      bvn: '98765432109',
      nextOfKinName: 'Funmi Bakare',
      nextOfKinPhone: '08012345678',
      createdAt: new Date().toISOString(),
    };

    this.addUser(defaultEmployer);
    this.addUser(defaultWorker);
  }


  // ── User methods ──
  addUser(user: User): void {
    this.users.set(user.id, user);
    this.emailIndex.set(user.email.toLowerCase(), user.id);
    this.phoneIndex.set(user.phone, user.id);
  }

  findByEmail(email: string): User | undefined {
    const id = this.emailIndex.get(email.toLowerCase());
    return id ? this.users.get(id) : undefined;
  }

  findByPhone(phone: string): User | undefined {
    const id = this.phoneIndex.get(phone);
    return id ? this.users.get(id) : undefined;
  }

  findById(id: string): User | undefined {
    return this.users.get(id);
  }

  updateUser(id: string, updates: Partial<User>): User | undefined {
    const user = this.users.get(id);
    if (!user) return undefined;
    const updated = { ...user, ...updates };
    this.users.set(id, updated);
    return updated;
  }

  getAllUsers(): User[] {
    return Array.from(this.users.values());
  }

  // ── Job methods ──
  addJob(job: Job): void {
    this.jobs.set(job.id, job);
  }

  getJobById(id: string): Job | undefined {
    return this.jobs.get(id);
  }

  getAllOpenJobs(): Job[] {
    return Array.from(this.jobs.values()).filter((j) => j.status === 'OPEN');
  }

  updateJob(id: string, updates: Partial<Job>): Job | undefined {
    const job = this.jobs.get(id);
    if (!job) return undefined;
    const updated = { ...job, ...updates };
    this.jobs.set(id, updated);
    return updated;
  }

  // ── Application methods ──
  addApplication(app: Application): void {
    this.applications.set(app.id, app);
  }

  getApplicationsByWorker(workerId: string): Application[] {
    return Array.from(this.applications.values()).filter(
      (a) => a.workerId === workerId
    );
  }

  getApplicationsByJob(jobId: string): Application[] {
    return Array.from(this.applications.values()).filter(
      (a) => a.jobId === jobId
    );
  }

  findApplication(workerId: string, jobId: string): Application | undefined {
    return Array.from(this.applications.values()).find(
      (a) => a.workerId === workerId && a.jobId === jobId
    );
  }

  getApplicationById(id: string): Application | undefined {
    return this.applications.get(id);
  }
}

export const store = new MockStore();
