import { surfaces } from "~/lib/design";

interface PageShellProps {
  children: React.ReactNode;
  className?: string;
}

export default function PageShell({ children, className = "" }: PageShellProps) {
  return (
    <div className={`${surfaces.page} ${className}`}>
      {children}
    </div>
  );
}
