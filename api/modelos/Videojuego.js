const mongoose = require('mongoose');

const videojuegoSchema = new mongoose.Schema({
  titulo: { type: String, required: true },
  genero: { type: String, required: true },
  plataformas: [String],
  precio: { type: Number, required: true },
  oferta: Number,
  valoracion: Number,
  imagen: String,
  fechaLanzamiento: String,
  descripcion: String,
  stock: Number
}, { toJSON: { virtuals: true } }); // añade "id" (el _id como texto), que es lo que usa Angular

module.exports = mongoose.model('Videojuego', videojuegoSchema);
