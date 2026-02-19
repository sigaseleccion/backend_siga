
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
      .populate('apReemplazar', 'nombre documento')  // Aprendiz que este va a reemplazar
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

    // Obtener total de aprendices EN SEGUIMIENTO (lectiva + productiva + seleccion2 aprobados)
    // seleccion2 aprobados = tienen fechaInicioContrato y fechaFinContrato diligenciadas
    const totalEnSeguimiento = await Aprendiz.countDocuments({
      estadoConvocatoria: 'seleccionado',
      $or: [
        { etapaActual: { $in: ['lectiva', 'productiva'] } },
        {
          etapaActual: 'seleccion2',
          fechaInicioContrato: { $ne: null },
          fechaFinContrato: { $ne: null }
        }
      ]
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
      .populate('reemplazoId', 'nombre documento')
      .populate('apReemplazar', 'nombre documento');

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
      .populate('reemplazoId', 'nombre documento')
      .populate('apReemplazar', 'nombre documento');

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

// Obtener aprendices recomendados por fecha de inicio de contrato (ventana -20 a +20 días) e incluir coincidencia exacta por inicio productiva
const obtenerRecomendadosPorContrato = async (req, res) => {
  try {
    const { fechaInicioContrato } = req.query;
    if (!fechaInicioContrato) {
      return res.status(400).json({ message: 'fechaInicioContrato es requerida' });
    }
    const fecha = new Date(fechaInicioContrato);
    const inicioVentana = new Date(fecha);
    inicioVentana.setDate(inicioVentana.getDate() - 20);
    inicioVentana.setHours(0, 0, 0, 0);
    const finVentana = new Date(fecha);
    finVentana.setDate(finVentana.getDate() + 20);
    finVentana.setHours(23, 59, 59, 999);
    const inicioDia = new Date(fecha);
    inicioDia.setHours(0, 0, 0, 0);
    const finDia = new Date(fecha);
    finDia.setHours(23, 59, 59, 999);

    let recomendados = await Aprendiz.find({
      estadoConvocatoria: 'seleccionado',
      etapaActual: 'lectiva',
      $or: [
        {
          fechaInicioContrato: {
            $gte: inicioVentana,
            $lte: finVentana
          }
        },
        {
          fechaInicioProductiva: {
            $gte: inicioDia,
            $lte: finDia
          }
        }
      ]
    }).select('_id nombre documento tipoDocumento etapaActual fechaInicioLectiva fechaFinLectiva fechaInicioProductiva fechaFinProductiva fechaInicioContrato fechaFinContrato programaFormacion ciudad');
    
    const ids = recomendados.map(r => r._id);
    if (ids.length > 0) {
      const yaAsignados = await Aprendiz.find({ apReemplazar: { $in: ids } }).select('apReemplazar');
      if (yaAsignados && yaAsignados.length > 0) {
        const ocupados = new Set(yaAsignados.map(a => String(a.apReemplazar)));
        recomendados = recomendados.filter(r => !ocupados.has(String(r._id)));
      }
    }
    res.json(recomendados);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener recomendados por contrato', error: error.message });
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

    // VALIDACIONES
    const errors = [];

    // 1. Validar fechaInicioProductiva
    if (fechaInicioProductiva) {
      const inicioProductiva = new Date(fechaInicioProductiva);

      // Debe ser >= fechaInicioContrato
      if (aprendiz.fechaInicioContrato && inicioProductiva < new Date(aprendiz.fechaInicioContrato)) {
        errors.push('La fecha de inicio productiva debe ser igual o posterior al inicio del contrato');
      }

      // Debe ser < fechaFinContrato (si se está actualizando o ya existe)
      const finContrato = fechaFinContrato ? new Date(fechaFinContrato) : aprendiz.fechaFinContrato;
      if (finContrato && inicioProductiva >= new Date(finContrato)) {
        errors.push('La fecha de inicio productiva debe ser anterior a la fecha de fin del contrato');
      }

      // No puede ser más de 2 años en el futuro
      const dosAniosFuturo = new Date();
      dosAniosFuturo.setFullYear(dosAniosFuturo.getFullYear() + 2);
      if (inicioProductiva > dosAniosFuturo) {
        errors.push('La fecha de inicio productiva no puede ser más de 2 años en el futuro');
      }
    }

    // 2. Validar fechaFinContrato
    if (fechaFinContrato) {
      const finContrato = new Date(fechaFinContrato);

      // Debe ser > fechaInicioProductiva (si se está actualizando o ya existe)
      const inicioProductiva = fechaInicioProductiva ? new Date(fechaInicioProductiva) : aprendiz.fechaInicioProductiva;
      if (inicioProductiva && finContrato <= new Date(inicioProductiva)) {
        errors.push('La fecha de fin debe ser posterior a la fecha de inicio productiva');
      }

      // Duración máxima de etapa productiva (1 año = 12 meses)
      if (inicioProductiva) {
        const mesesProductiva = (finContrato - new Date(inicioProductiva)) / (1000 * 60 * 60 * 24 * 30);
        if (mesesProductiva > 12) {
          errors.push('La etapa productiva no puede durar más de 1 año');
        }
      }

      // Si está en productiva, fin debe ser hoy o futuro (no puede ser pasado)
      if (aprendiz.etapaActual === 'productiva') {
        const hoy = new Date();
        hoy.setHours(0, 0, 0, 0);

        // Crear fecha desde el string en hora local (evitar problema de timezone)
        const [year, month, day] = fechaFinContrato.split('-');
        const finContratoLocal = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
        finContratoLocal.setHours(0, 0, 0, 0);

        console.log('[VALIDACIÓN] Comparando fechas:');
        console.log('  - Hoy:', hoy.toISOString().split('T')[0]);
        console.log('  - Fin Contrato (local):', finContratoLocal.toISOString().split('T')[0]);
        console.log('  - Es válido (>=):', finContratoLocal >= hoy);

        if (finContratoLocal < hoy) {
          errors.push('La fecha de fin no puede estar en el pasado para aprendices en etapa productiva');
        }
      }
    }

    // Si hay errores, retornar
    if (errors.length > 0) {
      return res.status(400).json({
        message: 'Errores de validación',
        errors
      });
    }

    // Actualizar fechas
    if (fechaInicioProductiva) {
      aprendiz.fechaInicioProductiva = new Date(fechaInicioProductiva);
    }

    if (fechaFinContrato) {
      aprendiz.fechaFinContrato = new Date(fechaFinContrato);
    }

    // AJUSTE AUTOMÁTICO DE ETAPA SEGÚN FECHAS
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);

    let etapaAnterior = aprendiz.etapaActual;

    // 1. Si está en productiva pero la fecha de inicio productiva es futura → volver a lectiva
    if (aprendiz.etapaActual === 'productiva' &&
      aprendiz.fechaInicioProductiva &&
      new Date(aprendiz.fechaInicioProductiva) > hoy) {
      aprendiz.etapaActual = 'lectiva';
      console.log(`[AUTO-AJUSTE] Aprendiz ${aprendiz._id} (${aprendiz.nombre}) movido de productiva → lectiva (fecha inicio productiva es futura: ${aprendiz.fechaInicioProductiva.toISOString().split('T')[0]})`);
    }

    // 2. Si está en lectiva pero la fecha de inicio productiva ya pasó → pasar a productiva
    if (aprendiz.etapaActual === 'lectiva' &&
      aprendiz.fechaInicioProductiva &&
      new Date(aprendiz.fechaInicioProductiva) <= hoy) {
      aprendiz.etapaActual = 'productiva';
      console.log(`[AUTO-AJUSTE] Aprendiz ${aprendiz._id} (${aprendiz.nombre}) movido de lectiva → productiva (fecha inicio productiva alcanzada: ${aprendiz.fechaInicioProductiva.toISOString().split('T')[0]})`);
    }

    // 3. Si está en productiva pero el contrato ya finalizó → pasar a finalizado
    if (aprendiz.etapaActual === 'productiva' &&
      aprendiz.fechaFinContrato &&
      new Date(aprendiz.fechaFinContrato) <= hoy) {

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
        fechaFinalizacion: hoy
      });
      await historial.save();

      aprendiz.etapaActual = 'finalizado';
      console.log(`[AUTO-AJUSTE] Aprendiz ${aprendiz._id} (${aprendiz.nombre}) movido de productiva → finalizado (fecha fin contrato alcanzada: ${aprendiz.fechaFinContrato.toISOString().split('T')[0]})`);
    }

    await aprendiz.save();

    // Mensaje informativo si hubo cambio de etapa
    let mensajeRespuesta = 'Fechas actualizadas correctamente';
    if (etapaAnterior !== aprendiz.etapaActual) {
      mensajeRespuesta += `. El aprendiz ha sido movido automáticamente de etapa ${etapaAnterior} → ${aprendiz.etapaActual}`;
    }

    // Popular referencias para mantener consistencia con GET /api/seguimiento
    const aprendizActualizado = await Aprendiz.findById(id)
      .populate('convocatoriaId', 'nombre')
      .populate('reemplazoId', 'nombre documento')
      .populate('apReemplazar', 'nombre documento');

    res.json({
      message: mensajeRespuesta,
      aprendiz: aprendizActualizado,
      etapaCambiada: etapaAnterior !== aprendiz.etapaActual,
      etapaAnterior,
      etapaNueva: aprendiz.etapaActual
    });
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

    // 0. Buscar aprendices en etapa seleccion2 cuya fecha de inicio de contrato ya pasó
    const aprendicesSeleccionALectiva = await Aprendiz.find({
      estadoConvocatoria: 'seleccionado',
      etapaActual: 'seleccion2',
      fechaInicioContrato: { $lte: hoy }
    });

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

    // Actualizar seleccion2 → lectiva
    for (const aprendiz of aprendicesSeleccionALectiva) {
      aprendiz.etapaActual = 'lectiva';
      await aprendiz.save();
      actualizados.push({
        id: aprendiz._id,
        nombre: aprendiz.nombre,
        documento: aprendiz.documento,
        fechaInicioContrato: aprendiz.fechaInicioContrato,
        etapaAnterior: 'seleccion2',
        etapaNueva: 'lectiva'
      });
      console.log(`[AUDITORÍA] Aprendiz ${aprendiz.nombre} (${aprendiz.documento}) pasó de seleccion2 a lectiva automáticamente. Fecha inicio contrato: ${aprendiz.fechaInicioContrato}`);
    }

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


// Obtener detalle de aprendices que componen la cuota (seleccion2 aprobados + lectiva + productiva)
const obtenerDetalleAprendicesCuota = async (req, res) => {
  try {
    const aprendices = await Aprendiz.find({
      estadoConvocatoria: 'seleccionado',
      $or: [
        { etapaActual: { $in: ['lectiva', 'productiva'] } },
        {
          etapaActual: 'seleccion2',
          fechaInicioContrato: { $ne: null },
          fechaFinContrato: { $ne: null }
        }
      ]
    })
      .populate('convocatoriaId', 'nombre')
      .populate('reemplazoId', 'nombre documento')
      .select('nombre documento tipoDocumento etapaActual programaFormacion ciudad fechaInicioContrato fechaInicioProductiva fechaFinContrato convocatoriaId reemplazoId')
      .sort({ etapaActual: 1, nombre: 1 });

    const agrupados = {
      seleccion2: aprendices.filter(a => a.etapaActual === 'seleccion2'),
      lectiva: aprendices.filter(a => a.etapaActual === 'lectiva'),
      productiva: aprendices.filter(a => a.etapaActual === 'productiva'),
    };

    res.json({
      total: aprendices.length,
      resumen: {
        seleccion2: agrupados.seleccion2.length,
        lectiva: agrupados.lectiva.length,
        productiva: agrupados.productiva.length,
      },
      aprendices: agrupados
    });
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener detalle de cuota', error: error.message });
  }
};

// Obtener aprendices con movimientos en el mes actual (finalizan, pasan a productiva, inician)
const obtenerAprendicesFinalizanMesActual = async (req, res) => {
  try {
    // 1. Obtener primer y último día del mes actual
    const hoy = new Date();
    const primerDiaMes = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
    primerDiaMes.setHours(0, 0, 0, 0);
    
    const ultimoDiaMes = new Date(hoy.getFullYear(), hoy.getMonth() + 1, 0);
    ultimoDiaMes.setHours(23, 59, 59, 999);

    // Próximo mes (para fallback)
    const primerDiaProximoMes = new Date(hoy.getFullYear(), hoy.getMonth() + 1, 1);
    primerDiaProximoMes.setHours(0, 0, 0, 0);
    
    const ultimoDiaProximoMes = new Date(hoy.getFullYear(), hoy.getMonth() + 2, 0);
    ultimoDiaProximoMes.setHours(23, 59, 59, 999);

    const hoyMidnight = new Date();
    hoyMidnight.setHours(0, 0, 0, 0);

    // Función helper para procesar aprendices
    const procesarAprendices = async (primerDia, ultimoDia) => {
      // CATEGORÍA 1: Aprendices en PRODUCTIVA que finalizan contrato
      const finalizanProductiva = await Aprendiz.find({
        estadoConvocatoria: 'seleccionado',
        etapaActual: 'productiva',
        fechaFinContrato: {
          $gte: primerDia,
          $lte: ultimoDia
        }
      })
        .populate('convocatoriaId', 'nombreConvocatoria')
        .populate('reemplazoId', 'nombre documento')
        .select('nombre documento tipoDocumento programaFormacion ciudad fechaFinContrato fechaInicioProductiva etapaActual reemplazoId')
        .lean();

      // CATEGORÍA 2: Aprendices en LECTIVA que pasan a productiva
      const pasanProductiva = await Aprendiz.find({
        estadoConvocatoria: 'seleccionado',
        etapaActual: 'lectiva',
        fechaInicioProductiva: {
          $gte: primerDia,
          $lte: ultimoDia
        }
      })
        .populate('convocatoriaId', 'nombreConvocatoria')
        .populate('reemplazoId', 'nombre documento')
        .select('nombre documento tipoDocumento programaFormacion ciudad fechaInicioProductiva fechaFinLectiva etapaActual reemplazoId')
        .lean();

      // CATEGORÍA 3: Aprendices en SELECCION2 que inician contrato
      const inicianContrato = await Aprendiz.find({
        estadoConvocatoria: 'seleccionado',
        etapaActual: 'seleccion2',
        fechaInicioContrato: {
          $gte: primerDia,
          $lte: ultimoDia
        }
      })
        .populate('convocatoriaId', 'nombreConvocatoria')
        .select('nombre documento tipoDocumento programaFormacion ciudad fechaInicioContrato etapaActual')
        .lean();

      // Procesar categoría 1: Finalizan contrato (productiva)
      const procesadosFinalizan = finalizanProductiva.map((a) => {
        const fechaFin = new Date(a.fechaFinContrato);
        const diasRestantes = Math.ceil((fechaFin - hoyMidnight) / (1000 * 60 * 60 * 24));

        let urgencia = 'normal';
        if (diasRestantes <= 7) urgencia = 'critico';
        else if (diasRestantes <= 15) urgencia = 'urgente';
        else if (diasRestantes <= 30) urgencia = 'proximo';

        return {
          ...a,
          diasRestantes,
          urgencia,
          tipoMovimiento: 'finaliza',
          fechaReferencia: a.fechaFinContrato,
          tieneReemplazo: Boolean(a.reemplazoId)
        };
      });

      // Procesar categoría 2: Pasan a productiva (lectiva)
      const procesadosPasanProductiva = pasanProductiva.map((a) => {
        const fechaInicio = new Date(a.fechaInicioProductiva);
        const diasRestantes = Math.ceil((fechaInicio - hoyMidnight) / (1000 * 60 * 60 * 24));

        let urgencia = 'normal';
        if (diasRestantes <= 7) urgencia = 'critico';
        else if (diasRestantes <= 15) urgencia = 'urgente';
        else if (diasRestantes <= 30) urgencia = 'proximo';

        return {
          ...a,
          diasRestantes,
          urgencia,
          tipoMovimiento: 'pasa_productiva',
          fechaReferencia: a.fechaInicioProductiva,
          tieneReemplazo: Boolean(a.reemplazoId)
        };
      });

      // Procesar categoría 3: Inician contrato (seleccion2)
      const procesadosInician = inicianContrato.map((a) => {
        const fechaInicio = new Date(a.fechaInicioContrato);
        const diasRestantes = Math.ceil((fechaInicio - hoyMidnight) / (1000 * 60 * 60 * 24));

        let urgencia = 'normal';
        if (diasRestantes <= 7) urgencia = 'critico';
        else if (diasRestantes <= 15) urgencia = 'urgente';
        else if (diasRestantes <= 30) urgencia = 'proximo';

        return {
          ...a,
          diasRestantes,
          urgencia,
          tipoMovimiento: 'inicia_contrato',
          fechaReferencia: a.fechaInicioContrato,
          tieneReemplazo: false
        };
      });

      // Combinar todas las categorías
      const todosAprendices = [
        ...procesadosFinalizan,
        ...procesadosPasanProductiva,
        ...procesadosInician
      ];

      // Ordenar por días restantes (los más urgentes primero)
      todosAprendices.sort((a, b) => a.diasRestantes - b.diasRestantes);

      return {
        aprendices: todosAprendices,
        finalizan: procesadosFinalizan.length,
        pasanProductiva: procesadosPasanProductiva.length,
        inicianContrato: procesadosInician.length
      };
    };

    // Procesar mes actual
    const mesActual = await procesarAprendices(primerDiaMes, ultimoDiaMes);
    
    // Procesar próximo mes (para fallback)
    const proximoMes = await procesarAprendices(primerDiaProximoMes, ultimoDiaProximoMes);

    res.json({
      total: mesActual.aprendices.length,
      mes: hoy.toLocaleString('es-ES', { month: 'long', year: 'numeric' }),
      proximoMes: primerDiaProximoMes.toLocaleString('es-ES', { month: 'long', year: 'numeric' }),
      resumen: {
        finalizan: mesActual.finalizan,
        pasanProductiva: mesActual.pasanProductiva,
        inicianContrato: mesActual.inicianContrato
      },
      aprendices: mesActual.aprendices,
      aprendicesProximoMes: proximoMes.aprendices,
      resumenProximoMes: {
        finalizan: proximoMes.finalizan,
        pasanProductiva: proximoMes.pasanProductiva,
        inicianContrato: proximoMes.inicianContrato
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener aprendices con movimientos del mes', error: error.message });
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
  obtenerRecomendadosPorContrato,
  actualizarFechasAprendiz,
  actualizarEtapasAutomaticas,
  obtenerAprendicesHistorico,
  obtenerDetalleAprendicesCuota,
  obtenerAprendicesFinalizanMesActual
};
