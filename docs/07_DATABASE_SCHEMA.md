# WorkNow - Database Schema (Drizzle ORM)

This schema defines the database structure for PostgreSQL using Drizzle ORM declarations.

---

## 1. Schema Definitions (`schema.ts`)

```typescript
import { pgTable, uuid, varchar, text, numeric, pgEnum, timestamp } from 'drizzle-orm/pg-core';

// User Role Enumeration
export const roleEnum = pgEnum('role', ['WORKER', 'EMPLOYER', 'ADMIN']);

// Verification Status Enumeration
export const verificationStatusEnum = pgEnum('verification_status', [
  'UNVERIFIED',
  'PENDING',
  'VERIFIED',
  'REJECTED'
]);

// Application Status Enumeration
export const applicationStatusEnum = pgEnum('application_status', [
  'PENDING',
  'ACCEPTED',
  'REJECTED'
]);

// Payment/Escrow Status Enumeration
export const paymentStatusEnum = pgEnum('payment_status', [
  'UNFUNDED',
  'HELD_IN_ESCROW',
  'RELEASED',
  'REFUNDED'
]);

// Dispute Status Enumeration
export const disputeStatusEnum = pgEnum('dispute_status', [
  'PENDING',
  'RESOLVED_PAY_WORKER',
  'RESOLVED_REFUND_EMPLOYER',
  'RESOLVED_SPLIT'
]);

// Safety Report Status Enumeration
export const safetyStatusEnum = pgEnum('safety_status', [
  'ACTIVE',
  'INVESTIGATING',
  'RESOLVED'
]);

// ==========================================
// 1. Users Table
// ==========================================
export const users = pgTable('users', {
  id: uuid('id').defaultRandom().primaryKey(),
  role: roleEnum('role').default('WORKER').notNull(),
  fullName: varchar('full_name', { length: 255 }).notNull(),
  phone: varchar('phone', { length: 20 }).unique().notNull(),
  verificationStatus: verificationStatusEnum('verification_status').default('UNVERIFIED').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull()
});

// ==========================================
// 2. Jobs Table
// ==========================================
export const jobs = pgTable('jobs', {
  id: uuid('id').defaultRandom().primaryKey(),
  title: varchar('title', { length: 255 }).notNull(),
  description: text('description').notNull(),
  type: varchar('type', { length: 100 }).notNull(), // e.g. Cleaning, Artisan, Logistics
  location: varchar('location', { length: 255 }).notNull(), // Address/Coordinates mock
  pay: numeric('pay', { precision: 10, scale: 2 }).notNull(), // Pay rate in NGN
  employerId: uuid('employer_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull()
});

// ==========================================
// 3. Applications Table
// ==========================================
export const applications = pgTable('applications', {
  id: uuid('id').defaultRandom().primaryKey(),
  workerId: uuid('worker_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  jobId: uuid('job_id').references(() => jobs.id, { onDelete: 'cascade' }).notNull(),
  status: applicationStatusEnum('status').default('PENDING').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull()
});

// ==========================================
// 4. Payments Table
// ==========================================
export const payments = pgTable('payments', {
  id: uuid('id').defaultRandom().primaryKey(),
  jobId: uuid('job_id').references(() => jobs.id, { onDelete: 'cascade' }).notNull(),
  amount: numeric('amount', { precision: 10, scale: 2 }).notNull(),
  status: paymentStatusEnum('status').default('UNFUNDED').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow()
});

// ==========================================
// 5. Reviews Table
// ==========================================
export const reviews = pgTable('reviews', {
  id: uuid('id').defaultRandom().primaryKey(),
  reviewerId: uuid('reviewer_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  targetId: uuid('target_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  rating: numeric('rating', { precision: 2, scale: 1 }).notNull(), // 1.0 to 5.0
  comment: text('comment').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull()
});

// ==========================================
// 6. Disputes Table
// ==========================================
export const disputes = pgTable('disputes', {
  id: uuid('id').defaultRandom().primaryKey(),
  jobId: uuid('job_id').references(() => jobs.id, { onDelete: 'cascade' }).notNull(),
  workerId: uuid('worker_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  employerId: uuid('employer_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  status: disputeStatusEnum('status').default('PENDING').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull()
});

// ==========================================
// 7. Safety Reports Table
// ==========================================
export const safetyReports = pgTable('safety_reports', {
  id: uuid('id').defaultRandom().primaryKey(),
  workerId: uuid('worker_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  jobId: uuid('job_id').references(() => jobs.id, { onDelete: 'cascade' }).notNull(),
  type: varchar('type', { length: 100 }).notNull(), // e.g. SOS_TRIGGER, ABSENT_EMPLOYER, SCAM_THREAT
  status: safetyStatusEnum('status').default('ACTIVE').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull()
});
```
