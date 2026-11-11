// Configuración de la API. Cada valor se puede cambiar con una variable de entorno.
module.exports = {
  PORT: process.env.PORT || 3000,
  MONGO_URI: process.env.MONGO_URI || 'mongodb://root:example@localhost:27017/2daw?authSource=admin',
};
