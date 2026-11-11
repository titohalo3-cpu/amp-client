const express = require('express');
const router = express.Router();
const ControladorUsuarios = require('../controladores/controladorUsuarios');

router.get('/', ControladorUsuarios.getUsuarios);
router.get('/:id', ControladorUsuarios.getUsuario);
router.patch('/:id', ControladorUsuarios.actualizarUsuario); // cambia solo los campos enviados
router.delete('/:id', ControladorUsuarios.eliminarUsuario);

module.exports = router;
