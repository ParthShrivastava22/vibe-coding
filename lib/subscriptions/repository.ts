import type { Subscription, CreateSubscriptionInput } from "./types";

/**
 * In-memory data store.
 *
 * This is deliberately isolated behind the functions below so it can be
 * swapped for a real database (e.g. SQLite) later without touching the
 * API routes or business logic in service.ts.
 *
 * We stash the store on `globalThis` so it survives Next.js dev-server
 * hot module reloads instead of resetting on every file save.
 */
declare global {
  // eslint-disable-next-line no-var
  var __subscriptionStore: Subscription[] | undefined;
}

function createSeedData(): Subscription[] {
  const today = new Date();
  const inDays = (days: number) => {
    const d = new Date(today);
    d.setDate(d.getDate() + days);
    return d.toISOString().slice(0, 10);
  };

  return [
    {
      id: crypto.randomUUID(),
      serviceName: "Netflix",
      cost: 15.99,
      billingCycle: "monthly",
      nextRenewalDate: inDays(3),
      status: "active",
    },
    {
      id: crypto.randomUUID(),
      serviceName: "Spotify",
      cost: 11.99,
      billingCycle: "monthly",
      nextRenewalDate: inDays(18),
      status: "active",
    },
    {
      id: crypto.randomUUID(),
      serviceName: "GitHub",
      cost: 100,
      billingCycle: "yearly",
      nextRenewalDate: inDays(45),
      status: "active",
    },
    {
      id: crypto.randomUUID(),
      serviceName: "AWS",
      cost: 40,
      billingCycle: "monthly",
      nextRenewalDate: inDays(5),
      status: "paused",
    },
  ];
}

function getStore(): Subscription[] {
  if (!globalThis.__subscriptionStore) {
    globalThis.__subscriptionStore = createSeedData();
  }
  return globalThis.__subscriptionStore;
}

export const SubscriptionRepository = {
  getAll(): Subscription[] {
    return [...getStore()];
  },

  getById(id: string): Subscription | undefined {
    return getStore().find((sub) => sub.id === id);
  },

  create(input: CreateSubscriptionInput): Subscription {
    const newSubscription: Subscription = {
      id: crypto.randomUUID(),
      ...input,
      status: "active",
    };
    getStore().push(newSubscription);
    return newSubscription;
  },

  update(id: string, data: Partial<Subscription>): Subscription | undefined {
    const store = getStore();
    const index = store.findIndex((sub) => sub.id === id);
    if (index === -1) return undefined;

    store[index] = { ...store[index], ...data };
    return store[index];
  },
};
