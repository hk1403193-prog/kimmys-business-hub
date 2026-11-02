# Practice website on Cloudflare Pages

This prepares a later practice site. It does not create that site, deploy it, buy anything, or change `https://kimmysdelivery.com`.

The practice site is a separate Cloudflare Pages project. The live customer website stays where it is.

## Address to use later

Suggested project name:

```text
kimmys-hub-practice
```

Suggested practice address:

```text
https://kimmys-hub-practice.pages.dev
```

That address is not reserved by this repository. Cloudflare shows the real address when the project is created. If the suggested name is taken, use the `https://….pages.dev` address Cloudflare gives you, and use that same address in Supabase.

## Build settings for that later project

| Setting | Value |
| --- | --- |
| Build command | `npm run build` |
| Build output directory | `dist` |
| Root directory | `/` |
| Node.js | `22.23.4`, also recorded in `.node-version` |

Production build variables, using the two public names already saved for Cloud Agents:

```text
VITE_SUPABASE_URL
VITE_SUPABASE_PUBLISHABLE_KEY
```

The app reads those values while the site is built. Changing them later needs another build.

Leave the secret key and the service-role key out of Pages. The publishable key is the one this app can hold. It is safe for a browser app, and it still cannot grant the owner role or skip the authenticator.

The saved project address may end in `/rest/v1/`. The app keeps the `.supabase.co` address and ignores that ending.

For the first phone test, use one production address. Leave preview deployments off, and do not add a custom domain.

## Supabase redirect addresses

In **kimmys-hub-practice**, open **Authentication → URL Configuration**.

Set **Site URL** to the practice address, with nothing after the host. For the suggested name:

```text
https://kimmys-hub-practice.pages.dev
```

Add one **Redirect URL**:

```text
https://kimmys-hub-practice.pages.dev/auth/update-password
```

If the hostname is different, change the hostname in both lines. Keep `https://`. Keep the path `/auth/update-password`. Do not add a star (`*`), a trailing slash, or another project.

Remove any of these if they are present:

```text
http://localhost:5173
http://localhost:5173/auth/update-password
https://kimmysdelivery.com
https://www.kimmysdelivery.com
```

The reset email returns to `/auth/update-password` on the address open in Chrome. Supabase allows that only when the address is on this list. If it is not on the list, Supabase uses the Site URL instead. The Site URL has to be the practice address so a rejected link still stays off the live website.

`public/_redirects` tells Pages to open this app for `/login`, `/recover`, `/auth/update-password`, and each section address such as `/orders`. The phone can open or refresh those links. The JavaScript, CSS, and icon stay as their own files, because a catch-all rule would replace them with the app page.

Pages also has its own single-page fallback when the build has no `404.html`. This project does not add `404.html`, so that fallback remains available.

## Still waiting

- The Pages project is not created
- The site is not deployed
- The Supabase Site URL is not changed from this repository
- The live website is not modified
