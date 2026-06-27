# Verificación de RLS

Ejecutar en una base descartable con las migraciones aplicadas:

1. Crear dos usuarios de prueba A y B.
2. Autenticar como A e insertar un ciclo, un registro y una exposición con el UID de A.
3. Confirmar que A puede leer, actualizar y borrar sus filas.
4. Autenticar como B y confirmar que los `select` devuelven cero filas de A.
5. Intentar insertar o actualizar usando el UID de A y confirmar error RLS.
6. Confirmar que B ve únicamente su fila de `subscriptions`.
7. Confirmar que ningún usuario autenticado puede insertar/actualizar `subscriptions` ni leer `stripe_events`.
8. Repetir como `anon` y confirmar cero acceso a las tablas privadas.

`supabase/tests/rls.sql` automatiza estas aserciones cuando se usa el test helper pgTAP de Supabase. Nunca ejecutar estas pruebas sobre producción.
