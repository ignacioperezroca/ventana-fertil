# Auditoría de dependencias

Fecha: 2026-06-27.

`npm audit --omit=dev` informa dos hallazgos moderados por `postcss < 8.5.10` incluido dentro de Next.js 16.2.6. La corrección sugerida por npm usa `--force` y reemplaza Next por 9.3.3, un downgrade incompatible y no seguro para esta aplicación. No se aplicó.

Acción: monitorear una versión estable de Next que actualice su dependencia embebida, probarla en una rama y repetir lint, tipos, tests, E2E y build. No hay vulnerabilidades críticas reportadas y no se usó `npm audit fix --force`.
