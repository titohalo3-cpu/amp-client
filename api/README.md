# AmpClient · API (Node.js + Express + MongoDB)

Misma estructura que la API de clase: `app.js`, `modelos/`, `rutas/` y `controladores/`.

```bash
docker compose up -d   # MongoDB y mongo-express (http://localhost:9017, user123 / pass123)
npm install
npm run seed           # carga ../db.original.json en MongoDB
npm start              # http://localhost:3000
```

| Método | URL | Controlador |
|---|---|---|
| GET · POST | /videojuegos | getVideojuegos · crearVideojuego |
| GET · PUT · DELETE | /videojuegos/:id | getVideojuego · actualizarVideojuego · eliminarVideojuego |
| GET · POST | /ventas | getVentas · crearVenta |
| GET · PUT · DELETE | /ventas/:id | getVenta · actualizarVenta · eliminarVenta |
| POST | /usuarios/login · /usuarios/registro | login · crearUsuario |
| GET | /usuarios (?email=) | getUsuarios |
| PUT · DELETE | /usuarios/:id | actualizarUsuario · eliminarUsuario |
