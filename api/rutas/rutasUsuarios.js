const express = require('express');
const router = express.Router();
const ControladorUsuarios = require('../controladores/controladorUsuarios');

router.post('/login', ControladorUsuarios.login);
router.post('/registro', ControladorUsuarios.crearUsuario);
router.get('/', ControladorUsuarios.getUsuarios);
router.put('/:id', ControladorUsuarios.actualizarUsuario);
router.delete('/:id', ControladorUsuarios.eliminarUsuario);
module.exports = router;
