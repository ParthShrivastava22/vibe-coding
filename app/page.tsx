import { SubscriptionService } from "@/lib/subscriptions/service";

export default function Home() {
  const subscriptions = SubscriptionService.getAllWithComputedFields();
  const metrics = SubscriptionService.getDashboardMetrics();

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 p-8">
      <h1 className="text-2xl font-semibold">
        Subscription Tracker — Foundation Ready
      </h1>
      <p className="text-muted-foreground">
        {subscriptions.length} seeded subscriptions loaded via the server-side
        repository.
      </p>
      <p className="text-muted-foreground">
        Monthly burn rate: ${metrics.totalMonthlyBurnRate.toFixed(2)} · Upcoming
        renewals: {metrics.upcomingRenewalsCount}
      </p>
      <p className="text-sm text-muted-foreground">
        Dashboard UI will be built in the next step.
      </p>
    </main>
  );
}
