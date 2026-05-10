# P0 Backend Setup

This is the short setup checklist for the production backend.

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

## 3. Add Vercel Service Role Secret

Open Supabase Dashboard, then:

1. Go to `Project Settings`.
2. Go to `API`.
3. Copy the `service_role` key. Do not paste it in chat or commit it.

Open Vercel Dashboard, then:

1. Go to `paisanos-members-club`.
2. Go to `Settings`.
3. Go to `Environment Variables`.
4. Add:

```txt
SUPABASE_SERVICE_ROLE_KEY
```

5. Paste the copied `service_role` value.
6. Enable it for `Production`, `Preview`, and `Development`.

After this is done, the app can move magic-link sending into a server action that checks access before sending the email.

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

## 5. Tell Codex To Continue

Once steps 1 to 3 are complete, ask Codex to:

```txt
cerrar el magic link desde backend usando SUPABASE_SERVICE_ROLE_KEY
```

Then Codex should implement:

- login server action
- access check before sending magic link
- `shouldCreateUser: false` or invite/create policy depending on the chosen Supabase Auth flow
- production deploy
