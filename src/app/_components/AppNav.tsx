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

export default function AppNav({ subtitle, user }: AppNavProps) {
  const pathname = usePathname();

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 17) return "Good Afternoon";
    return "Good Evening";
  };

  return (
    <>
      {/* Desktop Sidebar */}
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

      {/* Desktop Top Bar */}
      <header className="hidden md:block md:ml-[72px]">
        <div className="flex items-center justify-between px-8 py-5">
          <div>
            <h1 className="text-xl font-bold tracking-tight text-slate-900">
              {getGreeting()}
              {user?.name ? `, ${user.name.split(" ")[0]}` : ""}
            </h1>
            <p className="mt-0.5 text-sm text-slate-500">
              {subtitle ? subtitle : "Your financial overview"}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search here"
                className="fancy-input w-56 rounded-xl py-2.5 pl-10 pr-4 text-sm"
              />
            </div>
            <button className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/70 text-slate-400 ring-1 ring-slate-200/50 backdrop-blur-sm transition-all hover:bg-white hover:text-slate-600 hover:shadow-sm">
              <HelpCircle className="h-5 w-5" />
            </button>
            <button className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/70 text-slate-400 ring-1 ring-slate-200/50 backdrop-blur-sm transition-all hover:bg-white hover:text-slate-600 hover:shadow-sm">
              <Bell className="h-5 w-5" />
            </button>
            {user?.image && (
              <img
                src={user.image}
                alt={user.name ?? "Profile"}
                className="h-10 w-10 rounded-xl border-2 border-white/60 object-cover shadow-sm"
              />
            )}
          </div>
        </div>
      </header>

      {/* Mobile Top Bar */}
      <header className="md:hidden">
        <div className="flex items-center justify-between px-4 py-4">
          <div className="flex items-center gap-3">
            <Link href="/">
              <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 text-sm font-bold text-white shadow-lg">
                SL
              </div>
            </Link>
            <div>
              <h1 className="text-base font-bold text-slate-900">
                {getGreeting()}
                {user?.name ? `, ${user.name.split(" ")[0]}` : ""}
              </h1>
              <p className="text-xs text-slate-500">{subtitle ?? "Your financial overview"}</p>
            </div>
          </div>
          {user?.image && (
            <img
              src={user.image}
              alt={user.name ?? "Profile"}
              className="h-9 w-9 rounded-xl border-2 border-white/60 object-cover shadow-sm"
            />
          )}
        </div>
      </header>

      {/* Mobile Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-white/40 bg-white/80 backdrop-blur-xl md:hidden">
        <div className="flex items-center justify-around px-2 py-1.5">
          {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
            const active = isActive(pathname, href);
            return (
              <Link
                key={href}
                href={href}
                className={`flex flex-col items-center gap-0.5 rounded-xl px-3 py-1.5 text-[10px] font-medium transition-colors ${
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
