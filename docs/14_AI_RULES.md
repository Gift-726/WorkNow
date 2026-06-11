# WorkNow - AI Development Rules

This document specifies the rules for AI models and assistants generating code or content for WorkNow.

---

## 1. Core Directives
*   **Read all documentation before coding:** Ensure full comprehension of the vision, requirements, features, flows, and schemas.
*   **Do not create features not listed:** Stick strictly to the outlined product requirements and features.
*   **Do not redesign existing screens:** Maintain visual layout consistency as already structured.

---

## 2. Technical Stack Rules
*   **Use TypeScript only:** No vanilla JS files; strict types are required across frontend and backend.
*   **Use TailwindCSS only:** Utilize Tailwind classes for layout, styling, and color settings.
*   **Use Shadcn UI components:** Build UI forms, modals, tables, and dialogs using Shadcn UI primitives.
*   **Use mock APIs when backend is unavailable:** Keep frontend functional using mock interfaces matching planned schema objects.
*   **Do not add new dependencies without approval:** Stick strictly to Next.js 15, Drizzle, Express, and specified utility packages.

---

## 3. UX & Design Directives
*   **Maintain consistent design system:** Adhere to `#00C16A` brand color, solid white `#FFFFFF` canvas, and `12px` border-radius tokens.
*   **Build mobile-first:** Optimize layout dimensions, touch targets (minimum `48px` height), and input grids for mobile viewports.
*   **Prefer reusable components:** Modularize UI sections (e.g. Job Cards, Action Buttons) to avoid code duplication.
