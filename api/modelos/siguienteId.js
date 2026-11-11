/**
 * Los ids son números (1, 2, 3...) para que las URLs sean cortas (/detalle/3)
 * y coincidan con los datos de ejemplo. Calcula el siguiente id libre de una colección.
 */
async function siguienteId(Modelo) {
  const ultimo = await Modelo.findOne().sort({ _id: -1 }).select('_id');
  return ultimo ? ultimo._id + 1 : 1;
}

module.exports = siguienteId;
