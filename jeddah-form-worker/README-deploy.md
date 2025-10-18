Deployment and configuration

This worker handles contact form submissions and sends emails via Resend (https://resend.com).

Prerequisites
- Node.js and npm installed
- Wrangler installed globally (recommended): npm i -g wrangler
- A Cloudflare account and a Workers service
- A Resend API key (from https://resend.com)

Setup
1. Add the Resend API key as a Cloudflare secret for the worker (recommended):

   # From PowerShell (run in the `jeddah-form-worker` folder)
   wrangler secret put RESEND_API_KEY

   When prompted, paste your Resend API key (starts with `re_...`).

2. (Optional) You can set FROM_EMAIL in `wrangler.toml`/`wrangler.jsonc` vars or as an environment variable. The project already sets a default FROM_EMAIL in `wrangler.jsonc` vars.

Deploy
- To deploy to Cloudflare:

  wrangler deploy

- To develop locally with the worker bound to a local URL:

  wrangler dev

Notes and security
- Store the Resend key as a Cloudflare secret (do not commit keys to source control).
- Ensure your worker's route (if using custom domain routing) is correctly configured in the Cloudflare dashboard or wrangler configuration.
- The worker expects the contact form to POST to `/submit-form` on the same origin. The `public/contact.html` form action was changed accordingly.

Troubleshooting
- If emails are failing, check that `RESEND_API_KEY` exists and has valid permissions. Check the worker logs with `wrangler tail` while reproducing the submission.
- If CORS errors occur from other origins, adjust the `Access-Control-Allow-Origin` header handling in `src/index.js`.
