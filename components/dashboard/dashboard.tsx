"use client";

import { useCallback, useEffect, useState } from "react";
import { MetricCard } from "@/components/dashboard/metric-card";
import { SubscriptionForm } from "@/components/subscriptions/subscription-form";
import { SubscriptionTable } from "@/components/subscriptions/subscription-table";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/format";
import type {
  DashboardMetrics,
  SubscriptionWithComputedFields,
} from "@/lib/subscriptions/types";

interface DashboardData {
  subscriptions: SubscriptionWithComputedFields[];
  metrics: DashboardMetrics;
}

export function Dashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setError(null);

      const res = await fetch("/api/subscriptions");

      if (!res.ok) {
        throw new Error("Failed to load subscriptions");
      }

      const json: DashboardData = await res.json();
      setData(json);
    } catch {
      setError("Couldn't load your subscriptions. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const loadDashboard = async () => {
      await fetchData();
    };

    loadDashboard();
  }, [fetchData]);

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      <header className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">SubTrack</h1>
          <p className="text-sm text-muted-foreground">
            Subscription &amp; Renewal Dashboard
          </p>
        </div>
        <Badge variant="secondary" className="hidden sm:inline-flex">
          Personal Finance
        </Badge>
      </header>

      <section className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <MetricCard
          title="Total Monthly Burn Rate"
          value={data ? formatCurrency(data.metrics.totalMonthlyBurnRate) : "—"}
          subtitle="Across active subscriptions"
        />
        <MetricCard
          title="Upcoming Renewals"
          value={data ? String(data.metrics.upcomingRenewalsCount) : "—"}
          subtitle="Next 7 days"
        />
      </section>

      <section className="mb-8">
        <SubscriptionForm onCreated={fetchData} />
      </section>

      <section>
        {loading ? (
          <LoadingState />
        ) : error ? (
          <ErrorState message={error} onRetry={fetchData} />
        ) : (
          <SubscriptionTable
            subscriptions={data?.subscriptions ?? []}
            onStatusChanged={fetchData}
          />
        )}
      </section>
    </div>
  );
}

function LoadingState() {
  return (
    <div className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
      Loading subscriptions…
    </div>
  );
}

function ErrorState({
  message,
  onRetry,
}: {
  message: string;
  onRetry: () => void;
}) {
  return (
    <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-8 text-center">
      <p className="text-sm text-destructive">{message}</p>
      <button
        onClick={onRetry}
        className="mt-3 text-sm font-medium text-primary underline underline-offset-4"
      >
        Try again
      </button>
    </div>
  );
}
