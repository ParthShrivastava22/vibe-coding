export type BillingCycle = "monthly" | "yearly";

export type SubscriptionStatus = "active" | "paused";

/**
 * The raw shape stored in the repository.
 * No computed/derived fields live here — those are calculated
 * on demand by lib/subscriptions/calculations.ts.
 */
export interface Subscription {
  id: string;
  serviceName: string;
  cost: number;
  billingCycle: BillingCycle;
  nextRenewalDate: string; // ISO date string, e.g. "2026-09-01"
  status: SubscriptionStatus;
}

/** Payload accepted by POST /api/subscriptions */
export interface CreateSubscriptionInput {
  serviceName: string;
  cost: number;
  billingCycle: BillingCycle;
  nextRenewalDate: string;
}

/** Payload accepted by PATCH /api/subscriptions/[id] */
export interface UpdateSubscriptionInput {
  status: SubscriptionStatus;
}

/**
 * A Subscription enriched with server-calculated fields.
 * This is what the API returns — the frontend never derives these itself.
 */
export interface SubscriptionWithComputedFields extends Subscription {
  monthlyCost: number;
  daysUntilRenewal: number;
  isRenewingSoon: boolean;
}

export interface DashboardMetrics {
  totalMonthlyBurnRate: number;
  upcomingRenewalsCount: number;
}
