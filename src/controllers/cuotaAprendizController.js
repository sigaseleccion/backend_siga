// const CuotaAprendiz = require('../models/CuotaAprendiz');

// // Obtener cuota actual
// const obtenerCuota = async (req, res) => {
//   try {
//     const cuota = await CuotaAprendiz.findOne()
//       .sort({ fechaActualizacion: -1 })
//       .populate('actualizadoPor', 'nombre correo');
//     res.json(cuota);
//   } catch (error) {
//     res.status(500).json({ message: 'Error al obtener cuota', error: error.message });
//   }
// };

// // Obtener historial de cuotas
// const obtenerHistorialCuotas = async (req, res) => {
//   try {
//     const cuotas = await CuotaAprendiz.find()
//       .sort({ fechaActualizacion: -1 })
//       .populate('actualizadoPor', 'nombre correo');
//     res.json(cuotas);
//   } catch (error) {
//     res.status(500).json({ message: 'Error al obtener historial de cuotas', error: error.message });
//   }
// };

// // Crear/Actualizar cuota
// const actualizarCuota = async (req, res) => {
//   try {
//     const { cuota, actualizadoPor } = req.body;

//     const nuevaCuota = new CuotaAprendiz({
//       cuota,
//       actualizadoPor,
//       fechaActualizacion: new Date()
//     });

//     await nuevaCuota.save();
//     res.status(201).json({ message: 'Cuota actualizada exitosamente', cuota: nuevaCuota });
//   } catch (error) {
//     res.status(500).json({ message: 'Error al actualizar cuota', error: error.message });
//   }
// };

// module.exports = {
//   obtenerCuota,
//   obtenerHistorialCuotas,
//   actualizarCuota
// };


const CuotaAprendiz = require('../models/CuotaAprendiz');
const { calcularCantidadAprendicesPorPeriodo } = require('./seguimientoController');

// Obtener cuota actual
const obtenerCuota = async (req, res) => {
  try {
    const cuota = await CuotaAprendiz.findOne()
      .sort({ fechaActualizacion: -1 })
      .populate('actualizadoPor', 'nombre correo');
    res.json(cuota);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener cuota', error: error.message });
  }
};

// Obtener historial de cuotas
const obtenerHistorialCuotas = async (req, res) => {
  try {
    const cuotas = await CuotaAprendiz.find()
      .sort({ fechaActualizacion: -1 })
      .populate('actualizadoPor', 'nombre correo');
    res.json(cuotas);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener historial de cuotas', error: error.message });
  }
};

// Crear/Actualizar cuota
const actualizarCuota = async (req, res) => {
  try {
    const { fechaInicial, fechaFinal, cuota } = req.body;

    // Validar campos requeridos
    if (!fechaInicial || !fechaFinal || !cuota) {
      return res.status(400).json({ 
        message: 'Faltan campos requeridos: fechaInicial, fechaFinal y cuota son obligatorios' 
      });
    }

    // Convertir fechas a objetos Date
    const fechaInicioDate = new Date(fechaInicial);
    const fechaFinDate = new Date(fechaFinal);
    
    // ✅ VALIDACIÓN: Solo se pueden crear cuotas para períodos FUTUROS
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    
    if (fechaInicioDate <= hoy) {
      return res.status(400).json({ 
        message: 'Solo puedes crear cuotas para fechas futuras. Por favor, elige una fecha que aún no haya comenzado.' 
      });
    }

    // ✅ VALIDACIÓN: No permitir fechas duplicadas o solapadas
    // Períodos consecutivos del 15 al 15 SÍ están permitidos (ej: 15-feb a 15-mar y 15-mar a 15-abr)
    const cuotaExistente = await CuotaAprendiz.findOne({
      $and: [
        // Que empiecen ANTES de que termine el nuevo período (estrictamente menor)
        { fechaInicial: { $lt: fechaFinDate } },
        // Y que terminen DESPUÉS de que empiece el nuevo período (estrictamente mayor)
        { fechaFinal: { $gt: fechaInicioDate } }
      ]
    });

    if (cuotaExistente) {
      const fechaInicialExistente = new Date(cuotaExistente.fechaInicial).toLocaleDateString('es-CO', { timeZone: 'UTC' });
      const fechaFinalExistente = new Date(cuotaExistente.fechaFinal).toLocaleDateString('es-CO', { timeZone: 'UTC' });
      return res.status(400).json({ 
        message: `Ya existe una cuota creada del ${fechaInicialExistente} al ${fechaFinalExistente}. Por favor, elige fechas diferentes que no coincidan con esta cuota.` 
      });
    }

    // 🔄 Calcular automáticamente la cantidad de aprendices para el período
    const cantidadCalculada = await calcularCantidadAprendicesPorPeriodo(fechaInicioDate, fechaFinDate);

    // Calcular estado automáticamente
    const estado = cantidadCalculada >= cuota ? 'cumple' : 'no cumple';

    const nuevaCuota = new CuotaAprendiz({
      fechaInicial: fechaInicioDate,
      fechaFinal: fechaFinDate,
      cuota,
      cantidadAprendices: cantidadCalculada,
      estado,
      actualizadoPor: req.usuario?.id,
      fechaActualizacion: new Date()
    });

    await nuevaCuota.save();
    res.status(201).json({ 
      message: 'Cuota creada exitosamente', 
      cuota: nuevaCuota 
    });
  } catch (error) {
    res.status(500).json({ 
      message: 'Error al crear cuota', 
      error: error.message 
    });
  }
};

// Editar una cuota existente (SOLO PARA PERÍODOS FUTUROS)
const editarCuota = async (req, res) => {
  try {
    const { id } = req.params;
    const { fechaInicial, fechaFinal, cuota } = req.body;

    const cuotaExistente = await CuotaAprendiz.findById(id);
    
    if (!cuotaExistente) {
      return res.status(404).json({ message: 'Cuota no encontrada' });
    }

    // ✅ VALIDACIÓN: Solo se pueden editar cuotas de períodos futuros
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    
    if (cuotaExistente.fechaInicial <= hoy) {
      return res.status(403).json({ 
        message: 'No se pueden editar cuotas de períodos actuales o pasados. Solo se pueden modificar cuotas futuras.' 
      });
    }

    // Actualizar campos si se proporcionan
    if (fechaInicial) cuotaExistente.fechaInicial = new Date(fechaInicial);
    if (fechaFinal) cuotaExistente.fechaFinal = new Date(fechaFinal);
    if (cuota !== undefined) cuotaExistente.cuota = cuota;

    // 🔄 Recalcular automáticamente la cantidad de aprendices para el período actualizado
    const cantidadCalculada = await calcularCantidadAprendicesPorPeriodo(
      cuotaExistente.fechaInicial, 
      cuotaExistente.fechaFinal
    );
    cuotaExistente.cantidadAprendices = cantidadCalculada;

    // Recalcular estado basado en los valores actualizados
    const nuevoEstado = cantidadCalculada >= cuotaExistente.cuota ? 'cumple' : 'no cumple';
    cuotaExistente.estado = nuevoEstado;
    cuotaExistente.fechaActualizacion = new Date();
    cuotaExistente.actualizadoPor = req.usuario?.id;

    // Forzar marcado de campos modificados para asegurar que se guarden
    cuotaExistente.markModified('estado');
    cuotaExistente.markModified('cantidadAprendices');

    // Log para debugging
    console.log('📊 Editando cuota:', {
      id: cuotaExistente._id,
      cantidadCalculada,
      cuotaRequerida: cuotaExistente.cuota,
      estadoNuevo: nuevoEstado
    });

    await cuotaExistente.save();
    
    res.json({ 
      message: 'Cuota actualizada exitosamente', 
      cuota: cuotaExistente 
    });
  } catch (error) {
    res.status(500).json({ 
      message: 'Error al editar cuota', 
      error: error.message 
    });
  }
};

// Recalcular cantidad de aprendices de una cuota (basado en sus fechas)
const actualizarCantidadAprendices = async (req, res) => {
  try {
    const { id } = req.params;

    const cuotaExistente = await CuotaAprendiz.findById(id);
    
    if (!cuotaExistente) {
      return res.status(404).json({ message: 'Cuota no encontrada' });
    }

    // 🔄 Recalcular automáticamente la cantidad según las fechas del período
    const cantidadCalculada = await calcularCantidadAprendicesPorPeriodo(
      cuotaExistente.fechaInicial,
      cuotaExistente.fechaFinal
    );

    cuotaExistente.cantidadAprendices = cantidadCalculada;
    cuotaExistente.estado = cantidadCalculada >= cuotaExistente.cuota ? 'cumple' : 'no cumple';
    cuotaExistente.fechaActualizacion = new Date();

    // Forzar marcado de campos modificados
    cuotaExistente.markModified('estado');
    cuotaExistente.markModified('cantidadAprendices');

    await cuotaExistente.save();
    
    res.json({ 
      message: 'Cantidad de aprendices recalculada exitosamente', 
      cuota: cuotaExistente 
    });
  } catch (error) {
    res.status(500).json({ 
      message: 'Error al actualizar cantidad de aprendices', 
      error: error.message 
    });
  }
};

// Obtener cuota por ID
const obtenerCuotaPorId = async (req, res) => {
  try {
    const { id } = req.params;
    const cuota = await CuotaAprendiz.findById(id)
      .populate('actualizadoPor', 'nombre correo');
    
    if (!cuota) {
      return res.status(404).json({ message: 'Cuota no encontrada' });
    }

    res.json(cuota);
  } catch (error) {
    res.status(500).json({ 
      message: 'Error al obtener cuota', 
      error: error.message 
    });
  }
};

// Obtener cuotas futuras (para edición)
const obtenerCuotasFuturas = async (req, res) => {
  try {
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);

    // Buscar cuotas cuya fecha inicial sea futura
    const cuotasFuturas = await CuotaAprendiz.find({
      fechaInicial: { $gt: hoy }
    })
      .sort({ fechaInicial: 1 }) // Ordenar por fecha inicial ascendente
      .populate('actualizadoPor', 'nombre correo');

    res.json(cuotasFuturas);
  } catch (error) {
    res.status(500).json({ 
      message: 'Error al obtener cuotas futuras', 
      error: error.message 
    });
  }
};

// Eliminar cuota (SOLO PERÍODOS FUTUROS)
const eliminarCuota = async (req, res) => {
  try {
    const { id } = req.params;
    
    const cuota = await CuotaAprendiz.findById(id);
    
    if (!cuota) {
      return res.status(404).json({ message: 'Cuota no encontrada' });
    }

    // ✅ VALIDACIÓN: Solo se pueden eliminar cuotas de períodos futuros
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    
    if (cuota.fechaInicial <= hoy) {
      return res.status(403).json({ 
        message: 'No se pueden eliminar cuotas de períodos actuales o pasados. Solo se pueden eliminar cuotas futuras.' 
      });
    }

    await CuotaAprendiz.findByIdAndDelete(id);

    res.json({ message: 'Cuota eliminada exitosamente' });
  } catch (error) {
    res.status(500).json({ 
      message: 'Error al eliminar cuota', 
      error: error.message 
    });
  }
};

module.exports = {
  obtenerCuota,
  obtenerHistorialCuotas,
  actualizarCuota,
  editarCuota,
  actualizarCantidadAprendices,
  obtenerCuotaPorId,
  obtenerCuotasFuturas,
  eliminarCuota
};
