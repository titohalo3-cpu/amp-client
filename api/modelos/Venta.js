const mongoose = require('mongoose');

const ventaSchema = new mongoose.Schema({
  videogameId: { type: String, required: true },
  userId: { type: String, required: true },
  cantidad: { type: Number, required: true },
  precioUnitario: Number,
  total: Number,
  fecha: String,
  estado: String
}, { toJSON: { virtuals: true } });

module.exports = mongoose.model('Venta', ventaSchema);
