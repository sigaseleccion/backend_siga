require('dotenv').config({ path: './.env' });
const mongoose = require('mongoose');
const ejecutarSeedPermisos = require('./seeds/seedPermisosPrivilegios');

mongoose.connect(process.env.MONGODB_URI)
  .then(async () => {
    await ejecutarSeedPermisos();
    process.exit();
  });
