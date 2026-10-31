# Brightloop Visual Design & Experience Specification

This document defines the visual design system, UI conventions, and interaction standards implemented across the Brightloop Subscription Management & Recurring Billing platform.

---

## 1. Design Direction: "Clean Indigo Ledger"

Brightloop's interface is designed for high-velocity operations, finance visibility, and customer self-service. The aesthetic balances financial precision with modern SaaS elegance.

- **Design Philosophy:** Crisp, high-contrast typography, clear status hierarchies, and glassmorphic micro-surfaces.
- **Audience:** Finance officers, sales teams managing subscription quotes, operations staff executing billing runs, and customers inspecting their billing ledger.
- **Tone:** Professional, reliable, structured, and modern.

---

## 2. Color Palette & Tokens

### Primary Accents
- **Indigo Accent:** `#4F46E5` (`indigo-600`) — Primary actions, brand highlights, and active navigation indicators.
- **Indigo Glow / Light Accent:** `#6366F1` (`indigo-500`) to `#818CF8` (`indigo-400`) in dark mode.
- **Violet Accent Gradient:** Linear transitions between Indigo (`#4F46E5`) and Violet (`#7C3AED`) for hero titles and focal stats.

### Neutrals & Backgrounds
- **Light Mode Surface:** Pure white (`#FFFFFF`) cards layered over cool slate (`#F8FAFC`, `slate-50`) canvas.
- **Dark Mode Surface:** Slate 900 (`#0F172A`) base canvas with Slate 800 (`#1E293B`) elevated cards.
- **Headings & Body Contrast:** Deep navy (`#0B1A35`) in light mode; Slate 100 (`#F1F5F9`) in dark mode.
- **Borders & Dividers:** Subtle borders (`slate-200` in light, `slate-800` in dark) ensuring distinct card boundaries without visual clutter.

### Status Semantic Colors
- **Active / Paid / Success:** Emerald (`emerald-600` / `#059669`) with light emerald tint (`emerald-50` / `emerald-950`).
- **Quotation / Confirmed / Pending:** Amber (`amber-600` / `#D97706`) with warm amber tint (`amber-50` / `amber-950`).
- **Overdue / Alert / Closed:** Rose (`rose-600` / `#E11D48`) with light rose tint (`rose-50` / `rose-950`).
- **Draft / Inactive / Paused:** Slate (`slate-500` / `#64748B`) with neutral tint (`slate-100` / `slate-800`).

---

## 3. Typography & Rhythm

- **Font Family:** System font stack (`ui-sans-serif, system-ui, sans-serif`) with font smoothing for razor-sharp legibility on all displays.
- **Headlines:** Tight-tracked (`tracking-tight`) weights ranging from `font-bold` (600) to `font-extrabold` (800).
- **Eyebrow Tags:** Small, uppercase micro-labels (`text-xs font-semibold uppercase tracking-wider text-indigo-600 dark:text-indigo-400`) placed immediately above section headings.
- **Data & Numeric Displays:** High-contrast tabular numbers for currency, invoice totals, and subscription counts.

---

## 4. Component Standards

- **Cards & Containers:** `rounded-2xl` borders with subtle resting shadows (`shadow-sm`), transitioning smoothly (`transition-all duration-200`) to elevated shadows (`shadow-md` or `shadow-lg`) with slight lift (`-translate-y-0.5`) on interactive hover.
- **Status Pills & Badges:** Rounded full-pill shapes (`rounded-full px-2.5 py-0.5 text-xs font-medium`) paired with semantic colors.
- **Navigation:** Sticky top navbar featuring glassmorphic blur (`backdrop-blur-md bg-white/80 dark:bg-slate-900/80`) with active tab indicators.
- **Modals & Overlays:** Centered dialogs with backdrop blur (`backdrop-blur-sm bg-black/40`), clean dismissal controls, and prominent action buttons.
- **Form Controls:** Clean input fields with focused indigo border rings (`focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500`), descriptive helper labels, and immediate error validation feedback.

---

## 5. Theme Support (Light / Dark Mode)

The application includes unified dark mode toggling managed through `ThemeContext`:
- Controlled via `client/src/context/ThemeContext.jsx`.
- Tailwind CSS 4 custom variant configured in `client/src/index.css`:
  ```css
  @custom-variant dark (&:where(.dark, .dark *));
  ```
- Instant persistence in browser `localStorage`.

---

## 6. Implementation Architecture

- **Styles & Framework:** Tailwind CSS 4 with `@import "tailwindcss";` in `client/src/index.css`.
- **Icons:** Modern SVG iconography from `lucide-react`.
- **Responsiveness:** Mobile-first layout with responsive grid breakpoints (`sm:`, `md:`, `lg:`, `xl:`), collapsible side drawers, and responsive tables.
