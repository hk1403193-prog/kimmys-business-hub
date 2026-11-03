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

Fee rules, the day plan, and the switches stay in this browser until you refresh. Practice orders stay saved after you run the Phase 3.1 SQL in the practice project. Until that SQL is run, a refresh puts the original sample orders back.

Order statuses are: New, Quoted, Awaiting Payment, Confirmed, Shopping, Picked Up, Out for Delivery, Delivered, Completed, and Canceled.

**Delivered** means the order was physically delivered and is not closed yet. It can still appear with upcoming work. **Completed** means the order is closed. Completed and canceled orders stay in the history and leave upcoming deliveries. The route shows the remaining workload and the full day's workload separately.

A manual adjustment that would make the service fee negative is rejected, and the screen explains why. The service fee is never stored as a negative amount and then shown as $0. Merchandise stays separate from the service fee.

Expected service revenue is the service fees on orders that are still open. Completed service revenue is the service fees on closed orders. Neither one is money collected. This practice session does not track payments or unpaid balances.

## How to try each part

The owner steps are for an Android phone, in Chrome. They are in [docs/phase-3-android.md](docs/phase-3-android.md).

The practice site is not published yet. After a later approved deployment, the phone opens the practice address in Chrome and signs in there.

On the phone, after sign-in and the authenticator code:

- **Orders:** tap Create sample order, keep the fictional name and 555 phone, and save it. Search for the fictional name, then tap Advance or Mark completed. Delivered stays open. Completed closes the order. After the Phase 3.1 SQL is installed, refresh the page and sign in again. The fictional order is still there.
- **Quotes:** open Edit fee rules, change the base fee, and watch the service fee change. Merchandise stays separate. A manual adjustment that would drop the service fee below zero is refused.
- **Deliveries:** tap Later on the first stop, then Previous day and Next day. The planning minutes are a workload guess. Remaining workload and the full day are both shown. Closed orders for that day sit under the open stops.
- **Dashboard and Reports:** go back to Home after completing an order. Expected service revenue, completed service revenue, and the remaining workload follow the change. The sample-week chart stays labeled illustrative.
- **Refresh:** saved practice orders stay after the Phase 3.1 SQL is installed. Fee rules, the stop order, and the switches still reset. If that SQL has not been run, the pink bar says **Not saved** and the original samples return.

## What stays fictional

Every customer, phone, address, order, fee, and dollar amount is practice data. Service revenue is service fees only. The cost of goods is labeled as merchandise and is not treated as business revenue. Completed service revenue is not money collected.

## What is not connected

- The live customer website, its host, its domain, and its customer records
- Payments, text messages, and maps
- A published practice site, a Cloudflare project, or a paid service
- Secret keys

Owner sign-in uses the practice Supabase project when a practice build includes the public project address and the publishable key. Practice orders can be saved in that same project after you run the Phase 3.1 SQL yourself. They are fictional rows for the verified owner. They are not customer records. The older fictional lock table is separate, and its policies are unchanged.

## Phase 3

Phase 3.0 adds owner sign-in around the same command center. The screens stay closed until the practice account is the owner and an authenticator code has been accepted.

Phase 3.1 saves fictional practice orders for the verified owner. The owner can create an order, open it again after a refresh, change it, and close it. The pink bar says **Saved for this owner** when the save is working. A normal name, a phone that is not a 555 number, an email address, or the live website is refused and is not stored.

The SQL for that table is in `supabase/migrations/20261102180000_practice_orders.sql`. This repository does not run it. Run the practice lock SQL first, then this file, in **kimmys-hub-practice** only. The steps are in [docs/phase-3-owner-auth.md](docs/phase-3-owner-auth.md). Safe phone checks are in [docs/phase-3-android.md](docs/phase-3-android.md).

The Android steps for sign-in are in [docs/phase-3-android.md](docs/phase-3-android.md). The owner role, authenticator rules, practice database lock, and security review are in [docs/phase-3-owner-auth.md](docs/phase-3-owner-auth.md). The future Cloudflare Pages address, build settings, and Supabase redirect lines are in [docs/phase-3-pages.md](docs/phase-3-pages.md). Nothing in this phase is deployed, and Cloudflare and DNS are unchanged.

The two public build values use the names in `.env.example`. They are not committed. Without them, the site shows setup instructions and does not open the command center.

Password reset does not turn off the authenticator. This app does not edit account JSON, and it does not contain the Supabase secret key. Direct links such as the password page and `/orders` are listed in `public/_redirects` so a static practice host can open the app. Customer accounts, payments, and any change involving the live website wait for a later approval. The only saved records in this phase are fictional practice orders.

## Checks used to prepare a build

These commands are for preparing the app. They are not the phone steps.

```bash
npm install
npm test
npm run typecheck
npm run build
```

`npm run build` writes a `dist` folder. That folder is not committed. Publishing it waits for a separate approval.

## Project structure

```text
index.html                 Page shell
public/_redirects          Practice-site addresses that open the app
.node-version              Node.js version for a later Pages build
src/App.tsx                Chooses the open section, after sign-in
src/auth/                  Owner sign-in, authenticator, and access checks
src/styles.css             Colors, layout, and phone styling
src/domain/                Practice orders, quotes, workload, and the day plan
src/state/                 Practice session, including saved fictional orders
src/components/            Shared header, buttons, and forms
src/views/                 One file for each section
src/sample/                Original Phase 1 practice figures
src/lib/                   Helpers kept from Phase 1
supabase/migrations/       Practice lock and practice-order SQL, run by you
docs/                      Phone guide, owner setup, and the future practice site
```

## Safety rule

Work stays in this private repository. The live customer website, its host, its domain, and its customer records stay as they are.
