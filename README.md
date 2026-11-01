# Kimmy's Business Hub

Private command center for **Kimmy's Personal Concierge & Delivery**.

Tagline: **Local People Helping Local People**.

This repository is Phase 1 only. It is a mobile-first preview you can read and click through. It is not the finished business system, and it is not the live customer website.

## What Phase 1 includes

- A private owner dashboard with ten sections
- Black and hot pink styling, with a subtle leopard-print accent
- Large buttons and a bottom menu meant for an Android phone
- Clearly labeled fictional sample information
- A sample quote calculator and a sample route you can reorder on screen

The ten sections are:

1. Dashboard — daily overview
2. Orders — incoming and active orders
3. Customers — customer management
4. Quotes & Pricing — adjustable fee settings
5. Deliveries — daily schedule and stops
6. Money — income, expenses, and profit
7. Partners — local business partnerships
8. Marketing — campaigns and follow-ups
9. Reports — business performance
10. Settings — hours, services, areas, and payments

Changes you make on Quotes, Deliveries, or Settings stay on the screen only. Refreshing the page puts the sample data back.

The page address ends with the open section, such as `#orders`. On a phone, Back returns to the previous section.

## What Phase 1 leaves out

- The live customer website is untouched
- No connection to existing hosting, the domain, or customer records
- No real customer accounts or real customer information
- No database
- No payment processor
- No deployment and no paid services
- No passwords, API keys, or other secrets

Owner login comes in a later phase, before any real business records are added. This preview is safe to keep private because the people, orders, and dollar amounts are invented.

## Review it on an Android phone

Phase 1 is not published to the internet. Open the pull request in Chrome while you are logged in to GitHub:

1. Open the pull request link.
2. Read the description at the top.
3. Look at the screenshots of the command center.
4. Tap **Files changed** if you want to see the project files.
5. You will not get a new public website from this phase. That is intentional.

## Project structure

```text
index.html              Page shell
src/App.tsx             Chooses the open section
src/styles.css          Colors, layout, and phone styling
src/sections.ts         Names of the ten sections
src/components/         Shared header, buttons, and navigation
src/views/              One file for each section
src/sample/             Fictional practice data
src/lib/                Sample quote, money, and route helpers
public/favicon.svg      Small pink K icon
```

## Checks

From a computer, in this folder:

```bash
npm install
npm test
npm run typecheck
npm run build
```

`npm run dev` starts a local preview. That preview stays on the computer where the command is run. It is not published.

## Later phases

These are not started.

1. **Phase 1 — this preview.** Screens, sample data, no saving.
2. **Phase 2 — saved practice records.** A database of fictional customers only.
3. **Phase 3 — owner login.** A private door for you, before any real records.
4. **Phase 4 — working owner tools.** Orders, customers, saved fee settings, and the daily route.
5. **Phase 5 — money records.** Still no card processor until you approve one.
6. **Phase 6 — partners, follow-ups, and reports** based on saved records.
7. **Phase 7 — customer accounts,** only if you want them in this hub.
8. **Phase 8 — the live website.** A separate decision. Nothing in that phase starts without a new, explicit approval.

## Safety rule

Work stays in this private repository. The live customer website, its host, its domain, and its customer records stay as they are.
