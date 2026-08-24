# SubTrack — Subscription Tracker & Renewal Dashboard

A personal finance dashboard for tracking recurring SaaS applications and streaming subscriptions, monitoring renewal dates, and calculating monthly subscription cash-flow burn.

## Overview

**SubTrack** helps users keep track of recurring subscriptions in one place.

The dashboard normalizes subscriptions with different billing cycles into a common **monthly cost**, highlights subscriptions renewing within the next 7 days, and provides an Active/Paused control that allows users to simulate potential monthly savings without deleting subscriptions.

## Features

- Add subscriptions with:
  - Service name
  - Cost
  - Monthly or Yearly billing cycle
  - Next renewal date

- Calculate total monthly subscription burn
- Automatically normalize yearly subscriptions to monthly cost
- Track upcoming renewals
- Highlight subscriptions renewing within 7 days
- Display days remaining until each renewal
- Pause and reactivate subscriptions
- Exclude paused subscriptions from monthly burn calculations
- Keep paused subscriptions visible in the dashboard
- Server-side validation
- Loading and error states
- Responsive dashboard and subscription table

## Dashboard

The dashboard provides two primary metrics:

### Total Monthly Burn Rate

The equivalent monthly cost of all **active** subscriptions.

For example:

```text
Netflix   $15/month
GitHub    $120/year
Spotify   $12/month

Monthly Burn:
$15 + ($120 / 12) + $12
= $37/month
```

### Upcoming Renewals

The number of **active** subscriptions whose next renewal occurs within the next 7 calendar days.

## Subscription Status

Subscriptions can be either:

- **Active** — included in the Monthly Burn Rate.
- **Paused** — excluded from the Monthly Burn Rate but retained in the subscription collection.

Pausing a subscription updates its backend status rather than deleting it.

This allows the dashboard to act as a simple **savings simulation**.

## Architecture

The application follows a layered architecture:

```text
React UI
   │
   ▼
Next.js API Routes
   │
   ▼
Service Layer
   │
   ├── Validation
   ├── Business Logic
   │
   ▼
Calculation Layer
   │
   ▼
Repository
   │
   ▼
In-Memory Data Store
```

### Project Structure

```text
app/
├── api/
│   └── subscriptions/
│       ├── route.ts
│       └── [id]/
│           └── route.ts
├── page.tsx
├── layout.tsx
└── globals.css

components/
├── dashboard/
│   ├── dashboard.tsx
│   └── metric-card.tsx
│
├── subscriptions/
│   ├── subscription-form.tsx
│   └── subscription-table.tsx
│
└── ui/
    └── ...shadcn components

lib/
├── format.ts
├── utils.ts
└── subscriptions/
    ├── types.ts
    ├── calculations.ts
    ├── repository.ts
    └── service.ts
```

## Server-Side Business Logic

Business calculations are intentionally kept on the server.

The frontend receives already-computed values from the API rather than reimplementing business rules.

### Monthly Cost Normalization

```text
Monthly subscription:
monthly cost = cost

Yearly subscription:
monthly cost = yearly cost / 12
```

The normalization logic is implemented in:

```text
lib/subscriptions/calculations.ts
```

### Renewal Calculation

Renewal dates are stored as calendar dates in:

```text
YYYY-MM-DD
```

The application calculates the number of calendar days between the current date and the next renewal date.

A subscription is considered **Renewing Soon** when:

```text
0 <= daysUntilRenewal <= 7
```

Overdue subscriptions are not included in the Renewing Soon condition.

### Monthly Burn Rate

Only active subscriptions contribute to the monthly burn:

```text
Monthly Burn Rate =
sum(normalized monthly cost of active subscriptions)
```

Paused subscriptions remain visible but contribute:

```text
$0
```

to the burn calculation.

## API

### Get Subscriptions

```http
GET /api/subscriptions
```

Returns the subscriptions along with dashboard metrics.

Example response:

```json
{
  "subscriptions": [
    {
      "id": "example-id",
      "serviceName": "Netflix",
      "cost": 15.99,
      "billingCycle": "monthly",
      "nextRenewalDate": "2026-09-01",
      "status": "active",
      "monthlyCost": 15.99,
      "daysUntilRenewal": 8,
      "isRenewingSoon": false
    }
  ],
  "metrics": {
    "totalMonthlyBurnRate": 15.99,
    "upcomingRenewalsCount": 0
  }
}
```

### Create Subscription

```http
POST /api/subscriptions
```

Request:

```json
{
  "serviceName": "Netflix",
  "cost": 15.99,
  "billingCycle": "monthly",
  "nextRenewalDate": "2026-09-01"
}
```

The server validates the request before creating the subscription.

### Update Subscription Status

```http
PATCH /api/subscriptions/:id
```

Request:

```json
{
  "status": "paused"
}
```

or:

```json
{
  "status": "active"
}
```

A status update never deletes the subscription.

## Tech Stack

- **Next.js** — App Router and server-side API routes
- **TypeScript** — Type-safe application development
- **Tailwind CSS v4** — Styling and responsive layout
- **shadcn/ui** — UI components
- **React** — Frontend interaction and state management
- **Next.js Route Handlers** — Backend API
- **In-memory repository** — Lightweight server-side data storage

## Getting Started

### Prerequisites

Make sure you have:

- Node.js
- npm

### Installation

Clone the repository:

```bash
git clone https://github.com/ParthShrivastava22/vibe-coding
cd subscription-tracker
```

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

Open:

```text
http://localhost:3000
```

### Production Build

To verify the application builds successfully:

```bash
npm run build
```

To start the production server:

```bash
npm start
```

## Data Storage

The current implementation uses a server-side **in-memory repository**.

The repository is isolated behind:

```text
lib/subscriptions/repository.ts
```

This keeps the storage implementation separate from the API and business logic, making it possible to replace the in-memory store with a persistent database later without changing the calculation layer or frontend.

## Design Decisions

### Why calculations are server-side

The application keeps business logic on the server so that the frontend is primarily responsible for presentation and user interaction.

This prevents the client and server from developing conflicting versions of financial calculations.

### Why paused subscriptions are retained

Pausing a subscription represents a temporary state rather than deletion.

Keeping the subscription allows the user to reactivate it later while immediately seeing the potential monthly savings.

### Why an in-memory repository

The project focuses on subscription tracking and business logic rather than database infrastructure.

The repository abstraction keeps the storage layer replaceable while avoiding unnecessary infrastructure for the application.

## Future Improvements

Potential future enhancements include:

- Persistent database storage
- User authentication
- Multiple currencies
- Subscription categories
- Spending history and charts
- Email/browser renewal reminders
- Monthly spending trends
- Automatic recurring renewal updates
- Subscription cancellation tracking

## License

This project was created as a coding assessment project.
