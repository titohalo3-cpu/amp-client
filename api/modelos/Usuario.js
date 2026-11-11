const mongoose = require('mongoose');
const opciones = require('./opciones');

const usuarioSchema = new mongoose.Schema(
  {
    _id: Number,
    nombre: { type: String, required: true, trim: true, minlength: 3 },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true }, // guardada cifrada con bcrypt
    rol: { type: String, enum: ['admin', 'trabajador', 'cliente'], default: 'cliente' },
  },
  opciones,
);

module.exports = mongoose.model('Usuario', usuarioSchema, 'usuarios');
