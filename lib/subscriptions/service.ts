import { SubscriptionRepository } from "./repository";
import {
  withComputedFields,
  calculateMonthlyBurnRate,
  countUpcomingRenewals,
} from "./calculations";
import type {
  CreateSubscriptionInput,
  Subscription,
  SubscriptionStatus,
  SubscriptionWithComputedFields,
  DashboardMetrics,
} from "./types";

const BILLING_CYCLES = ["monthly", "yearly"] as const;
const STATUSES = ["active", "paused"] as const;

export interface ValidationError {
  field: string;
  message: string;
}

export class ValidationFailedError extends Error {
  errors: ValidationError[];
  constructor(errors: ValidationError[]) {
    super("Validation failed");
    this.errors = errors;
  }
}

/** Validates raw request body for POST /api/subscriptions. */
function validateCreateInput(
  body: unknown,
):
  | { valid: true; data: CreateSubscriptionInput }
  | { valid: false; errors: ValidationError[] } {
  const errors: ValidationError[] = [];

  if (typeof body !== "object" || body === null) {
    return {
      valid: false,
      errors: [{ field: "body", message: "Request body must be an object" }],
    };
  }

  const input = body as Record<string, unknown>;

  const serviceName = input.serviceName;
  if (typeof serviceName !== "string" || serviceName.trim().length === 0) {
    errors.push({ field: "serviceName", message: "Service name is required" });
  }

  const cost = input.cost;
  if (typeof cost !== "number" || Number.isNaN(cost) || cost <= 0) {
    errors.push({ field: "cost", message: "Cost must be a positive number" });
  }

  const billingCycle = input.billingCycle;
  if (
    typeof billingCycle !== "string" ||
    !BILLING_CYCLES.includes(billingCycle as (typeof BILLING_CYCLES)[number])
  ) {
    errors.push({
      field: "billingCycle",
      message: "Billing cycle must be 'monthly' or 'yearly'",
    });
  }

  const nextRenewalDate = input.nextRenewalDate;
  if (
    typeof nextRenewalDate !== "string" ||
    Number.isNaN(Date.parse(nextRenewalDate))
  ) {
    errors.push({
      field: "nextRenewalDate",
      message: "Renewal date must be a valid date",
    });
  }

  if (errors.length > 0) {
    return { valid: false, errors };
  }

  return {
    valid: true,
    data: {
      serviceName: (serviceName as string).trim(),
      cost: cost as number,
      billingCycle: billingCycle as CreateSubscriptionInput["billingCycle"],
      nextRenewalDate: nextRenewalDate as string,
    },
  };
}

/** Validates raw request body for PATCH /api/subscriptions/[id]. */
function validateUpdateInput(
  body: unknown,
):
  | { valid: true; status: SubscriptionStatus }
  | { valid: false; errors: ValidationError[] } {
  if (typeof body !== "object" || body === null) {
    return {
      valid: false,
      errors: [{ field: "body", message: "Request body must be an object" }],
    };
  }

  const input = body as Record<string, unknown>;
  const status = input.status;

  if (
    typeof status !== "string" ||
    !STATUSES.includes(status as (typeof STATUSES)[number])
  ) {
    return {
      valid: false,
      errors: [
        { field: "status", message: "Status must be 'active' or 'paused'" },
      ],
    };
  }

  return { valid: true, status: status as SubscriptionStatus };
}

export const SubscriptionService = {
  getAllWithComputedFields(): SubscriptionWithComputedFields[] {
    return SubscriptionRepository.getAll().map((sub) =>
      withComputedFields(sub),
    );
  },

  getDashboardMetrics(): DashboardMetrics {
    const subscriptions: Subscription[] = SubscriptionRepository.getAll();
    return {
      totalMonthlyBurnRate: calculateMonthlyBurnRate(subscriptions),
      upcomingRenewalsCount: countUpcomingRenewals(subscriptions),
    };
  },

  create(body: unknown): SubscriptionWithComputedFields {
    const result = validateCreateInput(body);
    if (!result.valid) {
      throw new ValidationFailedError(result.errors);
    }
    const created = SubscriptionRepository.create(result.data);
    return withComputedFields(created);
  },

  updateStatus(
    id: string,
    body: unknown,
  ): SubscriptionWithComputedFields | undefined {
    const result = validateUpdateInput(body);
    if (!result.valid) {
      throw new ValidationFailedError(result.errors);
    }
    const updated = SubscriptionRepository.update(id, {
      status: result.status,
    });
    if (!updated) return undefined;
    return withComputedFields(updated);
  },
};
