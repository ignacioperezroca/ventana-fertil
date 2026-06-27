# Privacidad

## Qué se guarda

Invitado: snapshot en el navegador. Cuenta: perfil, ciclos, registros diarios, exposiciones y estado técnico de suscripción en Supabase. Stripe recibe email, identificador interno de usuario y datos de facturación; no recibe información del ciclo.

## Decisiones

- Migración local solo con confirmación explícita.
- El backup local se conserva después de sincronizar.
- No hay trackers de terceros en pantallas autenticadas.
- No se registran payloads clínicos, tokens ni snapshots en logs.
- La exportación requiere sesión y se entrega con `private, no-store`.
- El borrado cancela una suscripción activa y elimina Auth; las FK eliminan datos asociados.

## Limitaciones

Un navegador, dispositivo o perfil compartido puede exponer datos locales. El borrado de cuenta no controla copias exportadas por la persona ni registros contables que Stripe deba conservar. Antes de sumar analytics o monitoreo, deben definirse filtros que excluyan cuerpos, fechas y breadcrumbs sensibles.
