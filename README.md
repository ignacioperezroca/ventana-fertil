# 🥚 Ventana Fértil

Aplicación educativa y local-first para explorar una ventana fértil estimada, variabilidad del ciclo, registros diarios y recordatorios. Las estimaciones pueden variar: no constituyen diagnóstico ni deben usarse como anticoncepción.

## Arquitectura

- Next.js 16 App Router y React 19 en Vercel.
- Invitados: estado `ventana-fertil:v1` en el navegador.
- Cuentas: Supabase Auth SSR con sesión en cookies, Postgres y RLS.
- Facturación: Stripe Checkout y Customer Portal.
- Entitlements: el webhook verificado escribe `subscriptions`; el servidor lee esa tabla. El redirect de Checkout nunca concede Premium.

Ver [ARCHITECTURE.md](./ARCHITECTURE.md), [SECURITY.md](./SECURITY.md) y [PRIVACY.md](./PRIVACY.md).

## Desarrollo local

```bash
npm install
cp .env.example .env.local
npm run dev
```

La calculadora invitada funciona sin servicios externos. Auth, sync y billing requieren las variables de `.env.example`.

## Supabase

1. Crear un proyecto y guardar URL, publishable key y secret key.
2. Vincular el CLI: `supabase link --project-ref <ref>`.
3. Aplicar migraciones: `supabase db push`.
4. Generar tipos: `npm run db:types` (con Supabase local) o `supabase gen types typescript --project-id <ref> --schema public > src/types/database.ts`.
5. En Auth > URL Configuration, configurar `http://localhost:3000/auth/callback` y `https://ventana-fertil.vercel.app/auth/callback` como redirects permitidos.
6. Mantener confirmación por email habilitada en producción.

Las migraciones viven en `supabase/migrations`. El procedimiento RLS está en `supabase/tests/rls.sql`; debe ejecutarse en una base descartable con el test helper oficial.

## Stripe

1. Crear el producto “Ventana Fértil Premium”.
2. Crear precios recurrentes mensual y, opcionalmente, anual.
3. Activar Customer Portal y permitir cancelación/cambio de medio de pago.
4. Configurar el endpoint `https://ventana-fertil.vercel.app/api/stripe/webhook`.
5. Seleccionar `checkout.session.completed`, `customer.subscription.created`, `customer.subscription.updated`, `customer.subscription.deleted`, `invoice.paid` e `invoice.payment_failed`.
6. Guardar el signing secret como `STRIPE_WEBHOOK_SECRET`.

Prueba local:

```bash
stripe listen --forward-to localhost:3000/api/stripe/webhook
stripe trigger checkout.session.completed
```

Usar modo test hasta validar alta, renovación, pago fallido y cancelación. Nunca poner fechas o datos de salud en metadata de Stripe.

## Vercel

Definir todas las variables de `.env.example` por ambiente. En Preview usar proyectos/keys test; en Production usar las credenciales productivas. `NEXT_PUBLIC_APP_URL` debe coincidir con el dominio de cada ambiente. Agregar los redirects de previews necesarios en Supabase.

## Comandos

```bash
npm run lint
npm run typecheck
npm test
npm run build
```

## Migración local

Al iniciar sesión, la app detecta `ventana-fertil:v1`, muestra un resumen y pide confirmación. Si hay datos en nube y locales, la persona elige cuál conservar. El respaldo local no se elimina automáticamente. La marca `profiles.local_data_migrated_at` evita migraciones repetidas.

## Límites y Premium

Los límites gratuitos están centralizados en `src/lib/limits.ts`: un ciclo activo, 30 registros diarios y 10 exposiciones en nube. `active` y `trialing` habilitan Premium; el resto de estados no. La política completa está en `src/lib/entitlement-policy.ts`.

## QA manual

- Completar la calculadora como invitado y refrescar.
- Crear cuenta, confirmar email e iniciar sesión.
- Migrar datos locales y verificar que el backup siga presente.
- Verificar acceso cruzado entre dos usuarios con el test RLS.
- Alcanzar límites gratuitos y confirmar que el servidor recorta escrituras excedentes.
- Iniciar Checkout mensual/anual en test mode.
- Confirmar que Premium aparece solo después del webhook.
- Probar Portal, cancelación y pago fallido.
- Exportar datos Premium y eliminar cuenta con confirmación `ELIMINAR`.
- Navegar por teclado, revisar foco visible y modo de movimiento reducido.

## Solución de problemas

- `Supabase no está configurado`: revisar las dos variables `NEXT_PUBLIC_SUPABASE_*`.
- Checkout no abre: verificar price IDs y `NEXT_PUBLIC_APP_URL`.
- Premium no aparece: revisar la entrega del webhook, firma y fila en `stripe_events`.
- Auth vuelve a login: comprobar redirect URLs y cookies del dominio actual.
