# WorkNow - Router & Route Definitions

This document details the Next.js 15 frontend routes and backend REST API endpoints.

---

## 1. Frontend Client Routes (Next.js App Router)

### Public & Authentication
*   `GET /` - Brand Landing page (value prop, tagline, and call to action).
*   `GET /auth/login` - Secure login interface.
*   `GET /auth/register` - Account registration form.
*   `GET /auth/role-selection` - Portal to choose user persona (Worker or Employer).

### Worker Pages
*   `GET /worker` - Worker workspace home / main dashboard.
*   `GET /worker/jobs` - Feed of available casual gigs (filtered by category/pay).
*   `GET /worker/jobs/[id]` - Job overview, pay rates, and apply form.
*   `GET /worker/applications` - Status tracking of submitted applications.
*   `GET /worker/wallet` - Ledger of payouts, balance, and mock OPay transfer triggers.
*   `GET /worker/profile` - Complete skills, bio, and submit verification details.
*   `GET /worker/safety` - View check-ins, resume intent logging, and emergency contact details.

### Employer Pages
*   `GET /employer` - Employer dashboard home.
*   `GET /employer/jobs` - Overview list of all created jobs.
*   `GET /employer/jobs/new` - Form to post a new casual job.
*   `GET /employer/jobs/[id]` - Detailed view of a specific job post.
*   `GET /employer/applicants` - Dashboard list to evaluate worker applications.
*   `GET /employer/payments` - Transaction ledger showing mock escrow deposits and releases.
*   `GET /employer/profile` - Profile management for small businesses/households.

### Admin Pages
*   `GET /admin` - Admin center hub.
*   `GET /admin/users` - Oversee worker and employer accounts.
*   `GET /admin/jobs` - Audit active and historical job listings.
*   `GET /admin/disputes` - Locked escrow mediation center.
*   `GET /admin/safety` - Real-time SOS triggers and coordinates monitoring panel.
*   `GET /admin/verification` - Manual NIN verification request queue.

---

## 2. Backend REST API Endpoints (Node.js & Express Router)

All API endpoints are grouped under the `/api/v1` prefix.

### Authentication (`/api/v1/auth`)
*   `POST /register` - Create user record.
*   `POST /login` - User login, returns JWT token.

### Profiles & Verification (`/api/v1/users`)
*   `GET /:id` - Get user details.
*   `PUT /:id/profile` - Update bio, location, skills.
*   `POST /verify` - Submit mock NIN (status changes to `PENDING`).

### Jobs & Bids (`/api/v1/jobs`)
*   `GET /` - Fetch open casual jobs.
*   `GET /:id` - Get specific job details.
*   `POST /` - Create a job.
*   `PUT /:id` - Edit job post details.
*   `POST /:id/apply` - Submit worker application.
*   `PUT /applications/:id/status` - Update status (Accept/Reject).

### Payments & Escrow (`/api/v1/payments`)
*   `POST /escrow/fund` - Lock milestone funds (Mock OPay checkout simulation).
*   `POST /escrow/release` - Transfer locked escrow assets to worker's balance.

### Disputes & Reviews (`/api/v1/disputes`)
*   `POST /disputes` - File worker/employer payout dispute.
*   `PUT /disputes/:id/resolve` - Admin decision resolution dispatch.
*   `POST /reviews` - Submit ratings and double-blind comments.

### Safety (`/api/v1/safety`)
*   `POST /sos` - Trigger emergency alert (mock GPS coordinates + alert logs).
*   `POST /resumption` - Log worker resumption intent.
*   `POST /check-in` - GPS-based worker check-in (mocked).
