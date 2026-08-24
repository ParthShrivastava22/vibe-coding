import type { Subscription, SubscriptionWithComputedFields } from "./types";

const RENEWING_SOON_THRESHOLD_DAYS = 7;
const MONTHS_PER_YEAR = 12;

/** Normalizes any billing cycle into an equivalent monthly cost. */
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
 * Days remaining until the renewal date, counted from `from` (defaults to now).
 * Uses whole calendar days, ignoring time-of-day, so "today" is 0.
 */
export function calculateDaysUntilRenewal(
  nextRenewalDate: string,
  from: Date = new Date(),
): number {
  const renewalDate = startOfDay(new Date(nextRenewalDate));
  const today = startOfDay(from);

  const msPerDay = 1000 * 60 * 60 * 24;
  const diffMs = renewalDate.getTime() - today.getTime();

  return Math.round(diffMs / msPerDay);
}

/** A subscription is "renewing soon" if it renews within the next 7 days (inclusive) and isn't already overdue in a way that's stale — negative just means overdue, still flagged. */
export function isRenewingSoon(daysUntilRenewal: number): boolean {
  return daysUntilRenewal <= RENEWING_SOON_THRESHOLD_DAYS;
}

/** Attaches monthlyCost, daysUntilRenewal, and isRenewingSoon to a raw subscription. */
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

/** Sum of normalized monthly cost across active subscriptions only. */
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

/** Count of active subscriptions renewing within the threshold window. */
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

function startOfDay(date: Date): Date {
  const copy = new Date(date);
  copy.setHours(0, 0, 0, 0);
  return copy;
}
