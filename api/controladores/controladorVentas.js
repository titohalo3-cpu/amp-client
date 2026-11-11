const Venta = require('../modelos/Venta');
const siguienteId = require('../modelos/siguienteId');

/** Calcula el total en el servidor: no nos fiamos del que manda el navegador. */
function conTotal(datos) {
  if (datos.cantidad !== undefined && datos.precioUnitario !== undefined) {
    datos.total = Math.round(datos.cantidad * datos.precioUnitario * 100) / 100;
  }
  return datos;
}

async function getVentas(req, res) {
  try {
    // Filtros opcionales: /sales?userId=3 o /sales?estado=pendiente
    const filtro = {};
    if (req.query.userId) filtro.userId = Number(req.query.userId);
    if (req.query.estado) filtro.estado = req.query.estado;
    const ventas = await Venta.find(filtro).sort({ _id: 1 });
    res.status(200).json(ventas);
  } catch (err) {
    console.error('Error en getVentas:', err.message);
    res.status(500).json({ error: 'Error al obtener las ventas' });
  }
}

async function getVenta(req, res) {
  try {
    const venta = await Venta.findById(Number(req.params.id));
    if (!venta) return res.status(404).json({ error: 'Venta no encontrada' });
    res.status(200).json(venta);
  } catch (err) {
    console.error('Error en getVenta:', err.message);
    res.status(500).json({ error: 'Error al obtener la venta' });
  }
}

async function crearVenta(req, res) {
  try {
    const { id, ...datos } = req.body;
    const nueva = new Venta({ ...conTotal(datos), _id: await siguienteId(Venta) });
    await nueva.save();
    res.status(201).json(nueva);
  } catch (err) {
    console.error('Error en crearVenta:', err.message);
    if (err.name === 'ValidationError') return res.status(400).json({ error: err.message });
    res.status(500).json({ error: 'Error al crear la venta' });
  }
}

async function actualizarVenta(req, res) {
  try {
    const { id, ...datos } = req.body;
    const actualizada = await Venta.findByIdAndUpdate(Number(req.params.id), conTotal(datos), {
      new: true,
      runValidators: true,
    });
    if (!actualizada) return res.status(404).json({ error: 'Venta no encontrada' });
    res.status(200).json(actualizada);
  } catch (err) {
    console.error('Error en actualizarVenta:', err.message);
    if (err.name === 'ValidationError') return res.status(400).json({ error: err.message });
    res.status(500).json({ error: 'Error al actualizar la venta' });
  }
}

async function eliminarVenta(req, res) {
  try {
    const eliminada = await Venta.findByIdAndDelete(Number(req.params.id));
    if (!eliminada) return res.status(404).json({ error: 'Venta no encontrada' });
    res.status(200).json({ status: 'operación realizada' });
  } catch (err) {
    console.error('Error en eliminarVenta:', err.message);
    res.status(500).json({ error: 'Error al eliminar la venta' });
  }
}

module.exports = { getVentas, getVenta, crearVenta, actualizarVenta, eliminarVenta };
