import type { Subscription, SubscriptionWithComputedFields } from "./types";

const RENEWING_SOON_THRESHOLD_DAYS = 7;
const MONTHS_PER_YEAR = 12;

export function normalizeToMonthlyCost(
  cost: number,
  billingCycle: Subscription["billingCycle"],
): number {
  if (billingCycle === "yearly") {
    return cost / MONTHS_PER_YEAR;
  }
  return cost;
}

/**
 * Parses a "YYYY-MM-DD" calendar-date string into a local Date at midnight.
 * Avoids `new Date("YYYY-MM-DD")`, which parses as UTC and can shift the
 * date by a day depending on the server's timezone offset.
 */
function parseLocalDateString(dateStr: string): Date {
  const [year, month, day] = dateStr.split("-").map(Number);
  return new Date(year, month - 1, day);
}

function startOfDay(date: Date): Date {
  const copy = new Date(date);
  copy.setHours(0, 0, 0, 0);
  return copy;
}

/**
 * Days remaining until the renewal date, counted from `from` (defaults to now).
 * Both dates are compared as local calendar dates at midnight, so "today"
 * is 0, tomorrow is 1, yesterday is -1.
 */
export function calculateDaysUntilRenewal(
  nextRenewalDate: string,
  from: Date = new Date(),
): number {
  const renewalDate = parseLocalDateString(nextRenewalDate);
  const today = startOfDay(from);

  const msPerDay = 1000 * 60 * 60 * 24;
  const diffMs = renewalDate.getTime() - today.getTime();

  return Math.round(diffMs / msPerDay);
}

/**
 * A subscription is "renewing soon" when it renews today or within the
 * next 7 days. Overdue (negative) subscriptions are NOT renewing soon.
 */
export function isRenewingSoon(daysUntilRenewal: number): boolean {
  return (
    daysUntilRenewal >= 0 && daysUntilRenewal <= RENEWING_SOON_THRESHOLD_DAYS
  );
}

export function withComputedFields(
  subscription: Subscription,
  from: Date = new Date(),
): SubscriptionWithComputedFields {
  const daysUntilRenewal = calculateDaysUntilRenewal(
    subscription.nextRenewalDate,
    from,
  );

  return {
    ...subscription,
    monthlyCost: normalizeToMonthlyCost(
      subscription.cost,
      subscription.billingCycle,
    ),
    daysUntilRenewal,
    isRenewingSoon: isRenewingSoon(daysUntilRenewal),
  };
}

export function calculateMonthlyBurnRate(
  subscriptions: Subscription[],
): number {
  return subscriptions
    .filter((sub) => sub.status === "active")
    .reduce(
      (total, sub) =>
        total + normalizeToMonthlyCost(sub.cost, sub.billingCycle),
      0,
    );
}

export function countUpcomingRenewals(
  subscriptions: Subscription[],
  from: Date = new Date(),
): number {
  return subscriptions.filter((sub) => {
    if (sub.status !== "active") return false;
    const days = calculateDaysUntilRenewal(sub.nextRenewalDate, from);
    return isRenewingSoon(days);
  }).length;
}
