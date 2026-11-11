# AmpClient · API (Node.js + Express + MongoDB)

API REST que usa la app Angular. Sigue el patrón **MVC**:

```
api/
├─ app.js            servidor Express: middlewares, rutas y conexión a MongoDB
├─ config.js         puerto y URL de MongoDB
├─ modelos/          esquemas de Mongoose (Videojuego, Venta, Usuario)
├─ controladores/    funciones que reciben la petición, usan el modelo y responden
├─ rutas/            conectan cada URL con su función del controlador
├─ seed.js           carga los datos de ejemplo en MongoDB
└─ docker-compose.yml  MongoDB + mongo-express
```

## Arrancar

```bash
docker compose up -d   # MongoDB (27017) y mongo-express (http://localhost:9017, user123 / pass123)
npm install
npm run seed           # carga ../db.original.json (borra lo que hubiera)
npm start              # API en http://localhost:3000
```

## Endpoints

| Método | URL | Qué hace |
|---|---|---|
| GET | /videogames · /videogames/:id | Lista · uno |
| POST | /videogames | Crear |
| PUT | /videogames/:id | Modificar |
| DELETE | /videogames/:id | Eliminar |
| GET | /sales (?userId= · ?estado=) · /sales/:id | Lista (con filtros) · una |
| POST · PUT · DELETE | /sales · /sales/:id | Crear · modificar · eliminar (el total lo calcula el servidor) |
| GET | /users · /users/:id | Lista · uno (nunca se envía la contraseña) |
| PATCH | /users/:id | Cambiar nombre, rol o contraseña |
| DELETE | /users/:id | Eliminar |
| POST | /auth/login | Comprueba email y contraseña con bcrypt |
| POST | /auth/registro | Crea un cliente (contraseña cifrada) |
| GET | /auth/email-disponible?email= | Lo usa el validador asíncrono del registro |
