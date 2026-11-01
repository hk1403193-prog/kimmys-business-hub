# Kimmy's Business Hub

Private command center for **Kimmy's Personal Concierge & Delivery**.

Tagline: **Local People Helping Local People**.

Phase 1 is the mobile shell. Phase 2 is an interactive practice version of the owner tools. Phase 2.1 clarifies order status, service fees, and practice revenue. It is still not the finished business system, and it is not the live customer website.

## What Phase 2 includes

The same black, hot pink, and leopard command center, with fictional orders that the screens share:

1. **Orders.** Create a sample order, edit it, search it, and move it through statuses. Add a shopping list, instructions, pickup and delivery details, a date, and a delivery window. Each order keeps a status history.
2. **Quotes & Pricing.** Change the fee rules and a practice trip. The calculator separates the merchandise estimate from service earnings, and it shows the fictional amount due before shopping.
3. **Deliveries.** See one day at a time, with windows, service, priority, workload points, planning minutes, and status. Move stops earlier or later yourself.
4. **Dashboard.** New, active, and completed counts, expected and completed service revenue, remaining workload, the full day's workload, and upcoming deliveries update when the sample orders change.
5. **Customers, Money, Reports, and Settings.** These stay connected to the same practice session. The old sample-week chart, totals, and average are labeled illustrative. They are not payments received.

Refreshing the page puts the original practice data back. Nothing is stored.

Order statuses are: New, Quoted, Awaiting Payment, Confirmed, Shopping, Picked Up, Out for Delivery, Delivered, Completed, and Canceled.

**Delivered** means the order was physically delivered and is not closed yet. It can still appear with upcoming work. **Completed** means the order is closed. Completed and canceled orders stay in the history and leave upcoming deliveries. The route shows the remaining workload and the full day's workload separately.

A manual adjustment that would make the service fee negative is rejected, and the screen explains why. The service fee is never stored as a negative amount and then shown as $0. Merchandise stays separate from the service fee.

Expected service revenue is the service fees on orders that are still open. Completed service revenue is the service fees on closed orders. Neither one is money collected. This practice session does not track payments or unpaid balances.

## How to try each part

On a computer, in this folder:

```bash
npm install
npm test
npm run typecheck
npm run build
npm run dev
```

`npm run dev` opens a local preview on that computer only. It is not published.

Then, in the preview:

- **Orders:** tap Create sample order, save it, search for the fictional name, and tap Advance or Mark completed. Delivered stays open. Completed closes the order and removes it from upcoming deliveries.
- **Quotes:** open Edit fee rules, change the base fee, and watch the service fee change. Merchandise stays separate. A manual adjustment that would drop the service fee below zero is refused.
- **Deliveries:** tap Later on the first stop, then Previous day and Next day. The planning minutes are a workload guess. Remaining workload and the full day are both shown. Closed orders for that day sit under the open stops.
- **Dashboard and Reports:** go back to Home after completing an order. Expected service revenue, completed service revenue, and the remaining workload follow the change. The sample-week chart stays labeled illustrative.
- **Refresh:** the original sample orders return.

## What stays fictional

Every customer, phone, address, order, fee, and dollar amount is practice data. Service revenue is service fees only. The cost of goods is labeled as merchandise and is not treated as business revenue. Completed service revenue is not money collected.

## What is not connected

- The live customer website, its host, its domain, and its customer records
- Payments, text messages, and maps
- Deployment or paid services
- Secret keys

Owner sign-in uses the practice Supabase project when the public URL and publishable key are in `.env.local` on this computer. Practice orders on the screens still live in this browser session until you refresh. A separate fictional lock table is defined in SQL for you to run yourself in the practice project. It is not customer data.

## Phase 3

Phase 3.0 adds owner sign-in around the same command center. The screens stay closed until the practice account is the owner and an authenticator code has been accepted.

Setup, the owner-role step, the practice database lock, and the Android steps are in [docs/phase-3-owner-auth.md](docs/phase-3-owner-auth.md) and [docs/phase-3-android.md](docs/phase-3-android.md).

Before `npm run dev`, copy `.env.example` to `.env.local` and fill in the two public values. That file stays on this computer. Without it, the preview shows setup instructions and does not open the command center.

Password reset does not turn off the authenticator. This app does not edit account JSON, and it does not contain the Supabase secret key. Customer accounts, saved business records, payments, and any change involving the live website wait for a later approval.

## Project structure

```text
index.html                 Page shell
src/App.tsx                Chooses the open section, after sign-in
src/auth/                  Owner sign-in, authenticator, and access checks
src/styles.css             Colors, layout, and phone styling
src/domain/                Practice orders, quotes, workload, and the day plan
src/state/                 In-memory session shared by every screen
src/components/            Shared header, buttons, and forms
src/views/                 One file for each section
src/sample/                Original Phase 1 practice figures
src/lib/                   Helpers kept from Phase 1
supabase/migrations/       Practice lock SQL, run by you in the practice project
docs/                      Phase 3 setup and Android steps
```

## Safety rule

Work stays in this private repository. The live customer website, its host, its domain, and its customer records stay as they are.
