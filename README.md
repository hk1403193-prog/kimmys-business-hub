# Kimmy's Business Hub

Private command center for **Kimmy's Personal Concierge & Delivery**.

Tagline: **Local People Helping Local People**.

Phase 1 is the mobile shell. Phase 2 is an interactive practice version of the owner tools. It is still not the finished business system, and it is not the live customer website.

## What Phase 2 includes

The same black, hot pink, and leopard command center, with fictional orders that the screens share:

1. **Orders.** Create a sample order, edit it, search it, and move it through statuses. Add a shopping list, instructions, pickup and delivery details, a date, and a delivery window. Each order keeps a status history.
2. **Quotes & Pricing.** Change the fee rules and a practice trip. The calculator separates the merchandise estimate from service earnings, and it shows the fictional amount due before shopping.
3. **Deliveries.** See one day at a time, with windows, service, priority, workload points, planning minutes, and status. Move stops earlier or later yourself.
4. **Dashboard.** New, active, and completed counts, expected and completed service earnings, today's workload, and upcoming deliveries update when the sample orders change.
5. **Customers, Money, Reports, and Settings.** These stay connected to the same practice session. The old sample-week money chart is still there and is labeled separately.

Refreshing the page puts the original practice data back. Nothing is stored.

Order statuses are: New, Quoted, Awaiting Payment, Confirmed, Shopping, Picked Up, Out for Delivery, Delivered, Completed, and Canceled.

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

- **Orders:** tap Create sample order, save it, search for the fictional name, and tap Advance or Mark completed.
- **Quotes:** open Edit fee rules, change the base fee, and watch the fictional earnings change. Merchandise stays separate.
- **Deliveries:** tap Later on the first stop, then Previous day and Next day. The planning minutes are a workload guess.
- **Dashboard:** go back to Home after completing an order. The counts and earnings follow the change.
- **Refresh:** the original sample orders return.

## What stays fictional

Every customer, phone, address, order, fee, and dollar amount is practice data. Earnings are service fees only. The cost of goods is labeled as merchandise and is not treated as business revenue.

## What is not connected

- The live customer website, its host, its domain, and its customer records
- A database
- Accounts or login
- A payment company
- Text messages
- Maps or real driving times
- Deployment or paid services
- Passwords, API keys, or other secrets

## Phase 3

Phase 3 is owner login, before any real business records are added. It is not started. Customer accounts, saved records, payments, and any change involving the live website wait for a later approval.

## Project structure

```text
index.html                 Page shell
src/App.tsx                Chooses the open section
src/styles.css             Colors, layout, and phone styling
src/domain/                Practice orders, quotes, workload, and the day plan
src/state/                 In-memory session shared by every screen
src/components/            Shared header, buttons, and forms
src/views/                 One file for each section
src/sample/                Original Phase 1 practice figures
src/lib/                   Helpers kept from Phase 1
```

## Safety rule

Work stays in this private repository. The live customer website, its host, its domain, and its customer records stay as they are.
