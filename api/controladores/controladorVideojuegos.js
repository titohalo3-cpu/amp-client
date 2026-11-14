const Videojuego = require('../modelos/Videojuego');

async function getVideojuegos(req, res) {
  try {
    const videojuegos = await Videojuego.find();
    res.status(200).json(videojuegos);
  } catch (err) {
    console.error("Error en getVideojuegos:", err.message);
    res.status(500).json({"status":"Error al obtener los videojuegos"});
  }
}

async function getVideojuego(req, res) {
  try {
    const videojuego = await Videojuego.findById(req.params.id);
    if (!videojuego) return res.status(404).json({"status":"Error videojuego no encontrado"});
    res.status(200).json(videojuego);
  } catch (err) {
    console.error("Error en getVideojuego:", err.message);
    res.status(500).json({"status":"Error al obtener el videojuego"});
  }
}

async function crearVideojuego(req, res) {
  try {
    const newVideojuego = new Videojuego(req.body);
    await newVideojuego.save();
    res.status(201).json(newVideojuego);
  } catch (err) {
    console.error("Error en crearVideojuego:", err.message);
    res.status(400).json({"status":"Error al crear el videojuego"});
  }
}

async function actualizarVideojuego(req, res) {
  try {
    const updatedVideojuego = await Videojuego.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true } // Para devolver el videojuego actualizado
    );
    if (!updatedVideojuego) return res.status(404).json({"status":"Error videojuego no encontrado"});
    res.status(200).json(updatedVideojuego);
  } catch (err) {
    console.error("Error en actualizarVideojuego:", err.message);
    res.status(400).json({"status":"Error al actualizar el videojuego"});
  }
}

async function eliminarVideojuego(req, res) {
  try {
    const deletedVideojuego = await Videojuego.findByIdAndDelete(req.params.id);
    if (!deletedVideojuego) return res.status(404).json({"status":"Error videojuego no encontrado"});
    res.status(200).json({"status":"operación realizada"});
  } catch (err) {
    console.error("Error en eliminarVideojuego:", err.message);
    res.status(500).json({"status":"Error al eliminar el videojuego"});
  }
}

module.exports = { getVideojuegos, getVideojuego, crearVideojuego, actualizarVideojuego, eliminarVideojuego };
