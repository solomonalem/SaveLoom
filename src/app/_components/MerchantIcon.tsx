"use client";

import { useState } from "react";
import { CategoryIcon } from "~/lib/category-icons";
import {
  getMerchantLogoUrl,
  resolveBankDomain,
  resolveMerchantDomain,
} from "~/lib/merchant-icons";

type MerchantIconProps = {
  merchantName?: string | null;
  description?: string | null;
  category: string;
  /** Use for bank account rows instead of merchant matching */
  bankName?: string | null;
  size?: "sm" | "md";
  className?: string;
  iconClassName?: string;
};

const sizeClasses = {
  sm: { box: "h-7 w-7", icon: "h-3.5 w-3.5" },
  md: { box: "h-9 w-9", icon: "h-4 w-4" },
} as const;

export default function MerchantIcon({
  merchantName,
  description,
  category,
  bankName,
  size = "sm",
  className,
  iconClassName,
}: MerchantIconProps) {
  const domain =
    resolveBankDomain(bankName) ??
    resolveMerchantDomain(merchantName, description);
  const [failed, setFailed] = useState(false);

  const sizes = sizeClasses[size];
  const boxClass = className ?? sizes.box;
  const fallbackIconClass = iconClassName ?? sizes.icon;

  if (!domain || failed) {
    return (
      <div
        className={`flex shrink-0 items-center justify-center rounded-md bg-slate-500/[0.06] text-slate-500 ${boxClass}`}
      >
        <CategoryIcon category={category} className={fallbackIconClass} />
      </div>
    );
  }

  const label = merchantName || description || bankName || category;

  return (
    <div
      className={`relative shrink-0 overflow-hidden rounded-md bg-white ring-1 ring-slate-200/60 ${boxClass}`}
      title={label}
    >
      <img
        src={getMerchantLogoUrl(domain)}
        alt=""
        className="h-full w-full object-contain p-0.5"
        loading="lazy"
        onError={() => setFailed(true)}
      />
    </div>
  );
}
