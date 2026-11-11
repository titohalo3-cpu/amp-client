const bcrypt = require('bcryptjs');
const Usuario = require('../modelos/Usuario');
const siguienteId = require('../modelos/siguienteId');

/** POST /auth/login  { email, password } → el usuario (sin contraseña) o 401 */
async function login(req, res) {
  try {
    const { email = '', password = '' } = req.body;
    const usuario = await Usuario.findOne({ email: email.toLowerCase() });
    // bcrypt.compare cifra la contraseña recibida y la compara con la guardada
    if (!usuario || !(await bcrypt.compare(password, usuario.password))) {
      return res.status(401).json({ error: 'Email o contraseña incorrectos' });
    }
    res.status(200).json(usuario);
  } catch (err) {
    console.error('Error en login:', err.message);
    res.status(500).json({ error: 'Error al iniciar sesión' });
  }
}

/** POST /auth/registro  { nombre, email, password } → usuario nuevo con rol cliente */
async function registro(req, res) {
  try {
    const { nombre, email = '', password = '' } = req.body;
    if (password.length < 6) return res.status(400).json({ error: 'La contraseña tiene al menos 6 caracteres' });
    if (await Usuario.exists({ email: email.toLowerCase() })) {
      return res.status(409).json({ error: 'Ese email ya está registrado' });
    }
    const nuevo = new Usuario({
      _id: await siguienteId(Usuario),
      nombre,
      email,
      password: await bcrypt.hash(password, 10), // nunca se guarda en claro
      rol: 'cliente', // el rol no lo elige quien se registra
    });
    await nuevo.save();
    res.status(201).json(nuevo);
  } catch (err) {
    console.error('Error en registro:', err.message);
    if (err.name === 'ValidationError') return res.status(400).json({ error: err.message });
    res.status(500).json({ error: 'Error al registrar el usuario' });
  }
}

/** GET /auth/email-disponible?email=x  → { disponible: true | false } (validador asíncrono de Angular) */
async function emailDisponible(req, res) {
  try {
    const email = String(req.query.email ?? '').toLowerCase();
    const existe = await Usuario.exists({ email });
    res.status(200).json({ disponible: !existe });
  } catch (err) {
    console.error('Error en emailDisponible:', err.message);
    res.status(500).json({ error: 'Error al comprobar el email' });
  }
}

module.exports = { login, registro, emailDisponible };
