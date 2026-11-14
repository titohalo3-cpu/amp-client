# AmpClient

Tienda de videojuegos en Angular 22 con una API REST en Node.js + Express + MongoDB (proyecto de 2.º DAW, Desarrollo Web en Entorno Cliente).

```
amp-client/
├─ src/       app Angular (componentes, servicios, formularios reactivos)
├─ api/       API Express con patrón MVC (modelos, controladores, rutas) → ver api/README.md
└─ db.original.json   datos de ejemplo (se cargan en MongoDB con npm run api:seed)
```

## Arrancar

```bash
npm install                 # la primera vez (Angular)
npm --prefix api install    # la primera vez (Express)

npm run db         # MongoDB + mongo-express con Docker (http://localhost:9017, user123 / pass123)
npm run api:seed   # carga los datos de ejemplo en MongoDB (los reinicia)
npm run api        # API Express en http://localhost:3000   (terminal 1)
npm start          # Angular en http://localhost:4200       (terminal 2)
npm test           # pruebas con Karma + Jasmine
```

Cuentas de prueba: admin@amp.es / admin123 · laura@amp.es / trabajo1 (trabajador) · mario@amp.es / cliente1 (cliente).

Versión online (modo demo: sin servidor, un interceptor simula la API en el navegador): https://titohalo3-cpu.github.io/amp-client/

Se publica sola en GitHub Pages con cada push a `main` (`.github/workflows/pages.yml`).
