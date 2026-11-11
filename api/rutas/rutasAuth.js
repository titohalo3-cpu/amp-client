const express = require('express');
const router = express.Router();
const ControladorAuth = require('../controladores/controladorAuth');

router.post('/login', ControladorAuth.login);
router.post('/registro', ControladorAuth.registro);
router.get('/email-disponible', ControladorAuth.emailDisponible);

module.exports = router;
