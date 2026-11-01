# Android setup for the owner authenticator

Use this with the practice command center on your computer. It does not change `https://kimmysdelivery.com`.

The authenticator proves it is you after the password. The command center does not open until the 6-digit code is accepted.

## Install an authenticator

On the Android phone, install one authenticator from the Play Store:

- Google Authenticator, or
- Aegis Authenticator

Open the app store listing from the Play Store yourself. Do not install an "authenticator" from an ad or a text message.

You only need one of those apps.

## On the computer, before the phone

1. Finish the practice-project steps in [phase-3-owner-auth.md](phase-3-owner-auth.md).
2. The owner role must already be in **app metadata**.
3. In this project folder, run:

```bash
npm install
npm run dev
```

4. Open the local address Vite prints, usually `http://localhost:5173`.
5. Sign in with the existing owner email and password.

The next screen is **Set up your authenticator**. It shows a QR code and a setup key. The orders, customers, and other sections are not on this screen.

## Add the account on the phone

1. Open the authenticator app.
2. Add an account.
3. Scan the QR code on the computer screen.

If the camera cannot scan it:

1. Choose **Enter a setup key**.
2. Account name: `Kimmy's Business Hub`.
3. Type the setup key from the computer. The spaces are only there to make it readable. You can also tap **Copy setup key** and type it without spaces.
4. Time-based, 6 digits, if the app asks.

The phone then shows a 6-digit code. It changes about every 30 seconds.

## Confirm the code

1. On the computer, type the current code into **6-digit code**.
2. Tap **Verify code**.

When the code is accepted, the command center opens. The pink bar still says **Fictional sample data · Not saved**.

If the code is refused, wait for the next code and try that one. Do not reuse a code that just expired.

## Later visits

Sign in with email and password, then type the current 6-digit code. You do not scan the QR code again unless an administrator has removed the factor.

Tap **Sign out** when you are done, especially on a shared computer. Sign-out closes the command center on that device. It does not delete the authenticator on the phone.

## Password reset

1. On the sign-in screen, tap **Forgot password**.
2. Use the owner email.
3. Open the link on this computer. It should land on the local password page, not on the live website.
4. Choose a new password of at least 8 characters.
5. The authenticator code is still required after that.

If the email link opens the live website, stop. Do not enter the password there. In the practice project, set **Site URL** to `http://localhost:5173` and add `http://localhost:5173/auth/update-password` to **Redirect URLs**. Remove any live-site address from that list.

## Optional: open the preview on the phone

This is still not a deployment. Skip it if the computer screen is enough.

1. Keep the phone and the computer on the same home Wi-Fi.
2. Stop the preview, then start it with:

```bash
npm run dev -- --host
```

3. Vite prints a `Network` address such as `http://192.168.x.x:5173`. Open that address in the phone's browser.
4. If you want password reset to open on the phone, add that exact `http://192.168.x.x:5173/auth/update-password` address to the practice project's redirect allow list.
5. Do not forward port 5173 on the router. Do not use the live domain.

The phone can scan a QR code that is on the same phone only if you use the setup key instead. Scanning is easier when the QR code is on the computer and the authenticator is on the phone.

## Replaced phone or deleted app

The command center will not skip the code.

1. Sign in to the Supabase dashboard for **kimmys-hub-practice**.
2. Open **Authentication → Users** and the owner account.
3. Remove the old authenticator factor.
4. Sign in on the command center again.
5. Enroll the new phone with the steps above.

Password reset alone does not turn the authenticator off.
