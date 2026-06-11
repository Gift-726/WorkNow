# WorkNow - Design System & UI Guide

This guide defines the design constraints, token definitions, and UI principles for WorkNow. The styling focuses on a high-trust, accessible, fintech-inspired mobile-first interface.

---

## 1. Visual Style & Theme
*   **Theme Aesthetic:** Modern, Clean, Mobile First, Fintech Inspired, High Trust.
*   **Avoid:** Glassmorphism, Heavy Gradients, Neon Effects, and Complex Animations.
*   **Design Focus:** Plain colors, solid cards, high contrast, clean separation lines, and micro-interactions only.

---

## 2. Core Design Tokens

### Color Palette
*   **Primary (Brand):** `#00C16A` (Clean Emerald Green - representing growth, trust, and successful payments).
*   **Background:** `#FFFFFF` (Solid White - clean Canvas layout).
*   **Text Primary:** `#111827` (Dark Charcoal / Slate - for strong legibility).
*   **Text Secondary / Muted:** `#4B5563` (Muted Grey - for captions and subtext).
*   **Border / Divider:** `#E5E7EB` (Light Grey - clean borders).
*   **Error / Danger:** `#EF4444` (Solid Red - for SOS prompts, disputes, and cancel actions).
*   **Pending / Warning:** `#F59E0B` (Amber - for pending escrow, verification, and unread bids).

### Typography
*   **Font Family:** `Inter`, sans-serif (Highly readable on mobile screens).
*   **Scale:**
    *   `h1` (Display Title): `1.875rem` / `30px` (Bold)
    *   `h2` (Section Headers): `1.5rem` / `24px` (Semi-Bold)
    *   `h3` (Cards & Dialogs): `1.125rem` / `18px` (Medium)
    *   `body` (Main text): `1rem` / `16px` (Regular, line-height `1.5`)
    *   `caption` (Subtext): `0.875rem` / `14px` (Regular)

### Layout & Borders
*   **Border Radius:** `12px` for all interactive cards, text fields, and button components.
*   **Borders:** `1px solid #E5E7EB` for structures. Avoid drop-shadow blur where possible; use solid border outlines instead.

---

## 3. UI Principles & Accessibility
*   **Accessibility First:** Ensure text-to-background contrast ratios satisfy AAA standards.
*   **Large Touch Targets:** Buttons and input elements must have a minimum height of `48px` to ensure easy tap navigation on touch devices.
*   **Clear Call to Actions:** Primary buttons use solid `#00C16A` backgrounds with bold white text. Secondary buttons use transparent backgrounds with gray borders.
*   **Minimal Friction:** Multi-step forms (such as job posts) are split into small, digestible card sections.
