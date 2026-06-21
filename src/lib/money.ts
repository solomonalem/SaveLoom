/** Parse Prisma Decimal, strings, and numbers into a finite JS number */

export function parseMoney(value: unknown): number {
  if (value === null || value === undefined) return 0;

  if (typeof value === "number") {
    return Number.isFinite(value) ? value : 0;
  }

  if (typeof value === "string") {
    const cleaned = value.replace(/,/g, "").trim();
    if (!cleaned) return 0;
    const n = Number(cleaned);
    return Number.isFinite(n) ? n : 0;
  }

  if (typeof value === "object") {
    const obj = value as Record<string, unknown>;

    if (typeof obj.toNumber === "function") {
      return parseMoney((obj.toNumber as () => number)());
    }

    if (typeof obj.toString === "function") {
      const asString = (obj.toString as () => string)();
      if (asString && asString !== "[object Object]") {
        return parseMoney(asString);
      }
    }

    if ("value" in obj) return parseMoney(obj.value);
    if ("d" in obj && Array.isArray(obj.d)) {
      return parseMoney((obj.d as unknown[]).join(""));
    }
  }

  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
}

export function formatCurrency(amount: unknown, options?: { maximumFractionDigits?: number }) {
  const n = parseMoney(amount);
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: options?.maximumFractionDigits ?? 0,
  }).format(n);
}

export function formatSignedCurrency(amount: unknown) {
  const n = parseMoney(amount);
  const formatted = formatCurrency(Math.abs(n));
  if (n > 0) return `+${formatted}`;
  if (n < 0) return `-${formatted}`;
  return formatted;
}

/** Savings rate as 0–100, or null when income is zero/unknown */
export function computeSavingsRate(income: unknown, expenses: unknown): number | null {
  const incomeN = parseMoney(income);
  const expensesN = Math.abs(parseMoney(expenses));

  if (incomeN <= 0) return null;

  const rate = ((incomeN - expensesN) / incomeN) * 100;
  if (!Number.isFinite(rate)) return null;

  return Math.max(-100, Math.min(100, rate));
}

export function formatSavingsRate(rate: number | null | undefined): string {
  if (rate === null || rate === undefined || !Number.isFinite(rate)) {
    return "—";
  }
  return `${Math.round(rate)}%`;
}

export function formatPercent(value: unknown): string {
  const n = parseMoney(value);
  if (!Number.isFinite(n)) return "—";
  return `${Math.round(n)}%`;
}
