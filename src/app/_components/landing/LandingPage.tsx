"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  ArrowRight,
  BarChart3,
  Brain,
  Building2,
  CheckCircle2,
  PiggyBank,
  Shield,
  Sparkles,
  Target,
  TrendingUp,
  Wallet,
  Zap,
} from "lucide-react";
import PageShell from "~/app/_components/PageShell";
import { buttons, chartColors, iconBadge, surfaces, typography } from "~/lib/design";

const spendingData = [
  { name: "Food", value: 820, fill: chartColors.categories[0] },
  { name: "Shopping", value: 640, fill: chartColors.categories[1] },
  { name: "Transport", value: 410, fill: chartColors.categories[2] },
  { name: "Bills", value: 380, fill: chartColors.categories[3] },
  { name: "Fun", value: 290, fill: chartColors.categories[4] },
];

const savingsTrend = [
  { month: "Jan", saved: 120 },
  { month: "Feb", saved: 340 },
  { month: "Mar", saved: 520 },
  { month: "Apr", saved: 680 },
  { month: "May", saved: 890 },
  { month: "Jun", saved: 1240 },
];

const cashFlow = [
  { day: "Mon", income: 0, expenses: 42 },
  { day: "Tue", income: 0, expenses: 18 },
  { day: "Wed", income: 3200, expenses: 95 },
  { day: "Thu", income: 0, expenses: 31 },
  { day: "Fri", income: 0, expenses: 67 },
  { day: "Sat", income: 0, expenses: 124 },
  { day: "Sun", income: 0, expenses: 48 },
];

const features = [
  {
    icon: Brain,
    tone: "indigo" as const,
    title: "AI insights that act",
    description:
      "Claude analyzes your real transactions and surfaces subscriptions to cut, budget alerts, and savings opportunities — not generic tips.",
  },
  {
    icon: BarChart3,
    tone: "emerald" as const,
    title: "Visual spending clarity",
    description:
      "See where every dollar goes with category breakdowns, cash-flow trends, and month-over-month comparisons.",
  },
  {
    icon: Target,
    tone: "amber" as const,
    title: "Budgets & goals",
    description:
      "Set category limits, track progress toward savings goals, and get notified before you overspend.",
  },
  {
    icon: Building2,
    tone: "slate" as const,
    title: "Secure bank sync",
    description:
      "Connect accounts through Plaid with read-only access. Transactions import automatically — no spreadsheets.",
  },
  {
    icon: PiggyBank,
    tone: "emerald" as const,
    title: "Find hidden savings",
    description:
      "Spot duplicate subscriptions, rising categories, and small purchases that add up over time.",
  },
  {
    icon: Shield,
    tone: "indigo" as const,
    title: "Bank-level security",
    description:
      "Encrypted connections, no credential storage, and industry-standard auth. Your data stays yours.",
  },
];

const steps = [
  { step: "1", title: "Sign in free", detail: "Create your account in seconds with Google." },
  { step: "2", title: "Connect your bank", detail: "Link accounts securely via Plaid." },
  { step: "3", title: "Set goals & budgets", detail: "Tell us what you're saving for." },
  { step: "4", title: "Get AI guidance", detail: "Receive personalized insights weekly." },
];

const insightPreviews = [
  {
    title: "Subscription overlap detected",
    body: "You're paying for two streaming services with similar content. Switching could save ~$14/mo.",
    tag: "Saving opportunity",
    tone: "emerald",
  },
  {
    title: "Dining spend up 23%",
    body: "Food & drink is trending higher vs last month. You're $86 away from your budget limit.",
    tag: "Budget alert",
    tone: "amber",
  },
  {
    title: "Emergency fund on track",
    body: "You've hit 68% of your $5,000 goal. At this pace you'll finish 6 weeks early.",
    tag: "Goal progress",
    tone: "indigo",
  },
];

function useInView(threshold = 0.15) {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 80);
    return () => clearTimeout(t);
  }, [threshold]);
  return visible;
}

function toneBadge(tone: string) {
  const map: Record<string, string> = {
    indigo: iconBadge.sm,
    emerald: iconBadge.success,
    amber: iconBadge.warning,
    slate: iconBadge.muted,
  };
  return map[tone] ?? iconBadge.sm;
}

export default function LandingPage() {
  const animated = useInView();

  return (
    <PageShell>
      {/* Top bar */}
      <header className="sticky top-0 z-20 border-b border-white/40 bg-white/70 backdrop-blur-md">
        <div className="page-container flex items-center justify-between px-6 py-3 lg:px-8">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 text-sm font-bold text-white">
              SL
            </div>
            <span className="text-sm font-semibold text-slate-900">SaveLoom</span>
          </div>
          <Link href="/auth/signin" className={buttons.secondary}>
            Sign in
          </Link>
        </div>
      </header>

      <div className="page-container px-6 pb-20 lg:px-8">
        {/* Hero */}
        <section className="relative overflow-hidden py-16 lg:py-24">
          <div className="landing-orb landing-orb-1" aria-hidden />
          <div className="landing-orb landing-orb-2" aria-hidden />

          <div className="relative grid items-center gap-12 lg:grid-cols-2">
            <div className={`space-y-6 ${animated ? "landing-fade-up" : "opacity-0"}`}>
              <div className="inline-flex items-center gap-2 rounded-full border border-indigo-200/60 bg-indigo-500/[0.08] px-3 py-1 text-xs font-medium text-indigo-700">
                <Sparkles className="h-3.5 w-3.5" />
                AI-powered personal finance
              </div>
              <h1 className="text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl lg:text-5xl lg:leading-tight">
                Meet your AI financial coach
              </h1>
              <p className="max-w-xl text-base leading-relaxed text-slate-600 sm:text-lg">
                SaveLoom learns your spending habits, understands your goals, and gives you
                personalized recommendations to save money and invest wisely — all in one
                beautiful dashboard.
              </p>
              <div className="flex flex-wrap items-center gap-3">
                <Link href="/auth/signin" className={`${buttons.primary} px-6 py-2.5 text-base`}>
                  Get started free
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <a href="#how-it-works" className={buttons.secondary}>
                  See how it works
                </a>
              </div>
              <div className="flex flex-wrap gap-4 pt-2 text-xs text-slate-500">
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                  Free to start
                </span>
                <span className="flex items-center gap-1.5">
                  <Shield className="h-3.5 w-3.5 text-indigo-500" />
                  Plaid-secured
                </span>
                <span className="flex items-center gap-1.5">
                  <Zap className="h-3.5 w-3.5 text-amber-500" />
                  Insights in minutes
                </span>
              </div>
            </div>

            {/* Product preview card */}
            <div
              className={`${surfaces.card} landing-float p-5 shadow-lg shadow-indigo-500/10 lg:p-6 ${animated ? "landing-fade-up landing-delay-2" : "opacity-0"}`}
            >
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <p className={typography.label}>This month</p>
                  <p className="text-2xl font-semibold tabular-nums text-slate-900">$2,540</p>
                  <p className="text-xs text-slate-500">total spending</p>
                </div>
                <div className="rounded-lg bg-emerald-500/10 px-2.5 py-1 text-xs font-medium text-emerald-700">
                  <TrendingUp className="mr-1 inline h-3 w-3" />
                  +$340 saved
                </div>
              </div>

              <div className="mb-4 grid grid-cols-3 gap-2">
                {[
                  { label: "Balance", value: "$12.4k", icon: Wallet },
                  { label: "Budget", value: "82%", icon: Target },
                  { label: "Goals", value: "3 active", icon: PiggyBank },
                ].map(({ label, value, icon: Icon }) => (
                  <div key={label} className="rounded-lg bg-slate-50/80 p-2.5 ring-1 ring-slate-100">
                    <Icon className="mb-1 h-3.5 w-3.5 text-indigo-600" />
                    <p className="text-[10px] text-slate-500">{label}</p>
                    <p className="text-sm font-semibold text-slate-900">{value}</p>
                  </div>
                ))}
              </div>

              <p className={`mb-2 ${typography.label}`}>Spending breakdown</p>
              <div className="h-36">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={spendingData}
                      cx="50%"
                      cy="50%"
                      innerRadius={38}
                      outerRadius={58}
                      paddingAngle={3}
                      dataKey="value"
                      animationBegin={200}
                      animationDuration={1200}
                    >
                      {spendingData.map((entry) => (
                        <Cell key={entry.name} fill={entry.fill} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(v: number) => [`$${v}`, "Spent"]}
                      contentStyle={{ borderRadius: 8, border: "1px solid #e2e8f0", fontSize: 12 }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </section>

        {/* Stats strip */}
        <section className="mb-16 grid grid-cols-2 gap-3 lg:grid-cols-4">
          {[
            { value: "100+", label: "Merchants recognized", sub: "With brand logos" },
            { value: "6", label: "Core modules", sub: "Dashboard to insights" },
            { value: "AI", label: "Claude-powered", sub: "Personalized advice" },
            { value: "24/7", label: "Auto sync", sub: "When banks are linked" },
          ].map((stat, i) => (
            <div
              key={stat.label}
              className={`${surfaces.card} p-4 landing-fade-up`}
              style={{ animationDelay: `${i * 80}ms` }}
            >
              <p className="text-xl font-semibold text-indigo-600">{stat.value}</p>
              <p className="text-sm font-medium text-slate-900">{stat.label}</p>
              <p className="text-xs text-slate-500">{stat.sub}</p>
            </div>
          ))}
        </section>

        {/* Charts section */}
        <section className="mb-20">
          <div className="mb-8 text-center">
            <h2 className={`${typography.pageTitle} mb-2`}>See your money clearly</h2>
            <p className={`${typography.pageSubtitle} mx-auto max-w-2xl`}>
              Interactive charts turn raw transactions into decisions — where you overspend,
              when cash flow dips, and how savings grow over time.
            </p>
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <div className={`${surfaces.card} p-5 landing-fade-up`}>
              <h3 className={`mb-1 ${typography.sectionTitle}`}>Weekly cash flow</h3>
              <p className="mb-4 text-xs text-slate-500">Income vs expenses at a glance</p>
              <div className="h-52">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={cashFlow} barGap={4}>
                    <XAxis dataKey="day" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                    <YAxis hide />
                    <Tooltip
                      contentStyle={{ borderRadius: 8, fontSize: 12 }}
                      formatter={(v: number, name: string) => [
                        `$${v}`,
                        name === "income" ? "Income" : "Expenses",
                      ]}
                    />
                    <Bar dataKey="income" fill={chartColors.income} radius={[4, 4, 0, 0]} animationDuration={1000} />
                    <Bar dataKey="expenses" fill={chartColors.expense} radius={[4, 4, 0, 0]} animationDuration={1000} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className={`${surfaces.card} p-5 landing-fade-up landing-delay-2`}>
              <h3 className={`mb-1 ${typography.sectionTitle}`}>Savings momentum</h3>
              <p className="mb-4 text-xs text-slate-500">Track progress month over month</p>
              <div className="h-52">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={savingsTrend}>
                    <defs>
                      <linearGradient id="savingsGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={chartColors.net} stopOpacity={0.25} />
                        <stop offset="95%" stopColor={chartColors.net} stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="month" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                    <YAxis hide />
                    <Tooltip
                      contentStyle={{ borderRadius: 8, fontSize: 12 }}
                      formatter={(v: number) => [`$${v}`, "Saved"]}
                    />
                    <Area
                      type="monotone"
                      dataKey="saved"
                      stroke={chartColors.net}
                      strokeWidth={2}
                      fill="url(#savingsGrad)"
                      animationDuration={1200}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </section>

        {/* AI insights preview */}
        <section className="mb-20">
          <div className="mb-8 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <h2 className={`${typography.pageTitle} mb-2`}>Insights that feel personal</h2>
              <p className={`${typography.pageSubtitle} max-w-xl`}>
                Not generic finance blogs — recommendations built from your actual spending,
                budgets, and goals.
              </p>
            </div>
            <div className={iconBadge.md}>
              <Brain className="h-4 w-4" />
            </div>
          </div>

          <div className="grid gap-3 md:grid-cols-3">
            {insightPreviews.map((insight, i) => (
              <div
                key={insight.title}
                className={`${surfaces.cardHover} p-4 landing-fade-up`}
                style={{ animationDelay: `${i * 100}ms` }}
              >
                <span className="mb-2 inline-block rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-medium uppercase text-slate-600">
                  {insight.tag}
                </span>
                <h3 className="mb-1.5 text-sm font-semibold text-slate-900">{insight.title}</h3>
                <p className="text-xs leading-relaxed text-slate-600">{insight.body}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Features grid */}
        <section className="mb-20">
          <div className="mb-8 text-center">
            <h2 className={`${typography.pageTitle} mb-2`}>Everything you need in one place</h2>
            <p className={`${typography.pageSubtitle} mx-auto max-w-2xl`}>
              From connecting accounts to hitting savings goals — SaveLoom covers the full
              journey.
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {features.map(({ icon: Icon, tone, title, description }, i) => (
              <div
                key={title}
                className={`${surfaces.cardHover} p-5 landing-fade-up`}
                style={{ animationDelay: `${i * 60}ms` }}
              >
                <div className={`${toneBadge(tone)} mb-3`}>
                  <Icon className="h-4 w-4" />
                </div>
                <h3 className="mb-1.5 text-sm font-semibold text-slate-900">{title}</h3>
                <p className="text-xs leading-relaxed text-slate-600">{description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* How it works */}
        <section id="how-it-works" className="mb-20">
          <div className="mb-8 text-center">
            <h2 className={`${typography.pageTitle} mb-2`}>How it works</h2>
            <p className={typography.pageSubtitle}>Up and running in four simple steps</p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {steps.map(({ step, title, detail }, i) => (
              <div
                key={step}
                className={`${surfaces.card} relative p-5 landing-fade-up`}
                style={{ animationDelay: `${i * 80}ms` }}
              >
                <div className="mb-3 flex h-8 w-8 items-center justify-center rounded-full bg-indigo-600 text-sm font-bold text-white">
                  {step}
                </div>
                <h3 className="mb-1 text-sm font-semibold text-slate-900">{title}</h3>
                <p className="text-xs text-slate-600">{detail}</p>
                {i < steps.length - 1 && (
                  <ArrowRight className="absolute right-4 top-1/2 hidden h-4 w-4 -translate-y-1/2 text-slate-300 lg:block" />
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Final CTA */}
        <section className="hero-card-purple px-8 py-12 text-center lg:px-12">
          <h2 className="mb-3 text-2xl font-semibold sm:text-3xl">
            Ready to take control of your finances?
          </h2>
          <p className="mx-auto mb-6 max-w-lg text-sm text-indigo-100 sm:text-base">
            Join SaveLoom and turn everyday spending into smarter saving — powered by AI,
            secured by Plaid.
          </p>
          <Link
            href="/auth/signin"
            className="inline-flex items-center gap-2 rounded-xl bg-white px-6 py-2.5 text-sm font-semibold text-indigo-700 shadow-lg transition-transform hover:scale-[1.02]"
          >
            Get started free
            <ArrowRight className="h-4 w-4" />
          </Link>
        </section>

        <p className="mt-10 text-center text-xs text-slate-500">
          Bank-level security · Read-only bank access · Free to get started
        </p>
      </div>
    </PageShell>
  );
}
