// Carga los datos de ejemplo (../db.original.json) en MongoDB. Uso: npm run seed
const mongoose = require('mongoose');
const datos = require('../db.original.json');
const Videojuego = require('./modelos/Videojuego');
const Venta = require('./modelos/Venta');
const Usuario = require('./modelos/Usuario');

async function cargar() {
  await mongoose.connect('mongodb://root:example@localhost:27017/2daw?authSource=admin');
  await Videojuego.deleteMany();
  await Venta.deleteMany();
  await Usuario.deleteMany();

  // MongoDB crea un _id nuevo para cada documento; las ventas apuntan a esos _id nuevos
  const nuevoId = {};
  for (const { id, ...juego } of datos.videojuegos) nuevoId['v' + id] = (await new Videojuego(juego).save()).id;
  for (const { id, ...usuario } of datos.usuarios) nuevoId['u' + id] = (await new Usuario(usuario).save()).id;
  for (const { id, ...venta } of datos.ventas) {
    await new Venta({ ...venta, videogameId: nuevoId['v' + venta.videogameId], userId: nuevoId['u' + venta.userId] }).save();
  }

  console.log('Datos cargados en MongoDB');
  await mongoose.disconnect();
}

cargar();
