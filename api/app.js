const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const app = express();
const rutasVideojuegos = require('./rutas/rutasVideojuegos');
const rutasVentas = require('./rutas/rutasVentas');
const rutasUsuarios = require('./rutas/rutasUsuarios');

// Permite recibir JSON en peticiones POST y PUT
app.use(express.json());

// PERMITE CORS DESDE EL ENTORNO DE PRUEBAS DE ANGULAR
app.use(cors({ origin: 'http://localhost:4200' }));

// Conexión a MongoDB
mongoose.connect('mongodb://root:example@localhost:27017/2daw?authSource=admin')
  .then(() => console.log('Conectado a MongoDB'))
  .catch(err => console.error('Error al conectar MongoDB', err));

app.use('/videojuegos', rutasVideojuegos);
app.use('/ventas', rutasVentas);
app.use('/usuarios', rutasUsuarios);

app.use((req, res) => {
  res.status(404).send('Ruta no encontrada');
});

const PORT = 3000;
app.listen(PORT, () => console.log(`Servidor en http://localhost:${PORT}`));
