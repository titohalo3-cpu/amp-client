const express = require('express');
const router = express.Router();
const ControladorVentas = require('../controladores/controladorVentas');

router.get('/', ControladorVentas.getVentas);
router.get('/:id', ControladorVentas.getVenta);
router.post('/', ControladorVentas.crearVenta);
router.put('/:id', ControladorVentas.actualizarVenta);
router.delete('/:id', ControladorVentas.eliminarVenta);
module.exports = router;
