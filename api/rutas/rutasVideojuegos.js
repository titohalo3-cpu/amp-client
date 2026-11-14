const express = require('express');
const router = express.Router();
const ControladorVideojuegos = require('../controladores/controladorVideojuegos');

router.get('/', ControladorVideojuegos.getVideojuegos);
router.get('/:id', ControladorVideojuegos.getVideojuego);
router.post('/', ControladorVideojuegos.crearVideojuego);
router.put('/:id', ControladorVideojuegos.actualizarVideojuego);
router.delete('/:id', ControladorVideojuegos.eliminarVideojuego);
module.exports = router;
