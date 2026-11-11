const mongoose = require('mongoose');
const opciones = require('./opciones');

const videojuegoSchema = new mongoose.Schema(
  {
    _id: Number,
    titulo: { type: String, required: true, trim: true, minlength: 2 },
    genero: { type: String, required: true },
    plataformas: { type: [String], default: [] },
    precio: { type: Number, required: true, min: 0.01 },
    oferta: { type: Number, default: 0, min: 0, max: 90 },
    valoracion: { type: Number, default: 0, min: 0, max: 5 },
    imagen: { type: String, default: 'img/generica.svg' },
    fechaLanzamiento: String, // 'AAAA-MM-DD'
    descripcion: { type: String, maxlength: 300, default: '' },
    stock: { type: Number, default: 0, min: 0 },
  },
  opciones,
);

// La colección en MongoDB se llamará "videojuegos"
module.exports = mongoose.model('Videojuego', videojuegoSchema, 'videojuegos');
