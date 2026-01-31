const Privilegio = require('../src/models/Privilegio');
const Permiso = require('../src/models/Permiso');

const ejecutarSeedPermisos = async () => {
  try {
    console.log('🌱 Iniciando seed de permisos y privilegios...');

    // 1️⃣ Definición base según tu sistema
    const estructuraPermisos = {
      dashboard: ['ver'],

      convocatorias: [
        'ver',
        'crear',
        'editar',
        'cargarExcelAdicional'
      ],

      seleccion: [
        'ver',
        'crear',
        'editar',
        'gestionReporteTecnico',
        'gestionArchivado'
      ],

      seguimiento: [
        'ver',
        'crear',
        'editar'
      ],

      roles: [
        'ver',
        'crear',
        'editar',
        'eliminar'
      ],

      usuarios: [
        'ver',
        'crear',
        'editar',
        'eliminar'
      ]
    };

    // 2️⃣ Obtener TODOS los privilegios únicos
    const privilegiosUnicos = [
      ...new Set(
        Object.values(estructuraPermisos).flat()
      )
    ];

    // 3️⃣ Crear privilegios si no existen
    const privilegiosMap = {};

    for (const clave of privilegiosUnicos) {
      let privilegio = await Privilegio.findOne({ clave });

      if (!privilegio) {
        privilegio = await Privilegio.create({
          clave,
          etiqueta: clave
            .replace(/([A-Z])/g, ' $1')
            .replace(/^./, c => c.toUpperCase())
        });
      }

      privilegiosMap[clave] = privilegio._id;
    }

    // 4️⃣ Crear permisos (módulos) con sus privilegios
    for (const modulo of Object.keys(estructuraPermisos)) {
      let permiso = await Permiso.findOne({ modulo });

      const privilegiosDelModulo = estructuraPermisos[modulo].map(
        clave => privilegiosMap[clave]
      );

      if (!permiso) {
        await Permiso.create({
          modulo,
          privilegiosDisponibles: privilegiosDelModulo
        });
      } else {
        permiso.privilegiosDisponibles = privilegiosDelModulo;
        await permiso.save();
      }
    }

    console.log('✅ Seed de permisos y privilegios completada correctamente');
  } catch (error) {
    console.error('❌ Error ejecutando la seed:', error);
  }
};

module.exports = ejecutarSeedPermisos;
