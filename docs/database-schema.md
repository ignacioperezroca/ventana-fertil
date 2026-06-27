# Esquema de base

- `profiles`: preferencias de cuenta y estado de migración.
- `cycles`: ciclo y señales generales; índice único para un ciclo activo por usuario.
- `daily_logs`: un registro por usuario y fecha.
- `exposures`: fechas relevantes asociadas opcionalmente a un ciclo.
- `subscriptions`: espejo mínimo de Stripe, escribible solo por servidor.
- `stripe_events`: event IDs y resultado técnico para idempotencia, sin payload completo.

Todas las tablas tienen constraints, timestamps e índices de acceso por usuario/fecha. Las relaciones a `auth.users` usan cascade para evitar datos huérfanos. Logs y exposiciones asociados a un ciclo se eliminan con ese ciclo.
