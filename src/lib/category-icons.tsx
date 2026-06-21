import {
  type LucideIcon,
  Utensils,
  ShoppingBag,
  Car,
  Film,
  HeartPulse,
  Plane,
  Lightbulb,
  ShoppingCart,
  CircleDollarSign,
  CreditCard,
  ArrowLeftRight,
  Wrench,
  Landmark,
  Wallet,
  Shield,
  Home,
  TrendingUp,
  GraduationCap,
  Palmtree,
  Target,
  Building2,
  PieChart,
  BarChart3,
  Activity,
  Waves,
} from "lucide-react";

const budgetIcons: Record<string, LucideIcon> = {
  "Food and Drink": Utensils,
  Shops: ShoppingBag,
  Transportation: Car,
  Entertainment: Film,
  Healthcare: HeartPulse,
  Travel: Plane,
  Utilities: Lightbulb,
  Groceries: ShoppingCart,
  Payment: CreditCard,
  Transfer: ArrowLeftRight,
  Recreation: Target,
  Service: Wrench,
  Community: Landmark,
  "Banking & Finance": Building2,
  Income: Wallet,
  Other: CircleDollarSign,
};

const goalIcons: Record<string, LucideIcon> = {
  emergency: Shield,
  purchase: Home,
  investment: TrendingUp,
  debt: CreditCard,
  education: GraduationCap,
  vacation: Plane,
  retirement: Palmtree,
  other: Target,
};

export function getBudgetCategoryIcon(category: string): LucideIcon {
  return budgetIcons[category] ?? CircleDollarSign;
}

export function getGoalCategoryIcon(category: string): LucideIcon {
  return goalIcons[category] ?? Target;
}

export function CategoryIcon({
  category,
  type = "budget",
  className = "h-5 w-5",
}: {
  category: string;
  type?: "budget" | "goal";
  className?: string;
}) {
  const Icon =
    type === "goal" ? getGoalCategoryIcon(category) : getBudgetCategoryIcon(category);
  return <Icon className={className} aria-hidden />;
}

export const chartHeaderIcons = {
  breakdown: PieChart,
  cashFlow: BarChart3,
  trend: Activity,
  accounts: Building2,
  empty: BarChart3,
  warning: Target,
  wave: Waves,
} as const;
