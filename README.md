# DriveFlare

![DriveFlare](images/banner.jpg)

A single-file Cloudflare Worker that turns **Google Drive** and **Cloudflare R2** into a self-hosted, multi-user file browser — with its own login system, previews, sharing, stars, and an admin panel. No build step, no framework, no database beyond Workers KV.

```
┌─────────────┐      ┌──────────────────┐      ┌──────────────┐
│  Browser    │ ───► │  Cloudflare      │ ───► │ Google Drive │
│  (PWA)      │      │  Worker + KV     │      │  v3 API      │
└─────────────┘      └──────────────────┘      ├──────────────┤
                              │                │  R2 buckets  │
                              └──────────────► └──────────────┘
```

---

## Features

- **Two storage backends** — browse **Google Drive** (root, folders, shared drives) and/or **Cloudflare R2 buckets** from the same UI, side by side. Choose *Drive only*, *R2 only*, or *Both*.
- **Multi-user login** — email + password accounts stored in KV; the first account is an admin.
- **Multiple locations** — expose any mix of Drive roots, folders, shared drives, and R2 buckets, each as its own "disk".
- **File browser** — grid / list views, breadcrumbs, folder navigation, infinite scroll pagination.
- **Previews** — images, video, audio, PDF (lazy multi-page rendering via pdf.js), plain text, CSV table view, and an in-browser **ZIP browser** (list & extract entries up to 25 MB).
- **Search** — scoped per location with path reconstruction; works across Drive folders and R2 prefixes.
- **Starred & Recent** — per-user, synced to the server (with a `localStorage` cache for instant load).
- **Sharing**
  - **People** — share a file to another app user; it appears in their *Shared* tab.
  - **Anyone with the link** — expiring public links (1 day / 7 days / 30 days / never).
- **Admin panel** — manage users, edit-access flags, locations, storage mode, Drive credentials, project name and favicon.
- **File-link protection** — optional per-location toggle so direct `/file/...` URLs require a signed-in user.
- **Theming** — light / dark / system, accent hue picker, grid/list layout, all persisted client-side.
- **PWA** — installable, with a service worker that caches the shell and third-party assets.
- **Security headers** — CSP, HSTS, `nosniff`, `X-Frame-Options`, Permissions-Policy on every HTML/API response.
- **Zero build** — one `.js` file, template literals for HTML, Tailwind via CDN, Material Symbols icons.

---

## Requirements

- A [Cloudflare Workers](https://workers.cloudflare.com/) account (free tier works).
- A **Workers KV namespace** bound to the Worker as `gdrive`.
- **For Google Drive** — a **Google OAuth client** with:
  - `client_id`
  - `client_secret`
  - a **refresh token** granting at least `https://www.googleapis.com/auth/drive.readonly`
- **For R2** — one or more **R2 buckets** bound to the Worker (binding names are what you enter as location IDs).

> DriveFlare only ever **reads** from Drive and R2. It never writes, moves, or deletes anything in your storage.

---

## Deploy

### 1. Create the Worker

Either paste [`src/workers.js`](src/workers.js) into the Cloudflare dashboard editor, or use Wrangler:

```toml
# wrangler.toml
name = "driveflare"
main = "src/workers.js"
compatibility_date = "2024-01-01"

[[kv_namespaces]]
binding = "gdrive"
id = "<your-kv-namespace-id>"

# Optional — one entry per R2 bucket you want to expose
[[r2_buckets]]
binding = "drive1"
bucket_name = "<your-bucket-name>"
```

```bash
wrangler deploy
```

### 2. Bind the KV namespace (and R2 buckets)

In the Cloudflare dashboard:

- **Workers & Pages → your Worker → Settings → Bindings → Add → KV namespace**, variable name exactly `gdrive`.
- For each R2 bucket: **Bindings → Add → R2 bucket**, choose a binding name (e.g. `drive1`). You'll enter that name as the location ID during setup.

### 3. Run the guided setup

Open your Worker URL in a browser. On a fresh deployment you'll be redirected to `/setup`, which walks you through:

1. **Welcome** — read the setup notes and bind `gdrive`.
2. **Storage check** — verifies the KV binding and detects R2 bindings.
3. **Name** — project name (defaults to *DriveFlare*) and optional favicon URL.
4. **Admin** — first administrator email + password.
5. **Storage** — pick *Google Drive*, *R2*, or *Both*, enter Drive credentials if needed, and add locations.
6. **Finish** — validates credentials and folder/drive IDs before writing to KV.

Once `drive_token`, `dirs`, and `users` exist, `/setup` stops responding (returns 404). **Finish setup right after deploying** — anyone who can reach a fresh deployment can configure it.

---

## Getting a Google refresh token

Any standard OAuth "installed app" flow works. Roughly:

1. Create an OAuth client in the [Google Cloud Console](https://console.cloud.google.com/apis/credentials) (type: *Desktop app*).
2. Enable the **Google Drive API** for the project.
3. Authorize with scope `https://www.googleapis.com/auth/drive.readonly` (or broader if you need to browse folders you don't own but have access to — the `drive` scope also covers shared drives).
4. Exchange the returned authorization code for a refresh token:

```bash
curl -s https://oauth2.googleapis.com/token \
  -d client_id=YOUR_CLIENT_ID \
  -d client_secret=YOUR_CLIENT_SECRET \
  -d code=AUTH_CODE \
  -d grant_type=authorization_code \
  -d redirect_uri=urn:ietf:wg:oauth:2.0:oob
```

The `refresh_token` in the response is what the setup page asks for.

---

## Locations

Each location is one of:

| Type          | ID                                   | Notes                                                   |
| ------------- | ------------------------------------ | ------------------------------------------------------- |
| `root`        | `root`                               | The authenticated user's My Drive root.                 |
| `folder`      | Google Drive folder ID               | A specific folder (must be a folder, not a file).       |
| `shared_drive`| Shared drive ID                      | A whole shared drive.                                   |
| `r2`          | R2 binding name (e.g. `drive1`)      | An R2 bucket bound to this Worker.                      |

Locations are validated during setup. You can add, edit, or remove them later from the **Manage → Locations** panel (admins only). The `protect_file_link` option on a location makes direct `/file/...` URLs require an authenticated session.

The storage mode (Drive / R2 / Both) can be changed later under **Manage → General → Storage mode**. Switching modes requires removing locations that belong to the other backend first, and re-entering Drive credentials if they're missing or need replacing.

---

## Accounts & roles

- Stored under the KV key `users` as a JSON array: `{ email, password, allowedit }`.
- **Passwords are stored as entered** — no hashing. Restrict access to your KV namespace and Cloudflare account, and treat this deployment as a trusted-user tool rather than a public service.
- Users with `allowedit: true` can manage users and locations. There must always be at least one editor; you can't delete or demote yourself out of edit access.
- Sessions are signed HMAC cookies (`sid`), 30-day expiry, one cookie entry per account (multi-account switching is supported via `X-U` / `?u=`).
- Login attempts are rate-limited per Worker instance (5 failures → 1 minute lockout).

---

## Limitations

- **Google Docs / Sheets / Slides** (native Google formats) are hidden by design — they can't be downloaded as raw files, so only folders and binary files are listed.
- **ZIP preview** is capped at 25 MB and doesn't support Zip64 or encrypted entries.
- **Search** requires at least 2 characters and matches file names, up to 5 terms. Large folder trees may fall back to a slower scoped search.
- **R2 usage** is computed by listing objects; large buckets may show an approximate figure.
- **Access-token cache** and **login rate limits** are per-Worker-instance and not globally consistent.
- **No refresh-token rotation** handling — if Google revokes the refresh token, you'll need to update credentials from **Manage → General**.

---

## License

MIT — see [`LICENSE`](LICENSE).

---

## Acknowledgements

- Google Drive API v3
- Cloudflare Workers, KV, and R2
- Tailwind CSS (CDN), Roboto Flex, Material Symbols
- pdf.js (lazy-loaded for PDF previews)
- The DriveFlare icon is embedded as an inline SVG in `src/workers.js`.
