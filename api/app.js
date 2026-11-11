const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const config = require('./config');

const rutasAuth = require('./rutas/rutasAuth');
const rutasVideojuegos = require('./rutas/rutasVideojuegos');
const rutasVentas = require('./rutas/rutasVentas');
const rutasUsuarios = require('./rutas/rutasUsuarios');

const app = express();

// Permite que Angular (http://localhost:4200) llame a la API desde otro puerto.
app.use(cors());
// Permite recibir JSON en el cuerpo de las peticiones POST, PUT y PATCH.
app.use(express.json());

// Ruta de comprobación
app.get('/', (req, res) => {
  res.status(200).json({ api: 'AmpClient', estado: 'funcionando' });
});

// Cada grupo de rutas tiene su archivo (patrón MVC)
app.use('/auth', rutasAuth);
app.use('/videogames', rutasVideojuegos);
app.use('/sales', rutasVentas);
app.use('/users', rutasUsuarios);

// Ruta que no existe (404)
app.use((req, res) => {
  res.status(404).json({ error: 'Ruta no encontrada' });
});

// Conexión a MongoDB y puesta en marcha del servidor
mongoose
  .connect(config.MONGO_URI)
  .then(() => {
    console.log('Conectado a MongoDB');
    app.listen(config.PORT, () => console.log(`API en http://localhost:${config.PORT}`));
  })
  .catch((err) => {
    console.error('Error al conectar MongoDB. ¿Has arrancado Docker (docker compose up -d)?', err.message);
    process.exit(1);
  });
