module.exports = {
  async up(db) {
    // Elimina los campos 'tipoDocumento' y 'Documento' de todos los usuarios
    await db.collection('usuarios').updateMany(
      {}, 
      { $unset: { tipoDocumento: "", documento: "" } }
    );
  },

  async down(db) {
    // Opcional: define cómo revertir el cambio (aunque los datos originales se pierden)
    await db.collection('usuarios').updateMany(
      {}, 
      { $set: { tipoDocumento: null, documento: null } }
    );
  }
};
