/** Shared SaveLoom design tokens — slate + indigo fintech palette */

export const brand = {
  primary: "indigo-600",
  primaryHover: "indigo-700",
  accent: "slate-900",
} as const;

export const surfaces = {
  page: "min-h-screen app-gradient-bg",
  card: "glass-card rounded-xl",
  cardHover:
    "glass-card rounded-xl transition-all hover:shadow-md hover:border-white/80",
  nav: "glass-nav relative z-10",
  inset: "rounded-lg bg-white/60 ring-1 ring-white/40",
  list: "overflow-hidden rounded-xl glass-card divide-y divide-slate-100/60",
} as const;

export const typography = {
  pageTitle: "text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl",
  pageSubtitle: "text-sm text-slate-600 sm:text-base",
  sectionTitle: "text-base font-semibold tracking-tight text-slate-900",
  label: "text-xs font-medium uppercase tracking-wide text-slate-500",
  listTitle: "text-sm font-medium text-slate-900",
  listMeta: "text-xs text-slate-500",
} as const;

export const buttons = {
  primary:
    "inline-flex items-center justify-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition-all hover:bg-indigo-700 hover:shadow-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:pointer-events-none disabled:opacity-50",
  secondary:
    "inline-flex items-center justify-center gap-1.5 rounded-xl border border-white/60 bg-white/70 px-3 py-2 text-sm font-medium text-slate-700 shadow-sm backdrop-blur-sm transition-all hover:bg-white/90 hover:shadow-md",
  ghost:
    "inline-flex items-center justify-center gap-1.5 rounded-xl px-2.5 py-1.5 text-sm font-medium text-slate-600 transition-colors hover:bg-white/60 hover:text-slate-900",
} as const;

/** Ghost-style icons: subtle tint, color on the icon only */
export const iconBadge = {
  sm: "flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-indigo-500/[0.08] text-indigo-600",
  md: "flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-indigo-500/[0.08] text-indigo-600",
  muted: "flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-slate-500/[0.06] text-slate-500",
  success: "flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-emerald-500/[0.1] text-emerald-600",
  danger: "flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-red-500/[0.1] text-red-600",
  warning: "flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-amber-500/[0.1] text-amber-600",
} as const;

export const listRow = {
  item: "flex items-center gap-3 px-3 py-2.5 transition-colors hover:bg-slate-50/90",
  scroll: "max-h-72 overflow-y-auto overscroll-contain",
} as const;

export const layout = {
  page: "sidebar-content page-container space-y-6 p-4 sm:p-6 lg:p-8",
  section: "space-y-3",
  gridStats: "grid grid-cols-2 gap-3 lg:grid-cols-4",
  gridCards: "grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3",
} as const;

export const summaryStat = {
  card: "glass-card rounded-xl p-4 transition-all hover:shadow-md hover:border-white/80",
  value: "text-xl font-semibold tracking-tight tabular-nums text-slate-900",
  sub: "mt-0.5 text-xs text-slate-500",
} as const;

/** Chart palette — restrained, accessible colors */
export const chartColors = {
  income: "#059669",
  expense: "#dc2626",
  net: "#4f46e5",
  categories: [
    "#4f46e5",
    "#0ea5e9",
    "#059669",
    "#d97706",
    "#db2777",
    "#7c3aed",
    "#0891b2",
    "#65a30d",
  ],
} as const;

/** Icon badge tint by semantic color name (for budget status, etc.) */
export function iconBadgeTint(tone: "indigo" | "emerald" | "red" | "amber" | "slate") {
  const map = {
    indigo: iconBadge.sm,
    emerald: iconBadge.success,
    red: iconBadge.danger,
    amber: iconBadge.warning,
    slate: iconBadge.muted,
  };
  return map[tone];
}
