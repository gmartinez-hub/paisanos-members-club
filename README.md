# Paisanos Members Club

Web app privada para convertir Paisanos en un sistema de Paisaporte, eventos,
check-in, conexiones y feedback.

## Stack

- Next.js 16 App Router
- React 19
- Tailwind CSS 4
- Supabase Auth + Postgres + Storage
- Vercel
- PostHog, pendiente de key

## Local

```bash
npm install
npm run dev
```

La app corre en [http://localhost:3000](http://localhost:3000).

## Env

Crear `.env.local` desde `.env.example`:

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_POSTHOG_KEY=
NEXT_PUBLIC_POSTHOG_HOST=https://us.i.posthog.com
SUPABASE_SERVICE_ROLE_KEY=
LUMA_API_KEY=
LUMA_WEBHOOK_SECRET=
QA_SEED_PASSWORD=
```

No agregar service role keys al frontend ni usar prefijo `NEXT_PUBLIC_` para secretos.

## Supabase

Proyecto creado:

- Name: `paisanos-members-club`
- Ref: `fdwwedinoxmctekpdcid`
- Region: `sa-east-1`

Migraciones locales principales:

- `supabase/migrations/20260509191500_initial_schema.sql`
- `supabase/migrations/20260509193500_harden_initial_schema.sql`
- `supabase/migrations/20260510115000_event_source_luma_modes.sql`
- `supabase/migrations/20260511103000_luma_sync_and_qa_support.sql`

## Scripts

```bash
npm run lint
npm run build
npm run seed:qa
```

`npm run seed:qa` requiere `SUPABASE_SERVICE_ROLE_KEY` real en `.env.local`.

## Producto

Ver:

- `docs/product-plan.md`
- `docs/visual-direction.md`

## Flujos funcionales

- `/waitlist`: guarda solicitudes reales en `whitelist_requests`.
- `/login`: envia magic link con control de acceso y acepta clave QA/staff.
- `/onboarding`: crea el `profiles` del usuario logueado.
- `/club`: home privada conectada a eventos, perfil, feedback y radar reales.
- `/events`: lista eventos publicados y permite RSVP real.
- `/events/[eventId]`: detalle de evento con asistentes reales.
- `/passport`: identidad del miembro conectada a `profiles`.
- `/directory`: mapa vivo de miembros activos.
- `/admin`: consola protegida por `profiles.is_admin`.
- `/admin/events`: crea eventos reales y deja preparada la sync futura con Luma.
- `/admin/check-in`: marca check-ins reales para RSVP confirmados.

## Bootstrap admin

1. Entrar por `/login`.
2. Completar `/onboarding`.
3. En Supabase SQL Editor, promover el usuario:

```sql
update public.profiles
set is_admin = true
where user_id = (
  select id from auth.users where email = 'tu@email.com'
);
```
