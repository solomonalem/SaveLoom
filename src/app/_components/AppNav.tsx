"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import {
  LayoutDashboard,
  BarChart3,
  Wallet,
  Target,
  Sparkles,
  LogOut,
  Search,
  HelpCircle,
  Bell,
  type LucideIcon,
} from "lucide-react";

const NAV_ITEMS: { href: string; label: string; icon: LucideIcon }[] = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/budgets", label: "Budgets", icon: Wallet },
  { href: "/goals", label: "Goals", icon: Target },
  { href: "/insights", label: "Insights", icon: Sparkles },
];

function isActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

interface AppNavProps {
  subtitle?: string;
  user?: { name?: string | null; image?: string | null };
  actions?: React.ReactNode;
}

export default function AppNav({ subtitle, user, actions }: AppNavProps) {
  const pathname = usePathname();

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 17) return "Good Afternoon";
    return "Good Evening";
  };

  return (
    <>
      {/* Desktop sidebar — icon rail */}
      <aside className="sidebar-nav hidden md:flex">
        <div className="flex flex-col items-center gap-1 pt-5">
          <Link href="/" className="mb-5">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 text-sm font-bold text-white shadow-lg transition-transform hover:scale-105">
              SL
            </div>
          </Link>

          {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
            const active = isActive(pathname, href);
            return (
              <Link
                key={href}
                href={href}
                title={label}
                className={`sidebar-nav-item ${active ? "sidebar-nav-active" : ""}`}
              >
                <Icon className="h-5 w-5" />
              </Link>
            );
          })}
        </div>

        <div className="flex flex-col items-center gap-1 pb-5">
          <button
            type="button"
            onClick={() => signOut({ callbackUrl: "/" })}
            title="Sign out"
            className="sidebar-nav-item"
          >
            <LogOut className="h-5 w-5" />
          </button>
        </div>
      </aside>

      {/* Desktop top nav — icon + text labels */}
      <nav className="top-nav app-main-offset glass-nav hidden md:block">
        <div className="flex min-w-0 items-center gap-1 overflow-x-auto px-4 py-2.5 scrollbar-hide">
          {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
            const active = isActive(pathname, href);
            return (
              <Link
                key={href}
                href={href}
                className={`top-nav-link ${active ? "top-nav-link-active" : ""}`}
              >
                <Icon className="h-4 w-4 shrink-0" />
                <span>{label}</span>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Desktop page header */}
      <header className="app-main-offset hidden min-w-0 md:block">
        <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-4 sm:px-6 lg:px-8">
          <div className="min-w-0">
            <h1 className="truncate text-xl font-bold tracking-tight text-slate-900">
              {getGreeting()}
              {user?.name ? `, ${user.name.split(" ")[0]}` : ""}
            </h1>
            <p className="mt-0.5 text-sm text-slate-500">
              {subtitle ?? "Your financial overview"}
            </p>
          </div>

          <div className="flex min-w-0 flex-wrap items-center justify-end gap-2 sm:gap-3">
            {actions && (
              <div className="flex max-w-full flex-wrap items-center gap-2">{actions}</div>
            )}
            <div className="relative hidden lg:block">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search here"
                className="fancy-input w-48 rounded-xl py-2.5 pl-10 pr-4 text-sm xl:w-56"
              />
            </div>
            <button
              type="button"
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/70 text-slate-400 ring-1 ring-slate-200/50 backdrop-blur-sm transition-all hover:bg-white hover:text-slate-600 hover:shadow-sm"
            >
              <HelpCircle className="h-5 w-5" />
            </button>
            <button
              type="button"
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/70 text-slate-400 ring-1 ring-slate-200/50 backdrop-blur-sm transition-all hover:bg-white hover:text-slate-600 hover:shadow-sm"
            >
              <Bell className="h-5 w-5" />
            </button>
            {user?.image && (
              <img
                src={user.image}
                alt={user.name ?? "Profile"}
                className="h-10 w-10 shrink-0 rounded-xl border-2 border-white/60 object-cover shadow-sm"
              />
            )}
          </div>
        </div>
      </header>

      {/* Mobile top bar */}
      <header className="md:hidden">
        <div className="flex items-center justify-between gap-2 px-4 py-4">
          <div className="flex min-w-0 items-center gap-3">
            <Link href="/" className="shrink-0">
              <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 text-sm font-bold text-white shadow-lg">
                SL
              </div>
            </Link>
            <div className="min-w-0">
              <h1 className="truncate text-base font-bold text-slate-900">
                {getGreeting()}
                {user?.name ? `, ${user.name.split(" ")[0]}` : ""}
              </h1>
              <p className="truncate text-xs text-slate-500">{subtitle ?? "Your financial overview"}</p>
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            {actions && (
              <div className="flex max-w-[40vw] flex-wrap items-center justify-end gap-1">{actions}</div>
            )}
            {user?.image && (
              <img
                src={user.image}
                alt={user.name ?? "Profile"}
                className="h-9 w-9 rounded-xl border-2 border-white/60 object-cover shadow-sm"
              />
            )}
          </div>
        </div>
      </header>

      {/* Mobile bottom navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-white/40 bg-white/80 backdrop-blur-xl md:hidden">
        <div className="flex items-center justify-around px-2 py-1.5">
          {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
            const active = isActive(pathname, href);
            return (
              <Link
                key={href}
                href={href}
                className={`flex flex-col items-center gap-0.5 rounded-xl px-2 py-1.5 text-[10px] font-medium transition-colors ${
                  active ? "text-indigo-600" : "text-slate-400"
                }`}
              >
                <Icon className={`h-5 w-5 ${active ? "text-indigo-600" : ""}`} />
                {label}
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
