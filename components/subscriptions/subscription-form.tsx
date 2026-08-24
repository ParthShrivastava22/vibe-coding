"use client";

import { useState } from "react";
import { CalendarIcon, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { dateToYMD, formatRenewalDate } from "@/lib/format";
import type { BillingCycle } from "@/lib/subscriptions/types";

interface SubscriptionFormProps {
  onCreated: () => void;
}

interface FormErrors {
  serviceName?: string;
  cost?: string;
  billingCycle?: string;
  nextRenewalDate?: string;
}

export function SubscriptionForm({ onCreated }: SubscriptionFormProps) {
  const [serviceName, setServiceName] = useState("");
  const [cost, setCost] = useState("");
  const [billingCycle, setBillingCycle] = useState<BillingCycle | "">("");
  const [date, setDate] = useState<Date | undefined>(undefined);
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  function validate(): boolean {
    const nextErrors: FormErrors = {};

    if (!serviceName.trim()) {
      nextErrors.serviceName = "Service name is required";
    }

    const costValue = Number(cost);
    if (!cost || Number.isNaN(costValue) || costValue <= 0) {
      nextErrors.cost = "Cost must be a positive number";
    }

    if (!billingCycle) {
      nextErrors.billingCycle = "Select a billing cycle";
    }

    if (!date) {
      nextErrors.nextRenewalDate = "Pick a renewal date";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitError(null);

    if (!validate()) return;

    setSubmitting(true);
    try {
      const res = await fetch("/api/subscriptions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          serviceName: serviceName.trim(),
          cost: Number(cost),
          billingCycle,
          nextRenewalDate: dateToYMD(date as Date),
        }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => null);
        setSubmitError(body?.error ?? "Failed to add subscription");
        return;
      }

      setServiceName("");
      setCost("");
      setBillingCycle("");
      setDate(undefined);
      setErrors({});
      onCreated();
    } catch {
      setSubmitError("Failed to add subscription. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Add Subscription</CardTitle>
      </CardHeader>
      <CardContent>
        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:items-end"
        >
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium" htmlFor="serviceName">
              Service Name
            </label>
            <Input
              id="serviceName"
              placeholder="e.g. Netflix"
              value={serviceName}
              onChange={(e) => setServiceName(e.target.value)}
            />
            {errors.serviceName && (
              <p className="text-xs text-destructive">{errors.serviceName}</p>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium" htmlFor="cost">
              Cost
            </label>
            <Input
              id="cost"
              type="number"
              min="0"
              step="0.01"
              placeholder="0.00"
              value={cost}
              onChange={(e) => setCost(e.target.value)}
            />
            {errors.cost && (
              <p className="text-xs text-destructive">{errors.cost}</p>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium">Billing Cycle</label>
            <Select
              value={billingCycle}
              onValueChange={(value) => setBillingCycle(value as BillingCycle)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select cycle" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="monthly">Monthly</SelectItem>
                <SelectItem value="yearly">Yearly</SelectItem>
              </SelectContent>
            </Select>
            {errors.billingCycle && (
              <p className="text-xs text-destructive">{errors.billingCycle}</p>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium">Next Renewal Date</label>
            <Popover>
              <PopoverTrigger>
                <span
                  className={cn(
                    "flex h-9 w-full cursor-pointer items-center rounded-md border border-input bg-background px-3 py-2 text-sm shadow-xs",
                    !date && "text-muted-foreground",
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date ? formatRenewalDate(dateToYMD(date)) : "Pick a date"}
                </span>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar mode="single" selected={date} onSelect={setDate} />
              </PopoverContent>
            </Popover>
            {errors.nextRenewalDate && (
              <p className="text-xs text-destructive">
                {errors.nextRenewalDate}
              </p>
            )}
          </div>

          <div className="sm:col-span-2 lg:col-span-4">
            {submitError && (
              <p className="mb-2 text-sm text-destructive">{submitError}</p>
            )}
            <Button type="submit" disabled={submitting}>
              {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Add Subscription
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
