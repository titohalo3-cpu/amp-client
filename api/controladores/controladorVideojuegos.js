const Videojuego = require('../modelos/Videojuego');
const siguienteId = require('../modelos/siguienteId');

async function getVideojuegos(req, res) {
  try {
    const videojuegos = await Videojuego.find().sort({ _id: 1 });
    res.status(200).json(videojuegos);
  } catch (err) {
    console.error('Error en getVideojuegos:', err.message);
    res.status(500).json({ error: 'Error al obtener los videojuegos' });
  }
}

async function getVideojuego(req, res) {
  try {
    const videojuego = await Videojuego.findById(Number(req.params.id));
    if (!videojuego) return res.status(404).json({ error: 'Videojuego no encontrado' });
    res.status(200).json(videojuego);
  } catch (err) {
    console.error('Error en getVideojuego:', err.message);
    res.status(500).json({ error: 'Error al obtener el videojuego' });
  }
}

async function crearVideojuego(req, res) {
  try {
    const { id, ...datos } = req.body; // el id lo pone el servidor
    const nuevo = new Videojuego({ ...datos, _id: await siguienteId(Videojuego) });
    await nuevo.save(); // aquí Mongoose comprueba las reglas del esquema
    res.status(201).json(nuevo);
  } catch (err) {
    console.error('Error en crearVideojuego:', err.message);
    if (err.name === 'ValidationError') return res.status(400).json({ error: err.message });
    res.status(500).json({ error: 'Error al crear el videojuego' });
  }
}

async function actualizarVideojuego(req, res) {
  try {
    const { id, ...datos } = req.body;
    const actualizado = await Videojuego.findByIdAndUpdate(Number(req.params.id), datos, {
      new: true, // devuelve el videojuego ya modificado
      runValidators: true, // aplica también las reglas del esquema
    });
    if (!actualizado) return res.status(404).json({ error: 'Videojuego no encontrado' });
    res.status(200).json(actualizado);
  } catch (err) {
    console.error('Error en actualizarVideojuego:', err.message);
    if (err.name === 'ValidationError') return res.status(400).json({ error: err.message });
    res.status(500).json({ error: 'Error al actualizar el videojuego' });
  }
}

async function eliminarVideojuego(req, res) {
  try {
    const eliminado = await Videojuego.findByIdAndDelete(Number(req.params.id));
    if (!eliminado) return res.status(404).json({ error: 'Videojuego no encontrado' });
    res.status(200).json({ status: 'operación realizada' });
  } catch (err) {
    console.error('Error en eliminarVideojuego:', err.message);
    res.status(500).json({ error: 'Error al eliminar el videojuego' });
  }
}

module.exports = { getVideojuegos, getVideojuego, crearVideojuego, actualizarVideojuego, eliminarVideojuego };
