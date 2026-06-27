# Arquitectura

## Flujo de datos

El visitante usa el motor puro de `src/lib/cycle.ts` y persiste en `localStorage`. Una cuenta se valida con `supabase.auth.getUser()` en servidor. Los Route Handlers derivan siempre `user_id` de esa sesión y usan validación Zod; nunca aceptan un ID de usuario del navegador.

La capa de sync convierte el snapshot local a un contrato acotado. Supabase Postgres guarda ciclos, registros y exposiciones. RLS protege el acceso directo y el secret key queda reservado a Route Handlers. Las respuestas privadas usan `no-store` y `/account` es dinámica y `noindex`.

## Billing y entitlements

```text
Cuenta autenticada -> POST checkout -> Stripe Checkout
Stripe -> webhook firmado -> stripe_events (idempotencia)
                         -> subscriptions (fuente de verdad)
Servidor -> getUserEntitlements(userId) -> límites/funciones Premium
```

Estados `active` y `trialing` habilitan Premium. `past_due`, `unpaid`, `incomplete`, `incomplete_expired`, `paused`, `canceled` y ausencia de suscripción mantienen plan gratuito. Esta decisión evita sostener acceso indefinido ante cobros fallidos. Cambiarla exige modificar y probar una sola política.

## Límites de responsabilidad

- `src/lib/supabase`: clientes browser, server y admin.
- `src/services/cloud-data.ts`: operaciones tipadas de persistencia.
- `src/lib/validation`: contratos de entrada.
- `src/lib/stripe`: SDK server-only, allowlist y sincronización.
- `src/lib/entitlements.ts`: consulta server-side.
- `src/components/sync`: migración y sincronización del navegador.

El motor educativo existente no depende de Supabase ni Stripe.
