# Use Kimmy's Business Hub on your Android phone

This is the phone guide. It does not use a computer. It does not change `https://kimmysdelivery.com`.

The practice website is not published yet. Follow these steps after you approve a practice deployment. Until then, there is no address to open on the phone.

## Before the first visit

You need:

1. The practice address from Cloudflare Pages. The suggested address is `https://kimmys-hub-practice.pages.dev`. If Cloudflare shows a different `pages.dev` address, use that one. The exact Supabase settings are in [phase-3-pages.md](phase-3-pages.md).
2. The owner email and password created in the practice project **kimmys-hub-practice**.
3. One authenticator app from the Play Store: **Google Authenticator** or **Aegis Authenticator**. Open the Play Store yourself. Skip any authenticator offered in an ad or a text message.

Use **Chrome** for every step below. When an email link arrives, open it in that same Chrome window.

## Sign in

1. Open the practice address in Chrome.
2. Sign in with the owner email and password.
3. Orders, customers, and the other sections stay hidden until the authenticator step is finished.

If the page says the practice site was built without its public values, stop. Do not type keys into the page.

## Add the authenticator on this same phone

The QR code is on this phone, so the camera cannot scan it.

1. On **Set up your authenticator**, tap **Copy setup key**.
2. Switch to the authenticator app.
3. Add an account and choose **Enter a setup key**.
4. Account name: `Kimmy's Business Hub`.
5. Paste the setup key. If the app asks, choose time-based and 6 digits.
6. Switch back to Chrome.
7. Type the current 6-digit code and tap **Verify code**.

The code changes about every 30 seconds. If a code is refused, wait for the next one and use that.

When the code is accepted, the command center opens. The pink bar says **Fictional sample data · Not saved** until the saved-order SQL from [phase-3-owner-auth.md](phase-3-owner-auth.md) has been run. After that SQL is installed, the bar says **Fictional sample data · Saved for this owner** once the orders have loaded.

## Later visits

1. Open the practice address in Chrome.
2. Sign in with the email and password.
3. Type the current 6-digit code.

You enter the setup key again only after an administrator removes the authenticator.

Tap **Sign out** when you are done. Sign-out closes the command center in this browser. It leaves the authenticator app installed.

## Password reset

Do this after the Supabase addresses in [phase-3-pages.md](phase-3-pages.md) match the practice address.

1. On the sign-in screen, tap **Forgot password**.
2. Enter the owner email.
3. Open the email on this phone.
4. If the link opens somewhere other than Chrome, copy it and paste it into the same Chrome window that asked for the reset.
5. Choose a new password of at least 8 characters.
6. The authenticator code is still required after that.

If the link opens `kimmysdelivery.com`, stop. Do not type the password there. The practice project's **Site URL** has to be changed to the practice address, and then you request a new link.

## Replaced phone or deleted authenticator app

There is no skip button.

1. In Chrome, open the Supabase dashboard for **kimmys-hub-practice**.
2. Go to **Authentication → Users** and open the owner account.
3. Remove the old authenticator.
4. Sign in on the practice site again and enroll with the setup key.

A new password does not remove the authenticator.

## Try the practice screens

Every name, phone, address, and dollar amount is fictional.

- **Orders:** tap **Create sample order**. Keep the fictional name, the 555 phone, the practice places, and the word Fictional in the instructions. Save it, search for the fictional name, and tap **Advance** or **Mark completed**. Delivered stays open. Completed closes the order.
- **Quotes:** open **Edit fee rules** and change the base fee. Merchandise stays separate from the service fee. Fee rules still reset on refresh.
- **Deliveries:** tap **Later** on the first stop, then **Previous day** and **Next day**. The stop order resets on refresh. The orders do not, once they are saved.
- **Home and Reports:** after you complete an order, the practice service-fee figures follow that change. The sample-week chart stays labeled illustrative.
- **Refresh:** if the pink bar says **Saved for this owner**, the fictional order is still there. If the bar says **Not saved**, the original samples come back.

## Check saved orders on this phone

Do this in Chrome after a practice deployment is open, and after the SQL in [phase-3-owner-auth.md](phase-3-owner-auth.md) has been run in **kimmys-hub-practice**. Do not open `https://kimmysdelivery.com`. Do not type a real name, a real phone, a real address, or an email. Do not type a password into any page except the practice sign-in screen.

1. Sign in and enter the current authenticator code. The sign-in screens are unchanged.
2. Wait until the pink bar leaves **Loading**. It should say **Saved for this owner**. If it says **Not saved**, stop. The orders SQL is not installed yet, and a refresh will drop changes.
3. Open **Orders**. The screen says the orders are saved, or that none are saved yet.
4. Tap **Create sample order**. Leave **Sample customer**, the `(555)` phone, **Preview Lane**, and the fictional instructions as they are. Tap **Create sample order** again.
5. The screen should say the sample order was saved. If it says the order was refused, read the message and fix only the fictional fields. Do not replace them with real customer information.
6. Refresh Chrome. Sign in again if it asks, including the authenticator code. Open **Orders**. The same fictional order is still there.
7. Tap **Show sample details**, then **Edit sample order**. Change the fictional name to **Riley Sample** and save. Refresh. The new fictional name is still there.
8. Tap **Mark completed**. The order closes. Refresh. It is still completed. Open **Deliveries** for today. It is listed under **Closed on this day**, not with the open stops.
9. Sign out, sign in, and enter the authenticator code again. The closed fictional order is still in **Orders**.
10. To see a refusal, edit the name to `Pat Customer` and save. That practice name is still invented, and it is refused because it does not include Sample, Example, Preview, Demo, Practice, Fictional, or Placeholder. The stored order stays as it was.
11. Open **Settings**. Card processing still says **Not connected**. The practice-notes check is separate and still does not show note text.

If a save says the practice database refused the request, sign out and sign in again so the authenticator code is current. If the order is still missing, the SQL was not run in the practice project.
