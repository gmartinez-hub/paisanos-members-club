# P0 Backend Setup

Checklist corto para dejar el backend P0 listo en produccion y local.

## 1. Apply Supabase SQL

Open Supabase Dashboard, then:

1. Go to `SQL Editor`.
2. Create a new query.
3. Paste the full contents of `docs/setup/apply-p0-backend.sql`.
4. Click `Run`.

This applies:

- approved/invited-only Paisaporte activation
- profile admin self-promotion protection
- stricter waitlist and contribution policies
- RSVP capacity and Luma registration rules
- check-in rules requiring a confirmed RSVP
- Luma guest snapshots and webhook event storage
- profile email mapping for access control
- QA defaults without the old community copy

## 2. Configure Supabase Auth URLs

Open Supabase Dashboard, then:

1. Go to `Authentication`.
2. Go to `URL Configuration`.
3. Set `Site URL` to:

```txt
https://paisanos-members-club.vercel.app
```

4. Add these redirect URLs:

```txt
https://paisanos-members-club.vercel.app/auth/callback
http://localhost:3000/auth/callback
```

## 3. Add Server Secrets

Open Supabase Dashboard, then:

1. Go to `Project Settings`.
2. Go to `API`.
3. Copy the `service_role` key. Do not use a Supabase Account Access Token (`sbp_...`) here.
4. Do not paste it in chat or commit it.

Open Vercel Dashboard, then:

1. Go to `paisanos-members-club`.
2. Go to `Settings`.
3. Go to `Environment Variables`.
4. Add these when available:

```txt
SUPABASE_SERVICE_ROLE_KEY
LUMA_API_KEY
LUMA_WEBHOOK_SECRET
```

5. Enable them for `Production`, `Preview`, and `Development`.

Only `SUPABASE_SERVICE_ROLE_KEY` is required for P0. Luma can stay empty until we connect the real Luma calendar.

For local QA, add the same server-only values to `.env.local`:

```txt
SUPABASE_SERVICE_ROLE_KEY=...
QA_SEED_PASSWORD=PaisanosQA2026!
```

## 4. Configure Magic Link Branding

Open Supabase Dashboard, then:

1. Go to `Authentication`.
2. Go to `Email Templates`.
3. Open `Magic Link`.
4. Add Paisanos branding and a clear CTA.

Keep the link variable intact, usually:

```txt
{{ .ConfirmationURL }}
```

## 5. Seed QA Users

After the SQL is applied and `SUPABASE_SERVICE_ROLE_KEY` exists locally:

```bash
npm run seed:qa
```

This creates:

- `admin.qa@paisanos.io`
- `member.qa@paisanos.io`
- `builder.qa@paisanos.io`
- `onboarding.qa@paisanos.io`

The password is `QA_SEED_PASSWORD` or `PaisanosQA2026!` by default.
