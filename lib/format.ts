import type { BillingCycle } from "./subscriptions/types";

export function formatCurrency(amount: number): string {
  return `$${amount.toFixed(2)}`;
}

export function formatBillingCycle(cycle: BillingCycle): string {
  return cycle === "monthly" ? "Monthly" : "Yearly";
}

export function formatRenewalDate(dateStr: string): string {
  const [year, month, day] = dateStr.split("-").map(Number);
  const date = new Date(year, month - 1, day);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function formatDaysLeft(daysUntilRenewal: number): string {
  if (daysUntilRenewal < 0) return "Overdue";
  if (daysUntilRenewal === 0) return "Today";
  if (daysUntilRenewal === 1) return "1 day";
  return `${daysUntilRenewal} days`;
}

export function dateToYMD(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}
