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
11. Supabase local validado con Admin API y seed QA aplicado.
12. Vercel Production/Development sincronizado con variables P0 y redeploy de produccion listo.
13. QR check-in admin implementado con scanner por camara y fallback manual.
14. Credenciales PostHog cargadas en local y Vercel Production/Development; falta instrumentar eventos.
15. Admin Personas evolucionado a Signal Graph v0: miembros, invitados/solicitudes, prospectos, tags internos y notas internas.
16. Ficha interna de persona en admin con contexto, tags, notas, eventos asociados, propuestas y follow-up por mail.

## P0 - Bloqueado fuera del codigo

1. Confirmar que el SQL final de P0 quedo aplicado en Supabase.
2. Aplicar `docs/setup/apply-signal-graph-v0.sql` en Supabase para activar prospectos/tags/notas admin en produccion.
3. Configurar o validar Supabase Auth URLs y branding de magic link.
4. Autenticar GitHub CLI con `gh auth login` y `gh auth setup-git` para que Codex pueda pushear sin GitHub Desktop.
5. Vercel Preview conserva variables antiguas para algunas keys; Production y Development ya quedaron sincronizados. Preview puede esperar si trabajamos directo en `main`.
6. Probar QR scanner en dispositivo real con camara y permiso HTTPS.

## P1 - Siguiente

1. Integrar Luma real: `LUMA_API_KEY`, `LUMA_WEBHOOK_SECRET`, endpoint webhook en Luma y prueba con evento real.
2. Mejorar directorio: filtros utiles, busqueda por intencion, disponibilidad y skills.
3. Completar admin operativo: edicion de eventos, estados, aprobacion de propuestas y conversion invitado/prospecto a miembro.
4. Feedback loops: formularios/respondientes reales y vista de resultados.
5. PostHog: instrumentar eventos clave de activacion, RSVP, check-in, directorio y contribuciones.
6. QA visual mobile/desktop con usuarios reales y ajustes finos de densidad.

## P2

1. Matching inteligente por evento.
2. Historial de participacion y actividad sin categorias de miembro.
3. Integraciones externas adicionales: HubSpot/PostHog avanzado.
4. Membresias pagas y beneficios.
5. Paisaporte portable o compartible entre espacios aliados.
