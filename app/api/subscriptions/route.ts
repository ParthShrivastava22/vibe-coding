import { NextResponse } from "next/server";
import {
  SubscriptionService,
  ValidationFailedError,
} from "@/lib/subscriptions/service";

export async function GET() {
  const subscriptions = SubscriptionService.getAllWithComputedFields();
  const metrics = SubscriptionService.getDashboardMetrics();

  return NextResponse.json({ subscriptions, metrics });
}

export async function POST(request: Request) {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Request body must be valid JSON" },
      { status: 400 },
    );
  }

  try {
    const subscription = SubscriptionService.create(body);
    return NextResponse.json(subscription, { status: 201 });
  } catch (err) {
    if (err instanceof ValidationFailedError) {
      return NextResponse.json(
        { error: "Validation failed", details: err.errors },
        { status: 400 },
      );
    }
    return NextResponse.json(
      { error: "Unexpected server error" },
      { status: 500 },
    );
  }
}
