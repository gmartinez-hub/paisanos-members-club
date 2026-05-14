# P0 / P1 Status

Actualizado: 2026-05-14.

## P0 - Done en codigo

1. App privada con Auth Supabase, onboarding, perfil activo y admin por `profiles.is_admin`.
2. Home de miembro redisenada como app operativa, no como presentacion.
3. Paisaporte visual con lenguaje boarding pass, MRZ, perforacion y datos reales.
4. Eventos publicados con RSVP/check-in nativo cuando `source = paisanos`.
5. Admin protegido y simplificado para metricas, miembros, eventos, accesos, feedback y check-in.
6. Luma preparado como fuente externa por evento: URL, event id, sync status, snapshots, webhook y accion manual de sync.
7. Login con magic link controlado por backend y opcion email/password para QA/staff.
8. Seed QA reproducible con usuarios admin, miembros, onboarding, eventos nativos y evento Luma simulado.
9. Variables esperadas documentadas para Vercel/local y verificador `npm run verify:p0`.
10. Visual ajustada hacia Paisanos + aviacion: menos British Airways literal, mas herramienta sobria con papel, celeste, lima, rosa, bordes documentales y admin operativo.

## P0 - Bloqueado fuera del codigo

1. Confirmar que el SQL final de P0 quedo aplicado en Supabase.
2. Reemplazar `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` y `SUPABASE_SERVICE_ROLE_KEY` locales por keys validas del proyecto. `npm run verify:p0` hoy marca ambas como placeholders/incompletas.
3. Correr `npm run seed:qa` y validar login por usuario QA.
4. Configurar o validar Supabase Auth URLs y branding de magic link.
5. Pushear el commit local a GitHub para alinear repo, GitHub Desktop y deploys automaticos de Vercel.

## P1 - Siguiente

1. Integrar Luma real: `LUMA_API_KEY`, `LUMA_WEBHOOK_SECRET`, endpoint webhook en Luma y prueba con evento real.
2. Mejorar directorio: filtros utiles, busqueda por intencion, disponibilidad y skills.
3. Completar admin operativo: edicion de eventos, estados, aprobacion de propuestas y detalle de miembro.
4. Feedback loops: formularios/respondientes reales y vista de resultados.
5. PostHog: eventos clave de activacion, RSVP, check-in, directorio y contribuciones.
6. QA visual mobile/desktop con usuarios reales y ajustes finos de densidad.

## P2

1. Matching inteligente por evento.
2. Historial de participacion y actividad sin categorias de miembro.
3. Integraciones externas adicionales: HubSpot/PostHog avanzado.
4. Membresias pagas y beneficios.
5. Paisaporte portable o compartible entre espacios aliados.
