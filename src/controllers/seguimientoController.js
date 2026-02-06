// const Aprendiz = require('../models/Aprendiz');
// const CuotaAprendiz = require('../models/CuotaAprendiz');
// const HistorialAprendiz = require('../models/HistorialAprendiz');

// // Obtener aprendices para seguimiento (solo seleccionados)
// const obtenerAprendicesSeguimiento = async (req, res) => {
//   try {
//     const { etapa, busqueda } = req.query;
    
//     // Filtro base: solo aprendices seleccionados y no finalizados
//     const filtro = {
//       estadoConvocatoria: 'seleccionado',
//       etapaActual: { $ne: 'finalizado' }
//     };

//     // Filtrar por etapa si se especifica
//     if (etapa && etapa !== 'todas') {
//       filtro.etapaActual = etapa;
//     }

//     // Filtrar por búsqueda (nombre o documento)
//     if (busqueda) {
//       filtro.$or = [
//         { nombre: { $regex: busqueda, $options: 'i' } },
//         { documento: { $regex: busqueda, $options: 'i' } }
//       ];
//     }

//     const aprendices = await Aprendiz.find(filtro)
//       .populate('convocatoriaId', 'nombre')
//       .populate('reemplazoId', 'nombre documento')
//       .sort({ nombre: 1 });

//     // Calcular días restantes para cada aprendiz
//     const aprendicesConDias = aprendices.map(aprendiz => {
//       const hoy = new Date();
//       const fechaFin = aprendiz.fechaFinContrato ? new Date(aprendiz.fechaFinContrato) : null;
//       const diasRestantes = fechaFin 
//         ? Math.ceil((fechaFin - hoy) / (1000 * 60 * 60 * 24)) 
//         : null;

//       return {
//         ...aprendiz.toObject(),
//         diasRestantes
//       };
//     });

//     res.json(aprendicesConDias);
//   } catch (error) {
//     res.status(500).json({ message: 'Error al obtener aprendices de seguimiento', error: error.message });
//   }
// };

// // Obtener estadísticas del dashboard de seguimiento
// const obtenerEstadisticasSeguimiento = async (req, res) => {
//   try {
//     // Contar aprendices en etapa lectiva (seleccionados)
//     const enLectiva = await Aprendiz.countDocuments({
//       estadoConvocatoria: 'seleccionado',
//       etapaActual: 'lectiva'
//     });

//     // Contar aprendices en etapa productiva (seleccionados)
//     const enProductiva = await Aprendiz.countDocuments({
//       estadoConvocatoria: 'seleccionado',
//       etapaActual: 'productiva'
//     });

//     // Obtener total de aprendices activos (no finalizados)
//     const totalActivos = await Aprendiz.countDocuments({
//       estadoConvocatoria: 'seleccionado',
//       etapaActual: { $ne: 'finalizado' }
//     });

//     // Obtener cuota actual
//     const cuotaDoc = await CuotaAprendiz.findOne().sort({ fechaActualizacion: -1 });
//     const cuota = cuotaDoc ? cuotaDoc.cuota : 0;

//     // Contar aprendices incompletos (con datos faltantes importantes)
//     const aprendicesIncompletos = await Aprendiz.countDocuments({
//       estadoConvocatoria: 'seleccionado',
//       etapaActual: { $ne: 'finalizado' },
//       $or: [
//         { fechaInicioContrato: null },
//         { fechaFinContrato: null },
//         { programaFormacion: { $in: [null, ''] } },
//         { ciudad: { $in: [null, ''] } }
//       ]
//     });

//     res.json({
//       enLectiva,
//       enProductiva,
//       totalActivos,
//       cuota,
//       aprendicesIncompletos
//     });
//   } catch (error) {
//     res.status(500).json({ message: 'Error al obtener estadísticas', error: error.message });
//   }
// };

// // Obtener aprendices con datos incompletos
// const obtenerAprendicesIncompletos = async (req, res) => {
//   try {
//     const aprendices = await Aprendiz.find({
//       estadoConvocatoria: 'seleccionado',
//       etapaActual: { $ne: 'finalizado' },
//       $or: [
//         { fechaInicioContrato: null },
//         { fechaFinContrato: null },
//         { fechaInicioProductiva: null },
//         { programaFormacion: { $in: [null, ''] } },
//         { ciudad: { $in: [null, ''] } },
//         { telefono: { $in: [null, ''] } },
//         { correo: { $in: [null, ''] } }
//       ]
//     }).select('nombre documento programaFormacion ciudad etapaActual');

//     res.json(aprendices);
//   } catch (error) {
//     res.status(500).json({ message: 'Error al obtener aprendices incompletos', error: error.message });
//   }
// };

// // Cambiar etapa de un aprendiz
// const cambiarEtapaAprendiz = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const { etapa } = req.body;

//     if (!['lectiva', 'productiva', 'finalizado'].includes(etapa)) {
//       return res.status(400).json({ message: 'Etapa no válida' });
//     }

//     const aprendiz = await Aprendiz.findById(id);
//     if (!aprendiz) {
//       return res.status(404).json({ message: 'Aprendiz no encontrado' });
//     }

//     // Si pasa a finalizado, mover al historial
//     if (etapa === 'finalizado') {
//       const historial = new HistorialAprendiz({
//         aprendizId: aprendiz._id,
//         nombre: aprendiz.nombre,
//         documento: aprendiz.documento,
//         tipoDocumento: aprendiz.tipoDocumento,
//         programaFormacion: aprendiz.programaFormacion,
//         ciudad: aprendiz.ciudad,
//         fechaInicioContrato: aprendiz.fechaInicioContrato,
//         fechaFinContrato: aprendiz.fechaFinContrato,
//         convocatoriaId: aprendiz.convocatoriaId,
//         fechaFinalizacion: new Date()
//       });
//       await historial.save();
//     }

//     aprendiz.etapaActual = etapa;
//     await aprendiz.save();

//     res.json({ message: 'Etapa actualizada correctamente', aprendiz });
//   } catch (error) {
//     res.status(500).json({ message: 'Error al cambiar etapa', error: error.message });
//   }
// };

// // Asignar reemplazo a un aprendiz
// const asignarReemplazo = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const { reemplazoId } = req.body;

//     const aprendiz = await Aprendiz.findById(id);
//     if (!aprendiz) {
//       return res.status(404).json({ message: 'Aprendiz no encontrado' });
//     }

//     // Validar que el reemplazo exista si se proporciona
//     if (reemplazoId) {
//       const reemplazo = await Aprendiz.findById(reemplazoId);
//       if (!reemplazo) {
//         return res.status(404).json({ message: 'Aprendiz de reemplazo no encontrado' });
//       }
//     }

//     aprendiz.reemplazoId = reemplazoId || null;
//     await aprendiz.save();

//     const aprendizActualizado = await Aprendiz.findById(id)
//       .populate('reemplazoId', 'nombre documento');

//     res.json({ message: 'Reemplazo asignado correctamente', aprendiz: aprendizActualizado });
//   } catch (error) {
//     res.status(500).json({ message: 'Error al asignar reemplazo', error: error.message });
//   }
// };

// // Obtener detalle de un aprendiz en seguimiento
// const obtenerDetalleAprendizSeguimiento = async (req, res) => {
//   try {
//     const { id } = req.params;

//     const aprendiz = await Aprendiz.findById(id)
//       .populate('convocatoriaId', 'nombre fechaInicio fechaFin')
//       .populate('reemplazoId', 'nombre documento');

//     if (!aprendiz) {
//       return res.status(404).json({ message: 'Aprendiz no encontrado' });
//     }

//     // Calcular días restantes
//     const hoy = new Date();
//     const fechaFin = aprendiz.fechaFinContrato ? new Date(aprendiz.fechaFinContrato) : null;
//     const diasRestantes = fechaFin 
//       ? Math.ceil((fechaFin - hoy) / (1000 * 60 * 60 * 24)) 
//       : null;

//     res.json({
//       ...aprendiz.toObject(),
//       diasRestantes
//     });
//   } catch (error) {
//     res.status(500).json({ message: 'Error al obtener detalle del aprendiz', error: error.message });
//   }
// };

// module.exports = {
//   obtenerAprendicesSeguimiento,
//   obtenerEstadisticasSeguimiento,
//   obtenerAprendicesIncompletos,
//   cambiarEtapaAprendiz,
//   asignarReemplazo,
//   obtenerDetalleAprendizSeguimiento
// };


const Aprendiz = require('../models/Aprendiz');
const CuotaAprendiz = require('../models/CuotaAprendiz');
const HistorialAprendiz = require('../models/HistorialAprendiz');

// Obtener aprendices para seguimiento (solo seleccionados)
const obtenerAprendicesSeguimiento = async (req, res) => {
  try {
    const { etapa, busqueda } = req.query;
    
    // Filtro base: solo aprendices seleccionados y no finalizados
    const filtro = {
      estadoConvocatoria: 'seleccionado',
      etapaActual: { $ne: 'finalizado' }
    };

    // Filtrar por etapa si se especifica
    if (etapa && etapa !== 'todas') {
      filtro.etapaActual = etapa;
    }

    // Filtrar por búsqueda (nombre o documento)
    if (busqueda) {
      filtro.$or = [
        { nombre: { $regex: busqueda, $options: 'i' } },
        { documento: { $regex: busqueda, $options: 'i' } }
      ];
    }

    const aprendices = await Aprendiz.find(filtro)
      .populate('convocatoriaId', 'nombre')
      .populate('reemplazoId', 'nombre documento')
      .sort({ nombre: 1 });

    // Calcular días restantes para cada aprendiz
    const aprendicesConDias = aprendices.map(aprendiz => {
      const hoy = new Date();
      const fechaFin = aprendiz.fechaFinContrato ? new Date(aprendiz.fechaFinContrato) : null;
      const diasRestantes = fechaFin 
        ? Math.ceil((fechaFin - hoy) / (1000 * 60 * 60 * 24)) 
        : null;

      return {
        ...aprendiz.toObject(),
        diasRestantes
      };
    });

    res.json(aprendicesConDias);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener aprendices de seguimiento', error: error.message });
  }
};

// Obtener estadísticas del dashboard de seguimiento
const obtenerEstadisticasSeguimiento = async (req, res) => {
  try {
    // Contar aprendices en etapa lectiva (seleccionados)
    const enLectiva = await Aprendiz.countDocuments({
      estadoConvocatoria: 'seleccionado',
      etapaActual: 'lectiva'
    });

    // Contar aprendices en etapa productiva (seleccionados)
    const enProductiva = await Aprendiz.countDocuments({
      estadoConvocatoria: 'seleccionado',
      etapaActual: 'productiva'
    });

    // Obtener total de aprendices activos (no finalizados)
    const totalActivos = await Aprendiz.countDocuments({
      estadoConvocatoria: 'seleccionado',
      etapaActual: { $ne: 'finalizado' }
    });

    // Obtener cuota actual
    const cuotaDoc = await CuotaAprendiz.findOne().sort({ fechaActualizacion: -1 });
    const cuota = cuotaDoc ? cuotaDoc.cuota : 0;

    // Contar aprendices incompletos (con datos faltantes importantes)
    const aprendicesIncompletos = await Aprendiz.countDocuments({
      estadoConvocatoria: 'seleccionado',
      etapaActual: { $ne: 'finalizado' },
      $or: [
        { fechaInicioContrato: null },
        { fechaFinContrato: null },
        { programaFormacion: { $in: [null, ''] } },
        { ciudad: { $in: [null, ''] } }
      ]
    });

    res.json({
      enLectiva,
      enProductiva,
      totalActivos,
      cuota,
      aprendicesIncompletos
    });
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener estadísticas', error: error.message });
  }
};

// Obtener aprendices con datos incompletos
const obtenerAprendicesIncompletos = async (req, res) => {
  try {
    const aprendices = await Aprendiz.find({
      estadoConvocatoria: 'seleccionado',
      etapaActual: { $ne: 'finalizado' },
      $or: [
        { fechaInicioContrato: null },
        { fechaFinContrato: null },
        { fechaInicioProductiva: null },
        { programaFormacion: { $in: [null, ''] } },
        { ciudad: { $in: [null, ''] } },
        { telefono: { $in: [null, ''] } },
        { correo: { $in: [null, ''] } }
      ]
    }).select('nombre documento programaFormacion ciudad etapaActual');

    res.json(aprendices);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener aprendices incompletos', error: error.message });
  }
};

// Cambiar etapa de un aprendiz
const cambiarEtapaAprendiz = async (req, res) => {
  try {
    const { id } = req.params;
    const { etapa } = req.body;

    if (!['lectiva', 'productiva', 'finalizado'].includes(etapa)) {
      return res.status(400).json({ message: 'Etapa no válida' });
    }

    const aprendiz = await Aprendiz.findById(id);
    if (!aprendiz) {
      return res.status(404).json({ message: 'Aprendiz no encontrado' });
    }

    // Si pasa a finalizado, mover al historial
    if (etapa === 'finalizado') {
      const historial = new HistorialAprendiz({
        aprendizId: aprendiz._id,
        nombre: aprendiz.nombre,
        documento: aprendiz.documento,
        tipoDocumento: aprendiz.tipoDocumento,
        programaFormacion: aprendiz.programaFormacion,
        ciudad: aprendiz.ciudad,
        fechaInicioContrato: aprendiz.fechaInicioContrato,
        fechaFinContrato: aprendiz.fechaFinContrato,
        convocatoriaId: aprendiz.convocatoriaId,
        fechaFinalizacion: new Date()
      });
      await historial.save();
    }

    aprendiz.etapaActual = etapa;
    await aprendiz.save();

    res.json({ message: 'Etapa actualizada correctamente', aprendiz });
  } catch (error) {
    res.status(500).json({ message: 'Error al cambiar etapa', error: error.message });
  }
};

// Asignar reemplazo a un aprendiz
const asignarReemplazo = async (req, res) => {
  try {
    const { id } = req.params;
    const { reemplazoId } = req.body;

    const aprendiz = await Aprendiz.findById(id);
    if (!aprendiz) {
      return res.status(404).json({ message: 'Aprendiz no encontrado' });
    }

    // Validar que el reemplazo exista si se proporciona
    if (reemplazoId) {
      const reemplazo = await Aprendiz.findById(reemplazoId);
      if (!reemplazo) {
        return res.status(404).json({ message: 'Aprendiz de reemplazo no encontrado' });
      }
    }

    aprendiz.reemplazoId = reemplazoId || null;
    await aprendiz.save();

    const aprendizActualizado = await Aprendiz.findById(id)
      .populate('reemplazoId', 'nombre documento');

    res.json({ message: 'Reemplazo asignado correctamente', aprendiz: aprendizActualizado });
  } catch (error) {
    res.status(500).json({ message: 'Error al asignar reemplazo', error: error.message });
  }
};

// Obtener detalle de un aprendiz en seguimiento
const obtenerDetalleAprendizSeguimiento = async (req, res) => {
  try {
    const { id } = req.params;

    const aprendiz = await Aprendiz.findById(id)
      .populate('convocatoriaId', 'nombre fechaInicio fechaFin')
      .populate('reemplazoId', 'nombre documento');

    if (!aprendiz) {
      return res.status(404).json({ message: 'Aprendiz no encontrado' });
    }

    // Calcular días restantes
    const hoy = new Date();
    const fechaFin = aprendiz.fechaFinContrato ? new Date(aprendiz.fechaFinContrato) : null;
    const diasRestantes = fechaFin 
      ? Math.ceil((fechaFin - hoy) / (1000 * 60 * 60 * 24)) 
      : null;

    res.json({
      ...aprendiz.toObject(),
      diasRestantes
    });
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener detalle del aprendiz', error: error.message });
  }
};

// Actualizar fechas de un aprendiz en seguimiento
const actualizarFechasAprendiz = async (req, res) => {
  try {
    const { id } = req.params;
    const { fechaInicioProductiva, fechaFinContrato } = req.body;

    const aprendiz = await Aprendiz.findById(id);
    if (!aprendiz) {
      return res.status(404).json({ message: 'Aprendiz no encontrado' });
    }

    if (fechaInicioProductiva !== undefined) {
      aprendiz.fechaInicioProductiva = fechaInicioProductiva;
    }
    if (fechaFinContrato !== undefined) {
      aprendiz.fechaFinContrato = fechaFinContrato;
    }

    await aprendiz.save();

    const aprendizActualizado = await Aprendiz.findById(id)
      .populate('convocatoriaId', 'nombre')
      .populate('reemplazoId', 'nombre documento');

    res.json({ message: 'Fechas actualizadas correctamente', aprendiz: aprendizActualizado });
  } catch (error) {
    res.status(500).json({ message: 'Error al actualizar fechas', error: error.message });
  }
};

module.exports = {
  obtenerAprendicesSeguimiento,
  obtenerEstadisticasSeguimiento,
  obtenerAprendicesIncompletos,
  cambiarEtapaAprendiz,
  asignarReemplazo,
  obtenerDetalleAprendizSeguimiento,
  actualizarFechasAprendiz
};
