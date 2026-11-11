const mongoose = require('mongoose');
const opciones = require('./opciones');

const ventaSchema = new mongoose.Schema(
  {
    _id: Number,
    videogameId: { type: Number, required: true },
    userId: { type: Number, required: true },
    cantidad: { type: Number, required: true, min: 1 },
    precioUnitario: { type: Number, required: true, min: 0 },
    total: { type: Number, required: true, min: 0 },
    fecha: { type: String, required: true }, // 'AAAA-MM-DD'
    estado: { type: String, enum: ['pendiente', 'completada', 'cancelada'], default: 'pendiente' },
  },
  opciones,
);

module.exports = mongoose.model('Venta', ventaSchema, 'ventas');
