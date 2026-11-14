const Usuario = require('../modelos/Usuario');

async function crearUsuario(req, res) {
  try {
    const newUsuario = new Usuario({ ...req.body, rol: 'cliente' }); // quien se registra siempre es cliente
    await newUsuario.save();
    res.status(201).json({"status":"usuario creado"});
  } catch (err) {
    console.error("Error en crearUsuario:", err.message);
    res.status(400).json({"status":"Error al crear el usuario"});
  }
}

async function login(req, res) {
  try {
    const usuario = await Usuario.findOne(
      {"email":req.body.email, "password":req.body.password}
    ).select('-password'); // nunca se devuelve la contraseña
    if (!usuario) return res.status(401).json({"status":"Usuario/clave invalida"});
    res.status(200).json(usuario);
  } catch (err) {
    console.error("Error en login:", err.message);
    res.status(400).json({"status":"Error al iniciar sesión"});
  }
}

async function getUsuarios(req, res) {
  try {
    const usuarios = await Usuario.find(req.query).select('-password'); // admite /usuarios?email=...
    res.status(200).json(usuarios);
  } catch (err) {
    console.error("Error en getUsuarios:", err.message);
    res.status(500).json({"status":"Error al obtener los usuarios"});
  }
}

async function actualizarUsuario(req, res) {
  try {
    const updatedUsuario = await Usuario.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    ).select('-password');
    if (!updatedUsuario) return res.status(404).json({"status":"Error usuario no encontrado"});
    res.status(200).json(updatedUsuario);
  } catch (err) {
    console.error("Error en actualizarUsuario:", err.message);
    res.status(400).json({"status":"Error al actualizar el usuario"});
  }
}

async function eliminarUsuario(req, res) {
  try {
    const deletedUsuario = await Usuario.findByIdAndDelete(req.params.id);
    if (!deletedUsuario) return res.status(404).json({"status":"Error usuario no encontrado"});
    res.status(200).json({"status":"operación realizada"});
  } catch (err) {
    console.error("Error en eliminarUsuario:", err.message);
    res.status(500).json({"status":"Error al eliminar el usuario"});
  }
}

module.exports = { login, crearUsuario, getUsuarios, actualizarUsuario, eliminarUsuario };
