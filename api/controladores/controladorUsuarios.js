const bcrypt = require('bcryptjs');
const Usuario = require('../modelos/Usuario');

async function getUsuarios(req, res) {
  try {
    const usuarios = await Usuario.find().sort({ _id: 1 }); // toJSON quita la contraseña
    res.status(200).json(usuarios);
  } catch (err) {
    console.error('Error en getUsuarios:', err.message);
    res.status(500).json({ error: 'Error al obtener los usuarios' });
  }
}

async function getUsuario(req, res) {
  try {
    const usuario = await Usuario.findById(Number(req.params.id));
    if (!usuario) return res.status(404).json({ error: 'Usuario no encontrado' });
    res.status(200).json(usuario);
  } catch (err) {
    console.error('Error en getUsuario:', err.message);
    res.status(500).json({ error: 'Error al obtener el usuario' });
  }
}

/** PATCH: solo cambia los campos que llegan (nombre, rol o contraseña). */
async function actualizarUsuario(req, res) {
  try {
    const { id, email, ...datos } = req.body; // el email no se cambia
    if (datos.password) datos.password = await bcrypt.hash(datos.password, 10);
    const actualizado = await Usuario.findByIdAndUpdate(Number(req.params.id), datos, {
      new: true,
      runValidators: true,
    });
    if (!actualizado) return res.status(404).json({ error: 'Usuario no encontrado' });
    res.status(200).json(actualizado);
  } catch (err) {
    console.error('Error en actualizarUsuario:', err.message);
    if (err.name === 'ValidationError') return res.status(400).json({ error: err.message });
    res.status(500).json({ error: 'Error al actualizar el usuario' });
  }
}

async function eliminarUsuario(req, res) {
  try {
    const eliminado = await Usuario.findByIdAndDelete(Number(req.params.id));
    if (!eliminado) return res.status(404).json({ error: 'Usuario no encontrado' });
    res.status(200).json({ status: 'operación realizada' });
  } catch (err) {
    console.error('Error en eliminarUsuario:', err.message);
    res.status(500).json({ error: 'Error al eliminar el usuario' });
  }
}

module.exports = { getUsuarios, getUsuario, actualizarUsuario, eliminarUsuario };
