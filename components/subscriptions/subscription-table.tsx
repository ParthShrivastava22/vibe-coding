"use client";

import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import {
  formatBillingCycle,
  formatCurrency,
  formatDaysLeft,
  formatRenewalDate,
} from "@/lib/format";
import type { SubscriptionWithComputedFields } from "@/lib/subscriptions/types";

interface SubscriptionTableProps {
  subscriptions: SubscriptionWithComputedFields[];
  onStatusChanged: () => void;
}

export function SubscriptionTable({
  subscriptions,
  onStatusChanged,
}: SubscriptionTableProps) {
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  async function handleToggle(id: string, isActive: boolean) {
    setUpdatingId(id);
    try {
      const res = await fetch(`/api/subscriptions/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: isActive ? "active" : "paused" }),
      });

      if (res.ok) {
        onStatusChanged();
      }
    } finally {
      setUpdatingId(null);
    }
  }

  if (subscriptions.length === 0) {
    return (
      <div className="rounded-lg border border-dashed p-10 text-center">
        <p className="font-medium">No subscriptions yet</p>
        <p className="mt-1 text-sm text-muted-foreground">
          Add your first subscription to start tracking your monthly burn.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Service</TableHead>
            <TableHead>Cost</TableHead>
            <TableHead>Billing Cycle</TableHead>
            <TableHead>Monthly Cost</TableHead>
            <TableHead>Next Renewal</TableHead>
            <TableHead>Days Left</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {subscriptions.map((sub) => {
            const isActive = sub.status === "active";
            return (
              <TableRow
                key={sub.id}
                className={cn(!isActive && "bg-muted/40 text-muted-foreground")}
              >
                <TableCell className="font-medium">{sub.serviceName}</TableCell>
                <TableCell>{formatCurrency(sub.cost)}</TableCell>
                <TableCell>{formatBillingCycle(sub.billingCycle)}</TableCell>
                <TableCell>{formatCurrency(sub.monthlyCost)}/mo</TableCell>
                <TableCell>{formatRenewalDate(sub.nextRenewalDate)}</TableCell>
                <TableCell>
                  <span className="inline-flex items-center gap-2">
                    {formatDaysLeft(sub.daysUntilRenewal)}
                    {sub.isRenewingSoon && (
                      <Badge className="border-amber-200 bg-amber-100 text-amber-800 hover:bg-amber-100">
                        Renewing Soon
                      </Badge>
                    )}
                  </span>
                </TableCell>
                <TableCell>
                  <Badge variant={isActive ? "default" : "secondary"}>
                    {isActive ? "Active" : "Paused"}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <Switch
                    checked={isActive}
                    disabled={updatingId === sub.id}
                    onCheckedChange={(checked) => handleToggle(sub.id, checked)}
                  />
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
