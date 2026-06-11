# WorkNow - Technology Stack

This document specifies the technical architecture for the WorkNow platform, chosen to align with modern web patterns and support a mobile-first user experience.

---

## 1. Frontend Client
*   **Framework:** Next.js 15 (App Router)
    *   *Rationale:* Server-side rendering (SSR), search optimization, API routes handling, and robust routing structures.
*   **Language:** TypeScript
*   **Styling & UI Library:**
    *   **TailwindCSS:** For utility-first styling.
    *   **Shadcn UI:** Clean, accessible primitives using Radix UI, conforming to our `#00C16A` theme tokens.
*   **State Management:** TanStack Query (React Query)
    *   *Rationale:* Managing server state, pagination, and caching of active jobs and profiles.
*   **Form Management:** React Hook Form + Zod
    *   *Rationale:* Performance and validation schema management for job posting and profile setup.

---

## 2. Backend Infrastructure
*   **Framework:** Node.js & Express
    *   *Rationale:* Lightweight, unopinionated, fast setup, and minimal boilerplate for quick prototype building.
*   **Database ORM:** Drizzle ORM
    *   *Rationale:* Light weight, type-safe SQL queries, simple migrations, and direct integration with PostgreSQL.
*   **Database Engine:** PostgreSQL
    *   *Rationale:* Relational ACID-compliant transaction safety for matching and ledger state updates.

---

## 3. Integrations & Third-Party APIs
*   **Asset Storage:** Cloudinary
    *   *Rationale:* Image hosting, optimization, and transformation for user avatars and task proof attachments.
*   **Location & Maps:** Google Maps API
    *   *Rationale:* Storing spatial coordinates, calculating simple search radius overlays, and plotting job markers.
*   **Payments Gateway:** Mock OPay Integration
    *   *Rationale:* Simulated checkout and payout workflows representing OPay's fintech APIs (fund deposits and releases).
*   **AI Integration:** Mock Gemini Integration
    *   *Rationale:* Localized rule-based or simple mocked responses matching natural language matching, review aggregations, and moderation audits.
