const Venta = require('../modelos/Venta');

async function getVentas(req, res) {
  try {
    const ventas = await Venta.find(req.query); // admite filtros: /ventas?userId=...
    res.status(200).json(ventas);
  } catch (err) {
    console.error("Error en getVentas:", err.message);
    res.status(500).json({"status":"Error al obtener las ventas"});
  }
}

async function getVenta(req, res) {
  try {
    const venta = await Venta.findById(req.params.id);
    if (!venta) return res.status(404).json({"status":"Error venta no encontrada"});
    res.status(200).json(venta);
  } catch (err) {
    console.error("Error en getVenta:", err.message);
    res.status(500).json({"status":"Error al obtener la venta"});
  }
}

async function crearVenta(req, res) {
  try {
    const newVenta = new Venta(req.body);
    await newVenta.save();
    res.status(201).json(newVenta);
  } catch (err) {
    console.error("Error en crearVenta:", err.message);
    res.status(400).json({"status":"Error al crear la venta"});
  }
}

async function actualizarVenta(req, res) {
  try {
    const updatedVenta = await Venta.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true } // Para devolver la venta actualizada
    );
    if (!updatedVenta) return res.status(404).json({"status":"Error venta no encontrada"});
    res.status(200).json(updatedVenta);
  } catch (err) {
    console.error("Error en actualizarVenta:", err.message);
    res.status(400).json({"status":"Error al actualizar la venta"});
  }
}

async function eliminarVenta(req, res) {
  try {
    const deletedVenta = await Venta.findByIdAndDelete(req.params.id);
    if (!deletedVenta) return res.status(404).json({"status":"Error venta no encontrada"});
    res.status(200).json({"status":"operación realizada"});
  } catch (err) {
    console.error("Error en eliminarVenta:", err.message);
    res.status(500).json({"status":"Error al eliminar la venta"});
  }
}

module.exports = { getVentas, getVenta, crearVenta, actualizarVenta, eliminarVenta };
