# Seguridad

## Datos y amenazas

Fechas menstruales, notas, señales corporales y exposiciones se consideran sensibles. Riesgos principales: acceso horizontal, importaciones manipuladas, XSS, secretos en cliente, webhooks falsos, eventos repetidos y dispositivos compartidos.

## Controles

- RLS por `auth.uid()` en perfiles, ciclos, registros, exposiciones y lectura de suscripción.
- Sin políticas de escritura de suscripciones ni acceso a `stripe_events` para clientes.
- Secret key de Supabase y secretos Stripe en módulos `server-only`.
- Zod para payloads; límites de longitud y constraints en Postgres.
- React renderiza notas como texto; no se usa `dangerouslySetInnerHTML`.
- Firma Stripe verificada sobre body crudo e idempotencia por event ID.
- Price IDs resueltos por allowlist; customer IDs resueltos en servidor.
- Headers `nosniff`, frame denial, referrer y permissions policy.
- Sin datos de salud en Stripe, URLs o logs de aplicación.

## Reporte responsable

No incluir datos reales en un reporte. Compartir ruta, impacto y pasos reproducibles con datos ficticios al propietario del repositorio. No probar cuentas o infraestructura ajenas.

## Riesgos residuales

`localStorage` es accesible para scripts del mismo origen y extensiones del navegador. La secret key concede acceso privilegiado y debe rotarse si se expone. La disponibilidad depende de Supabase y Stripe. No se afirma cumplimiento regulatorio específico.
