/**
 * Carga los datos de ejemplo (../db.original.json) en MongoDB.
 * Borra lo que haya y vuelve a insertar. Las contraseñas se guardan cifradas.
 * Uso: npm run seed
 */
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const config = require('./config');
const datos = require('../db.original.json');
const Videojuego = require('./modelos/Videojuego');
const Venta = require('./modelos/Venta');
const Usuario = require('./modelos/Usuario');

const conIdDeMongo = (lista) => lista.map(({ id, ...resto }) => ({ _id: id, ...resto }));

async function cargar() {
  await mongoose.connect(config.MONGO_URI);

  const usuarios = await Promise.all(
    conIdDeMongo(datos.users).map(async (u) => ({ ...u, password: await bcrypt.hash(u.password, 10) })),
  );

  await Promise.all([Videojuego.deleteMany(), Venta.deleteMany(), Usuario.deleteMany()]);
  await Videojuego.insertMany(conIdDeMongo(datos.videogames));
  await Venta.insertMany(conIdDeMongo(datos.sales));
  await Usuario.insertMany(usuarios);

  console.log(`Cargados ${datos.videogames.length} videojuegos, ${datos.sales.length} ventas y ${usuarios.length} usuarios`);
  await mongoose.disconnect();
}

cargar().catch((err) => {
  console.error('Error al cargar los datos. ¿Está MongoDB arrancado (docker compose up -d)?', err.message);
  process.exit(1);
});
