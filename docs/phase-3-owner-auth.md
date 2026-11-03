# Phase 3.0 — Owner sign-in

This is the practice command center. It is not the live customer website.

The command center stays closed until all of these are true:

1. The practice build includes the public project address and the publishable key.
2. You sign in with the administrator-created account.
3. That account's **app metadata** role is `owner`.
4. An authenticator app has verified this sign-in (assurance level `aal2`).

Practice orders are fictional. After you run the Phase 3.1 SQL below, the verified owner can save them. Until that SQL is run, they disappear when you refresh. Neither the orders table nor the older notes table is a customer list.

Nothing in this phase is deployed. Review it before any merge or publication. Keep it off `https://kimmysdelivery.com`.

Phone steps are in [phase-3-android.md](phase-3-android.md). The future practice address and the Supabase redirect lines are in [phase-3-pages.md](phase-3-pages.md).

## 1. Public build values

In the Supabase dashboard, open the practice project **kimmys-hub-practice**.

Go to **Project Settings → API Keys**.

Two public values are used:

- Project URL
- Publishable key

The secret key stays in the dashboard. The service-role key stays in the dashboard. Neither one goes in GitHub, in chat, or in the Pages build settings.

For Cloud Agents, those two public values are already saved under these names:

```text
VITE_SUPABASE_URL
VITE_SUPABASE_PUBLISHABLE_KEY
```

A saved project URL that ends in `/rest/v1/` is accepted. The app connects to the project address and ignores that ending. Any other extra path is refused.

A later Pages production build needs the same two names. The names and a blank example are in `.env.example`.

If the values are missing, wrong, or are a secret key, the practice site explains that and the command center stays closed.

## 2. Dashboard settings to confirm

In **kimmys-hub-practice** only. You can do this in Chrome on the phone.

- **Authentication → Sign In / Providers → Email** is enabled.
- New user sign-ups stay disabled.
- **Authentication → Multi-Factor → TOTP** is enabled. The app calls this the authenticator.
- Phone and SMS factors stay off.
- If a minimum password length is offered, set it to at least 8.

### Redirect URLs

Open **Authentication → URL Configuration** and use the practice address from [phase-3-pages.md](phase-3-pages.md).

For the suggested name, **Site URL** is:

```text
https://kimmys-hub-practice.pages.dev
```

The only extra **Redirect URL** is:

```text
https://kimmys-hub-practice.pages.dev/auth/update-password
```

Do not add `https://kimmysdelivery.com`, `https://www.kimmysdelivery.com`, `http://localhost:5173`, or a star pattern such as `https://*.pages.dev/**`.

The app also refuses to build a reset link whose host is the live customer site. A reset link for any other plain `http://` address is refused too. The practice site uses `https://`.

## 3. Assign the owner role yourself

The app only reads `app_metadata.role`. It does not change your user JSON.

The role in **User Metadata** is ignored by the app and by the database lock. Put the role in **Raw App Meta Data**.

### Dashboard

1. Open **Authentication → Users**.
2. Open the existing administrator-created account.
3. Edit **Raw App Meta Data**.
4. Keep every existing key, including `provider` and `providers`. Add `"role": "owner"` in lowercase.

Example, when the current JSON is:

```json
{
  "provider": "email",
  "providers": ["email"]
}
```

Save this, with those keys still present:

```json
{
  "provider": "email",
  "providers": ["email"],
  "role": "owner"
}
```

5. Sign out of the command center and sign in again so the new role is in the session.

`Owner`, `OWNER`, and `owner ` with a space are not accepted. The word is `owner`.

### SQL editor, if you prefer a merge

This repository does not run the statement. Run it yourself in **kimmys-hub-practice** only, if you want the dashboard edit done as SQL.

Run the select first. It should return one row. If it returns none, or more than one, stop.

```sql
select id, email, raw_app_meta_data
from auth.users
where email = 'OWNER_EMAIL_HERE';
```

Then merge the role. This keeps the other keys:

```sql
update auth.users
set raw_app_meta_data =
  coalesce(raw_app_meta_data, '{}'::jsonb) || jsonb_build_object('role', 'owner')
where email = 'OWNER_EMAIL_HERE';
```

Select the row again. `provider` and `providers` should still be there, and `role` should be `owner`.

Replace `OWNER_EMAIL_HERE` with the existing account's email.

## 4. Practice database lock

The file `supabase/migrations/20261101120000_practice_owner_lock.sql` creates one table, `practice_owner_notes`.

This repository does not run that file.

- Row level security is on, and forced, so the table owner does not skip it.
- `anon` has no privileges.
- `public` has no privileges.
- A row can be read or written only when the signed-in role is `authenticated`, the assurance level is `aal2`, and `app_metadata.role` is `owner`.
- Every note must start with `FICTIONAL:` in uppercase, and the note length is limited.
- The SQL does not read user metadata.

When you choose to install it, open **SQL Editor** in the practice project, paste the file, and run it there. Do not run it in any other project.

There is no customer table. Practice orders stay in the browser until you run the separate SQL in section 8. That file does not change this notes table or its policies.

After you are signed in and the authenticator has been accepted, **Settings → Check protected table** asks the practice project for that table. It shows a count. It does not print note text on the screen. If the SQL has not been run, the screen says the lock is not installed yet. The rest of the practice screens still work.

The Supabase service role bypasses these policies. That key stays in the dashboard.

## 5. Authenticator

See [phase-3-android.md](phase-3-android.md).

The first sign-in, before an authenticator is enrolled, shows the setup key. The command center is not on that screen.

Later sign-ins ask for the current 6-digit code.

Password reset saves a new password and then still asks for the code. There is no skip control. The app can clear an unfinished setup. It does not remove an authenticator that has already been verified.

### Lost or replaced phone

1. Sign in to the Supabase dashboard.
2. Open **Authentication → Users** and the owner account.
3. Remove the authenticator factor.
4. Sign in on the command center again and enroll the new phone.

That is an administrator action in the dashboard. It is not a bypass inside the app.

## 6. Security review

This review covers the owner role, authenticator enrollment, and the practice-table rules. It did not change the live website, run SQL, or call Supabase with a secret key.

**Owner role.** Access looks at app metadata only. A role typed into user metadata does not open the command center and does not pass the practice-table check. The browser app cannot write app metadata with the publishable key. The role still has to be saved in the dashboard before the first successful sign-in. This review cannot see that account.

**Authenticator.** The command center opens only at assurance level `aal2`. Before any authenticator exists, the app shows enrollment. After one is verified, it asks for the current code. There is no button that skips the code. Saving a new password does not remove a verified authenticator. The dev-only layout preview is not included in a production build.

**Practice notes table.** That SQL turns on row level security, forces it, removes `anon` and `public` privileges, and allows a row only for an authenticated owner at `aal2`. Notes must start with `FICTIONAL:`. The service-role key would bypass the policies, so it is kept out of the app. The table does nothing until you run the SQL yourself. Phase 3.1 does not change those policies.

**Practice orders table.** The separate SQL in section 8 uses the same owner function, forces row level security, and refuses a row that is not marked fictional. The app sends orders only after the owner check. It does not contain the secret key. This review did not run that SQL.

**What the sign-in gate covers.** It closes the screens during a normal visit. Real customer records are not in this app. Fictional practice orders are saved only after you run the Phase 3.1 SQL, and only a verified owner can read or write them. Until that SQL is run, a refresh puts the original samples back.

**Password recovery.** The link has to come back to `/auth/update-password` on the practice address, in the same Chrome window, because the reset proof is stored in that browser. `public/_redirects` is what lets that address open the app on Pages instead of a missing-page error. The same file covers a direct visit to `/orders` or the other sections.

## 7. What stays disconnected

- `https://kimmysdelivery.com`, its host, its DNS, and its customer records
- Payments, text messages, and maps
- A Cloudflare project, a deployment, and any paid service
- Secret keys and service-role keys

## 8. Saved practice orders

The file `supabase/migrations/20261102180000_practice_orders.sql` creates one table, `practice_orders`.

This repository does not run that file. Do not run it from the app, from a terminal connection, or in any project except **kimmys-hub-practice**.

Run section 4 first if you have not already. The orders file stops if `public.is_verified_owner()` is missing. It does not replace that function, and it does not change `practice_owner_notes` or the four notes policies.

### What the SQL does

- Row level security is on, and forced, so the table owner does not skip it.
- `anon` has no privileges. `public` has no privileges.
- The signed-in role can select, insert, and update. It cannot delete.
- A row can be read or written only when `public.is_verified_owner()` is true and the row belongs to that account. That function is the existing check: authenticated, authenticator level `aal2`, and app metadata role `owner`.
- The label has to start with `FICTIONAL:`.
- The customer words have to include Sample, Example, Preview, Fictional, Demo, Practice, or Placeholder.
- The phone has to look like `(555) 010-0199`.
- Places have to include a practice word such as Practice, Sample, Demo, Preview, or Placeholder.
- Instructions, when present, have to include the word fictional.
- The stored text cannot contain an email address or `kimmysdelivery`.
- Completed and canceled orders are marked closed. Delivered stays open. Closed orders remain in the table so the history is still there after a refresh.
- The SQL does not read user metadata.

The Supabase secret key still bypasses these policies. That key stays in the dashboard. It is not in this app.

### Run it yourself

1. Open the SQL editor in **kimmys-hub-practice** only.
2. If the practice lock from section 4 is not installed, paste `supabase/migrations/20261101120000_practice_owner_lock.sql` and run it there.
3. Paste `supabase/migrations/20261102180000_practice_orders.sql` and run it there.
4. If the editor says `public.is_verified_owner()` is missing, run the lock file, then run the orders file again.

Do not paste either file into another project. Do not add real customer names, phones, or addresses as a test row. The screen creates the fictional rows after you sign in.

Fee rules, the delivery stop order, hours, services, and areas still reset on refresh. Only the fictional orders stay saved. There is no payment column and no connection to the live website.
