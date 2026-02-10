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
//       etapaActual: { $in: ['lectiva', 'productiva'] }  // ✅ Solo lectiva y productiva
//       // etapaActual: { $ne: 'finalizado' }
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

//     // Obtener total de aprendices EN SEGUIMIENTO (solo lectiva + productiva)
//     const totalEnSeguimiento = await Aprendiz.countDocuments({
//       estadoConvocatoria: 'seleccionado',
//       etapaActual: { $in: ['lectiva', 'productiva'] }  // Solo etapas en seguimiento
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
//       totalEnSeguimiento,  // Número de aprendices en lectiva + productiva
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

// // Obtener aprendices recomendados para reemplazo
// const obtenerRecomendadosParaReemplazo = async (req, res) => {
//   try {
//     const { fechaFinContrato } = req.query;

//     if (!fechaFinContrato) {
//       return res.status(400).json({ message: 'fechaFinContrato es requerida' });
//     }

//     const fecha = new Date(fechaFinContrato);
//     const fechaMenos20Dias = new Date(fecha);
//     fechaMenos20Dias.setDate(fechaMenos20Dias.getDate() - 20);
//     const fechaMas20Dias = new Date(fecha);
//     fechaMas20Dias.setDate(fechaMas20Dias.getDate() + 20);

//     // Buscar aprendices en lectiva con fechaInicioProductiva cercana a fechaFinContrato
//     const recomendados = await Aprendiz.find({
//       estadoConvocatoria: 'seleccionado',
//       etapaActual: 'lectiva',
//       fechaInicioProductiva: {
//         $gte: fechaMenos20Dias,
//         $lte: fechaMas20Dias
//       }
//     }).select('_id nombre apellido documento tipoDocumento etapaActual fechaInicioProductiva programaFormacion ciudad');

//     res.json(recomendados);
//   } catch (error) {
//     res.status(500).json({ message: 'Error al obtener recomendados', error: error.message });
//   }
// };

// // Actualizar fechas de aprendiz
// const actualizarFechasAprendiz = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const { fechaInicioProductiva, fechaFinContrato } = req.body;

//     const aprendiz = await Aprendiz.findById(id);
//     if (!aprendiz) {
//       return res.status(404).json({ message: 'Aprendiz no encontrado' });
//     }

//     if (fechaInicioProductiva) {
//       aprendiz.fechaInicioProductiva = new Date(fechaInicioProductiva);
//     }

//     if (fechaFinContrato) {
//       aprendiz.fechaFinContrato = new Date(fechaFinContrato);
//     }

//     await aprendiz.save();

//     // Popular referencias para mantener consistencia con GET /api/seguimiento
//     const aprendizActualizado = await Aprendiz.findById(id)
//       .populate('convocatoriaId', 'nombre')
//       .populate('reemplazoId', 'nombre documento');

//     res.json({ message: 'Fechas actualizadas correctamente', aprendiz: aprendizActualizado });
//   } catch (error) {
//     res.status(500).json({ message: 'Error al actualizar fechas', error: error.message });
//   }
// };

// // Actualizar etapas automáticamente según fechaInicioProductiva
// const actualizarEtapasAutomaticas = async (req, res) => {
//   try {
//     const hoy = new Date();
//     hoy.setHours(0, 0, 0, 0); // Resetear a medianoche para comparación exacta

//     // Buscar aprendices en etapa lectiva cuya fecha de inicio productiva ya pasó
//     const aprendices = await Aprendiz.find({
//       estadoConvocatoria: 'seleccionado',
//       etapaActual: 'lectiva',
//       fechaInicioProductiva: { $lte: hoy }
//     });

//     if (aprendices.length === 0) {
//       return res.json({
//         message: 'No hay aprendices para actualizar',
//         actualizados: 0,
//         detalles: []
//       });
//     }

//     // Actualizar cada aprendiz a productiva
//     const actualizados = [];
//     for (const aprendiz of aprendices) {
//       aprendiz.etapaActual = 'productiva';
//       await aprendiz.save();

//       actualizados.push({
//         id: aprendiz._id,
//         nombre: aprendiz.nombre,
//         documento: aprendiz.documento,
//         fechaInicioProductiva: aprendiz.fechaInicioProductiva,
//         etapaAnterior: 'lectiva',
//         etapaNueva: 'productiva'
//       });

//       // Log de auditoría
//       console.log(`[AUDITORÍA] Aprendiz ${aprendiz.nombre} (${aprendiz.documento}) pasó de lectiva a productiva automáticamente. Fecha inicio productiva: ${aprendiz.fechaInicioProductiva}`);
//     }

//     res.json({
//       message: `${actualizados.length} aprendiz(es) actualizado(s) a etapa productiva`,
//       actualizados: actualizados.length,
//       detalles: actualizados
//     });
//   } catch (error) {
//     console.error('[ERROR] Error al actualizar etapas automáticamente:', error);
//     res.status(500).json({
//       message: 'Error al actualizar etapas automáticamente',
//       error: error.message
//     });
//   }
// };

// module.exports = {
//   obtenerAprendicesSeguimiento,
//   obtenerEstadisticasSeguimiento,
//   obtenerAprendicesIncompletos,
//   cambiarEtapaAprendiz,
//   asignarReemplazo,
//   obtenerDetalleAprendizSeguimiento,
//   obtenerRecomendadosParaReemplazo,
//   actualizarFechasAprendiz,
//   actualizarEtapasAutomaticas
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
      etapaActual: { $in: ['lectiva', 'productiva'] }  // ✅ Solo lectiva y productiva
      // etapaActual: { $ne: 'finalizado' }
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

    // Obtener total de aprendices EN SEGUIMIENTO (solo lectiva + productiva)
    const totalEnSeguimiento = await Aprendiz.countDocuments({
      estadoConvocatoria: 'seleccionado',
      etapaActual: { $in: ['lectiva', 'productiva'] }  // Solo etapas en seguimiento
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
      totalEnSeguimiento,  // Número de aprendices en lectiva + productiva
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

// Obtener aprendices recomendados para reemplazo
const obtenerRecomendadosParaReemplazo = async (req, res) => {
  try {
    const { fechaFinContrato } = req.query;

    if (!fechaFinContrato) {
      return res.status(400).json({ message: 'fechaFinContrato es requerida' });
    }

    const fecha = new Date(fechaFinContrato);
    const fechaMenos20Dias = new Date(fecha);
    fechaMenos20Dias.setDate(fechaMenos20Dias.getDate() - 20);
    const fechaMas20Dias = new Date(fecha);
    fechaMas20Dias.setDate(fechaMas20Dias.getDate() + 20);

    // Buscar aprendices en lectiva con fechaInicioProductiva cercana a fechaFinContrato
    const recomendados = await Aprendiz.find({
      estadoConvocatoria: 'seleccionado',
      etapaActual: 'lectiva',
      fechaInicioProductiva: {
        $gte: fechaMenos20Dias,
        $lte: fechaMas20Dias
      }
    }).select('_id nombre apellido documento tipoDocumento etapaActual fechaInicioProductiva programaFormacion ciudad');

    res.json(recomendados);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener recomendados', error: error.message });
  }
};

// Actualizar fechas de aprendiz
const actualizarFechasAprendiz = async (req, res) => {
  try {
    const { id } = req.params;
    const { fechaInicioProductiva, fechaFinContrato } = req.body;

    const aprendiz = await Aprendiz.findById(id);
    if (!aprendiz) {
      return res.status(404).json({ message: 'Aprendiz no encontrado' });
    }

    if (fechaInicioProductiva) {
      aprendiz.fechaInicioProductiva = new Date(fechaInicioProductiva);
    }

    if (fechaFinContrato) {
      aprendiz.fechaFinContrato = new Date(fechaFinContrato);
    }

    await aprendiz.save();

    // Popular referencias para mantener consistencia con GET /api/seguimiento
    const aprendizActualizado = await Aprendiz.findById(id)
      .populate('convocatoriaId', 'nombre')
      .populate('reemplazoId', 'nombre documento');

    res.json({ message: 'Fechas actualizadas correctamente', aprendiz: aprendizActualizado });
  } catch (error) {
    res.status(500).json({ message: 'Error al actualizar fechas', error: error.message });
  }
};

// Obtener aprendices en histórico (finalizados)
const obtenerAprendicesHistorico = async (req, res) => {
  try {
    const { busqueda } = req.query;

    // Filtro base: solo aprendices seleccionados y finalizados
    const filtro = {
      estadoConvocatoria: 'seleccionado',
      etapaActual: 'finalizado'
    };

    // Filtrar por búsqueda (nombre, documento, ciudad o programa)
    if (busqueda) {
      filtro.$or = [
        { nombre: { $regex: busqueda, $options: 'i' } },
        { documento: { $regex: busqueda, $options: 'i' } },
        { ciudad: { $regex: busqueda, $options: 'i' } },
        { programaFormacion: { $regex: busqueda, $options: 'i' } }
      ];
    }

    const aprendices = await Aprendiz.find(filtro)
      .populate('convocatoriaId', 'nombre')
      .sort({ fechaFinContrato: -1 }); // Ordenar por fecha fin de contrato (más recientes primero)

    res.json(aprendices);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener aprendices del histórico', error: error.message });
  }
};

// Actualizar etapas automáticamente según fechaInicioProductiva y fechaFinContrato
const actualizarEtapasAutomaticas = async (req, res) => {
  try {
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0); // Resetear a medianoche para comparación exacta

    // 1. Buscar aprendices en etapa lectiva cuya fecha de inicio productiva ya pasó
    const aprendicesLectivaAProductiva = await Aprendiz.find({
      estadoConvocatoria: 'seleccionado',
      etapaActual: 'lectiva',
      fechaInicioProductiva: { $lte: hoy }
    });

    // 2. Buscar aprendices en etapa productiva cuya fecha de fin de contrato ya pasó
    const aprendicesProductivaAFinalizado = await Aprendiz.find({
      estadoConvocatoria: 'seleccionado',
      etapaActual: 'productiva',
      fechaFinContrato: { $lte: hoy }
    });

    const actualizados = [];

    // Actualizar lectiva → productiva
    for (const aprendiz of aprendicesLectivaAProductiva) {
      aprendiz.etapaActual = 'productiva';
      await aprendiz.save();

      actualizados.push({
        id: aprendiz._id,
        nombre: aprendiz.nombre,
        documento: aprendiz.documento,
        fechaInicioProductiva: aprendiz.fechaInicioProductiva,
        etapaAnterior: 'lectiva',
        etapaNueva: 'productiva'
      });

      console.log(`[AUDITORÍA] Aprendiz ${aprendiz.nombre} (${aprendiz.documento}) pasó de lectiva a productiva automáticamente. Fecha inicio productiva: ${aprendiz.fechaInicioProductiva}`);
    }

    // Actualizar productiva → finalizado (con creación de historial)
    for (const aprendiz of aprendicesProductivaAFinalizado) {
      // Crear registro en historial
      const historial = new HistorialAprendiz({
        aprendizId: aprendiz._id,
        nombre: aprendiz.nombre,
        tipoDocumento: aprendiz.tipoDocumento,
        documento: aprendiz.documento,
        programaFormacion: aprendiz.programaFormacion,
        ciudad: aprendiz.ciudad,
        fechaInicioContrato: aprendiz.fechaInicioContrato,
        fechaInicioProductiva: aprendiz.fechaInicioProductiva,
        fechaFinContrato: aprendiz.fechaFinContrato,
        convocatoriaId: aprendiz.convocatoriaId,
        fechaFinalizacion: new Date()
      });
      await historial.save();

      aprendiz.etapaActual = 'finalizado';
      await aprendiz.save();

      actualizados.push({
        id: aprendiz._id,
        nombre: aprendiz.nombre,
        documento: aprendiz.documento,
        fechaFinContrato: aprendiz.fechaFinContrato,
        etapaAnterior: 'productiva',
        etapaNueva: 'finalizado'
      });

      console.log(`[AUDITORÍA] Aprendiz ${aprendiz.nombre} (${aprendiz.documento}) pasó de productiva a finalizado automáticamente. Fecha fin contrato: ${aprendiz.fechaFinContrato}`);
    }

    if (actualizados.length === 0) {
      return res.json({
        message: 'No hay aprendices para actualizar',
        actualizados: 0,
        detalles: []
      });
    }

    res.json({
      message: `${actualizados.length} aprendiz(es) actualizado(s) automáticamente`,
      actualizados: actualizados.length,
      detalles: actualizados
    });
  } catch (error) {
    console.error('[ERROR] Error al actualizar etapas automáticamente:', error);
    res.status(500).json({
      message: 'Error al actualizar etapas automáticamente',
      error: error.message
    });
  }
};


module.exports = {
  obtenerAprendicesSeguimiento,
  obtenerEstadisticasSeguimiento,
  obtenerAprendicesIncompletos,
  cambiarEtapaAprendiz,
  asignarReemplazo,
  obtenerDetalleAprendizSeguimiento,
  obtenerRecomendadosParaReemplazo,
  actualizarFechasAprendiz,
  actualizarEtapasAutomaticas,
  obtenerAprendicesHistorico
};
