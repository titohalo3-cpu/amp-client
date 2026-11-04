# AmpClient

Tienda de videojuegos en Angular 22 (proyecto de 2.º DAW, Desarrollo Web en Entorno Cliente).

## Arrancar

```bash
npm install
npm run api      # json-server en http://localhost:3000 (terminal 1)
npm start        # Angular en http://localhost:4200 (terminal 2)
npm test         # pruebas con Karma + Jasmine
npm run api:reset  # deja db.json como al principio
```

Cuentas de prueba: admin@amp.es / admin123 · laura@amp.es / trabajo1 (trabajador) · mario@amp.es / cliente1 (cliente).

Versión online (modo demo, sin json-server): https://titohalo3-cpu.github.io/amp-client/

Se publica sola en GitHub Pages con cada push a `main` (`.github/workflows/pages.yml`).
