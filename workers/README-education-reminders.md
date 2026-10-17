# Education timelines and reminders

The public timeline uses each education record's existing `startDate`, `endDate`, and `educationStatus`. The additive optional `endDatePrecision` field is `estimated` (the default for existing records) or `exact`. No migration or Firestore rule change is required. The dashboard writes this field only when the owner saves an entry. No ImageKit media is needed.

Dates can be `2027`, `Sep 2027`, `September/2027`, `2027-09`, or `2027-09-15`. Exact targets require a valid `YYYY-MM-DD`. Calendar boundaries use Asia/Karachi. The bar reports elapsed planned time, not coursework attainment. At 100%, the entry remains in progress until the owner confirms completion. Missing/invalid ranges show an honest status without a fabricated percentage.

## Worker addition

`cloudflare-worker.js` remains the existing **contact Discord proxy**, with its original HTTP handler unchanged. The optional `workers/contact-with-reminders.js` entry point reuses that exact fetch handler and adds the scheduled handler from `education-reminders.js`. Ordinary site deployment does not switch Worker entry points or activate a schedule. The scheduled job uses the same `DISCORD_WEBHOOK_URL` secret directly, so it is independent of a visitor's contact-form cooldown. `cloudflare_worker.js` (the AI proxy) is unrelated and unchanged.

The daily job reads visible certificates through the Firestore REST API using the existing public configuration and visibility filter. It selects only education fields. It sends a reminder only for a public, in-progress education entry explicitly set to an exact date whose valid timeline has ended. Completed, hidden, estimated, undated, future, and invalid entries do not send reminders. No Firebase write is made by this job.

Successful deliveries are recorded in an `EDUCATION_REMINDERS` KV namespace using a hash of the document identity and target date. A later run skips the same delivered target; extending the date creates a new reminder target. Failed deliveries remain retryable on the next daily run. KV is eventually consistent: overlapping runs or a failure after Discord accepts a message but before KV records it can duplicate a notification. This is a once-per-target reminder under normal daily scheduling, not a transactional exactly-once delivery guarantee.

## Activation on the existing contact Worker

The local source and example configuration are prepared; the production Worker has **not** been deployed or changed. Wrangler is installed but was not authenticated when checked on 2026-10-15.

1. Authenticate Wrangler with the owner's Cloudflare account, or use the existing Worker's dashboard. Keep its existing name, routes, bindings, and `DISCORD_WEBHOOK_URL` secret.
2. Create a KV namespace for the reminder ledger and bind it as `EDUCATION_REMINDERS`.
3. Set `FIREBASE_PROJECT_ID` and `FIREBASE_API_KEY` to the same public client configuration used by the portfolio. The existing public Firestore rules remain the authorization boundary. If this public key has browser-only restrictions, use a separate appropriately restricted Firestore API key for this job; do not relax those restrictions or expose an admin credential.
4. Optionally set `DISCORD_USER_ID` to the numeric Discord account ID. The supplied `felix_913` is a username and cannot create a real mention. In Discord, enable Developer Mode, then use Copy User ID. Without this setting, the reminder posts to the existing channel with no @mention.
5. Explicitly switch the existing Worker’s configured entry point to `workers/contact-with-reminders.js`, then bundle/deploy it with Wrangler and enable `0 4 * * *` (09:00 Karachi daily). Merge the relevant settings from `contact-reminders.wrangler.example.jsonc`; replace its placeholders rather than deploying its example Worker name. The imported TypeScript date helper is bundled automatically by Wrangler.
6. In the dashboard, choose Education → In progress → Exact target, set a valid date after the start, and save the public entry. Extend that date if needed, or explicitly mark it Completed when verified.

The GitHub Pages workflow builds only the static site. It does not deploy either Worker or activate reminders. See `docs/DEPLOYMENT.md` for the separate site release procedure. No real Discord notification, login, live Firestore edit, KV creation, or Worker deployment was performed during development. Automated reminder tests use fake transport and in-memory KV.

References: [Cloudflare scheduled handlers](https://developers.cloudflare.com/workers/runtime-apis/handlers/scheduled/), [Cron Triggers](https://developers.cloudflare.com/workers/configuration/cron-triggers/), [Firestore REST authorization](https://firebase.google.com/docs/firestore/use-rest-api).
