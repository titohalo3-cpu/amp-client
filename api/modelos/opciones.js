/**
 * Opciones comunes de los esquemas.
 * Al convertir un documento a JSON (lo que recibe Angular):
 *  - _id pasa a llamarse id (Angular trabaja con "id")
 *  - se quita __v (versión interna de Mongoose)
 *  - nunca se envía la contraseña
 */
module.exports = {
  versionKey: false,
  toJSON: {
    transform: (doc, ret) => {
      ret.id = ret._id;
      delete ret._id;
      delete ret.password;
      return ret;
    },
  },
};
