import type { LucideIcon } from "lucide-react";
import { iconBadge } from "~/lib/design";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export default function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className={`${iconBadge.muted} mb-3 h-9 w-9`}>
        <Icon className="h-6 w-6" />
      </div>
      <p className="text-base font-medium text-slate-900">{title}</p>
      {description && <p className="mt-2 max-w-sm text-sm text-slate-500">{description}</p>}
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}
