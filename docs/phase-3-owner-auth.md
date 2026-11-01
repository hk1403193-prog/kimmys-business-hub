# Phase 3.0 — Owner sign-in

This is the practice command center in this repository. It is not the live customer website.

The command center stays closed until all of these are true:

1. This computer has the practice project's public URL and publishable key.
2. You sign in with the administrator-created account.
3. That account's **app metadata** role is `owner`.
4. An authenticator app has verified this sign-in (assurance level `aal2`).

Practice orders on the screens are still fictional and still disappear on refresh. The optional database table below is also fictional. It is not a customer list.

Nothing in this phase is deployed. Do not merge until you have reviewed it. Do not point it at `https://kimmysdelivery.com`.

## 1. Public values, on this computer only

In the Supabase dashboard, open the practice project **kimmys-hub-practice**.

Go to **Project Settings → API Keys**.

Copy two public values:

- Project URL
- Publishable key

Do not copy the secret key. Do not copy the service-role key. Do not paste either public value into chat.

On this computer, in the project folder, copy `.env.example` to a new file named `.env.local`. Put the values on these lines:

```text
VITE_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=sb_publishable_...
```

`.env.local` is ignored by Git. Restart `npm run dev` after saving it.

If the key is refused, the preview says so and the command center stays closed. A secret key is refused on purpose.

## 2. Dashboard settings to confirm

In **kimmys-hub-practice** only:

- **Authentication → Sign In / Providers → Email** is enabled.
- New user sign-ups stay disabled.
- **Authentication → Multi-Factor → TOTP** is enabled.
- Leave phone and SMS factors off. This app does not use them.
- If a minimum password length is offered, set it to at least 8.

### Redirect URLs

Open **Authentication → URL Configuration**.

Set **Site URL** to:

```text
http://localhost:5173
```

Add this **Redirect URL**:

```text
http://localhost:5173/auth/update-password
```

Do not add `https://kimmysdelivery.com`, `https://www.kimmysdelivery.com`, or any other live address.

If a reset link's address is not on the allow list, Supabase falls back to the Site URL. That is why the Site URL must be this local preview and must not be the live website.

The app also refuses to build a reset link whose host is the live customer site.

## 3. Assign the owner role yourself

The app only **reads** `app_metadata.role`. It does not change your user JSON.

Do not put the role in **User Metadata**. The app ignores that field, and so does the database lock.

### Dashboard

1. Open **Authentication → Users**.
2. Open the existing administrator-created account.
3. Edit **Raw App Meta Data** (not User Metadata).
4. Keep every existing key, including `provider` and `providers`. Add `"role": "owner"`.

Example, if the current JSON is:

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

5. Sign out of the command center and sign in again so the new claim is in the session.

### SQL editor, if you prefer a merge

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

Replace `OWNER_EMAIL_HERE` with the existing account's email. Run this only in **kimmys-hub-practice**.

## 4. Practice database lock

The file `supabase/migrations/20261101120000_practice_owner_lock.sql` creates one table, `practice_owner_notes`.

- Row level security is on, and forced.
- `anon` has no privileges.
- A row can be read or written only when the JWT role is `authenticated`, the assurance level is `aal2`, and `app_metadata.role` is `owner`.
- Every note must start with `FICTIONAL:`.
- There is no policy that reads user metadata.

The app does not run this SQL. In the practice project, open **SQL Editor**, paste the file, and run it there. Do not run it in any other project.

There is no customer table. The in-screen orders stay in the browser.

After you are signed in and the authenticator has been accepted, **Settings → Check protected table** asks the practice project for that table. It shows a count. It does not print note text. If the SQL has not been run, the screen says the lock is not installed yet. The rest of the practice screens still work.

The Supabase service role bypasses these policies. That key stays in the dashboard. It must not be placed in this app or in GitHub.

## 5. Authenticator

See [phase-3-android.md](phase-3-android.md) for the phone steps.

First sign-in, before an authenticator is enrolled, shows the QR code and setup key. The command center is not on that screen.

Later sign-ins ask for the current 6-digit code.

Password reset saves a new password and then still asks for the code. There is no "skip" control.

### Lost or replaced phone

This app cannot remove the factor.

1. Sign in to the Supabase dashboard.
2. Open **Authentication → Users** and the owner account.
3. Remove the authenticator factor.
4. Sign in on the command center again and enroll the new phone.

That is an administrator action in the dashboard. It is not a bypass inside the app.

## 6. What stays disconnected

- `https://kimmysdelivery.com`, its host, its DNS, and its customer records
- Payments, text messages, and maps
- Deployment, preview hosting, and Cloudflare
- Secret keys and service-role keys

`npm run dev` is a preview on this computer. It is not a publication.
