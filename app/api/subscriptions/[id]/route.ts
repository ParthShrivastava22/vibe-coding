import { NextResponse } from "next/server";
import {
  SubscriptionService,
  ValidationFailedError,
} from "@/lib/subscriptions/service";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

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
    const updated = SubscriptionService.updateStatus(id, body);
    if (!updated) {
      return NextResponse.json(
        { error: `No subscription found with id "${id}"` },
        { status: 404 },
      );
    }
    return NextResponse.json(updated, { status: 200 });
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
