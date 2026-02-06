const Convocatoria = require('../models/Convocatoria');
const Aprendiz = require('../models/Aprendiz');

// Función para calcular el ranking de aprendices
const calcularRanking = async (aprendices) => {
  // Obtener todos los aprendices existentes en etapa lectiva para comparar
  const aprendicesExistentes = await Aprendiz.find({ etapaActual: 'lectiva' });
  
  // Calcular puntos para cada aprendiz
  const aprendicesConPuntos = aprendices.map((aprendiz) => {
    let puntos = 0;
    
    // +2 puntos si la ciudad es Medellin o Bogota
    const ciudadLower = (aprendiz.ciudad || '').toLowerCase().trim();
    if (ciudadLower === 'medellin' || ciudadLower === 'medellín' || ciudadLower === 'bogota' || ciudadLower === 'bogotá') {
      puntos += 2;
    }
    
    // +1 punto por cada aprendiz existente cuya fecha inicio productiva esté cerca de la fecha fin lectiva del nuevo
    if (aprendiz.fechaFinLectiva) {
      const fechaFinLectiva = new Date(aprendiz.fechaFinLectiva);
      
      aprendicesExistentes.forEach((existente) => {
        if (existente.fechaInicioProductiva) {
          const fechaInicioProductiva = new Date(existente.fechaInicioProductiva);
          const diffDias = Math.abs((fechaInicioProductiva - fechaFinLectiva) / (1000 * 60 * 60 * 24));
          
          // Si la diferencia es menor a 30 días, suma puntos
          if (diffDias <= 30) {
            puntos += 1;
          }
        }
      });
    }
    
    return { ...aprendiz, puntos };
  });
  
  // Ordenar por puntos (mayor a menor)
  aprendicesConPuntos.sort((a, b) => b.puntos - a.puntos);
  
  // Asignar ranking (evitar repetición de números)
  aprendicesConPuntos.forEach((aprendiz, index) => {
    aprendiz.ranking = index + 1;
  });
  
  return aprendicesConPuntos;
};

// Función para obtener aprendices recomendados
const obtenerAprendicesRecomendados = async (fechaInicioProductiva) => {
  if (!fechaInicioProductiva) return [];
  
  const fecha = new Date(fechaInicioProductiva);
  const fechaMenos10Dias = new Date(fecha);
  fechaMenos10Dias.setDate(fechaMenos10Dias.getDate() - 10);
  const fechaMas10Dias = new Date(fecha);
  fechaMas10Dias.setDate(fechaMas10Dias.getDate() + 10);
  
  // Buscar aprendices en etapa lectiva con fecha inicio productiva a menos de 10 días de diferencia
  const recomendados = await Aprendiz.find({
    etapaActual: 'lectiva',
    fechaInicioProductiva: {
      $gte: fechaMenos10Dias,
      $lte: fechaMas10Dias
    }
  }).select('_id nombre tipoDocumento documento etapaActual fechaInicioProductiva');
  
  return recomendados.map(a => a._id);
};

// Generar ID único para convocatoria
const generarIdConvocatoria = async () => {
  const year = new Date().getFullYear();
  const count = await Convocatoria.countDocuments({
    idConvocatoria: { $regex: `^CONV-${year}` }
  });
  return `CONV-${year}-${String(count + 1).padStart(3, '0')}`;
};

// Obtener todas las convocatorias
const obtenerConvocatorias = async (req, res) => {
  try {
    const convocatorias = await Convocatoria.find({ archivada: false }).sort({ fechaCreacion: -1 });
    res.json(convocatorias);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener convocatorias', error: error.message });
  }
};

const obtenerConvocatoriasArchivadas = async (req, res) => {
  try {
    const convocatorias = await Convocatoria.find({ archivada: true }).sort({ fechaArchivado: -1 });
    res.json(convocatorias);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener convocatorias archivadas', error: error.message });
  }
};

// Obtener convocatoria por ID
const obtenerConvocatoriaPorId = async (req, res) => {
  try {
    const convocatoria = await Convocatoria.findById(req.params.id);
    if (!convocatoria) {
      return res.status(404).json({ message: 'Convocatoria no encontrada' });
    }
    res.json(convocatoria);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener convocatoria', error: error.message });
  }
};

// Crear convocatoria simple (sin aprendices)
const crearConvocatoria = async (req, res) => {
  try {
    const idConvocatoria = await generarIdConvocatoria();
    const nuevaConvocatoria = new Convocatoria({
      ...req.body,
      idConvocatoria,
    });
    await nuevaConvocatoria.save();
    res.status(201).json({ message: 'Convocatoria creada exitosamente', convocatoria: nuevaConvocatoria });
  } catch (error) {
    res.status(500).json({ message: 'Error al crear convocatoria', error: error.message });
  }
};

// Crear convocatoria con aprendices (desde Excel)
const crearConvocatoriaConAprendices = async (req, res) => {
  try {
    const { convocatoria: convocatoriaData, aprendices: aprendicesData } = req.body;
    
    if (!convocatoriaData || !aprendicesData || !Array.isArray(aprendicesData)) {
      return res.status(400).json({ message: 'Datos inválidos' });
    }
    
    // Generar ID de convocatoria
    const idConvocatoria = await generarIdConvocatoria();
    
    // Crear la convocatoria
    const nuevaConvocatoria = new Convocatoria({
      idConvocatoria,
      nombreConvocatoria: convocatoriaData.nombreConvocatoria,
      programa: convocatoriaData.programa,
      nivelFormacion: convocatoriaData.nivelFormacion,
      estado: 'en proceso',
      totalAprendices: aprendicesData.length,
    });
    
    await nuevaConvocatoria.save();
    
    // Calcular ranking de aprendices
    const aprendicesConRanking = await calcularRanking(aprendicesData);
    
    // Crear aprendices con datos completos
    const aprendicesCreados = [];
    for (const aprendizData of aprendicesConRanking) {
      // Obtener aprendices recomendados para este aprendiz
      const aprendicesRecomendados = await obtenerAprendicesRecomendados(aprendizData.fechaInicioProductiva);
      
      const nuevoAprendiz = new Aprendiz({
        nombre: aprendizData.nombre,
        tipoDocumento: aprendizData.tipoDocumento || 'CC',
        documento: aprendizData.documento,
        ciudad: aprendizData.ciudad,
        direccion: aprendizData.direccion,
        telefono: aprendizData.telefono,
        correo: aprendizData.correo,
        programaFormacion: convocatoriaData.programa,
        fechaInicioLectiva: aprendizData.fechaInicioLectiva,
        fechaFinLectiva: aprendizData.fechaFinLectiva,
        fechaInicioProductiva: aprendizData.fechaInicioProductiva,
        fechaFinProductiva: aprendizData.fechaFinProductiva,
        fechaInicioContrato: null,
        fechaFinContrato: null,
        convocatoriaId: nuevaConvocatoria._id,
        estadoConvocatoria: 'no seleccionado',
        ranking: aprendizData.ranking,
        aprendicesRecomendados,
        etapaActual: 'seleccion1',
      });
      
      await nuevoAprendiz.save();
      aprendicesCreados.push(nuevoAprendiz);
    }
    
    res.status(201).json({
      message: 'Convocatoria creada exitosamente con aprendices',
      convocatoria: nuevaConvocatoria,
      aprendices: aprendicesCreados,
    });
  } catch (error) {
    res.status(500).json({ message: 'Error al crear convocatoria con aprendices', error: error.message });
  }
};

// Cargar Excel adicional (agregar más aprendices a convocatoria existente)
const cargarExcelAdicional = async (req, res) => {
  try {
    const { id } = req.params;
    const { aprendices: aprendicesData } = req.body;
    
    const convocatoria = await Convocatoria.findById(id);
    if (!convocatoria) {
      return res.status(404).json({ message: 'Convocatoria no encontrada' });
    }
    
    if (convocatoria.estado === 'finalizado') {
      return res.status(400).json({ message: 'No se pueden agregar aprendices a una convocatoria finalizada' });
    }
    
    // Obtener aprendices existentes de esta convocatoria
    const aprendicesExistentes = await Aprendiz.find({ convocatoriaId: id });
    const documentosExistentes = new Set(aprendicesExistentes.map(a => a.documento));
    
    // Filtrar aprendices nuevos (no duplicados)
    const aprendicesNuevos = aprendicesData.filter(a => !documentosExistentes.has(a.documento));
    
    if (aprendicesNuevos.length === 0) {
      return res.status(400).json({ message: 'Todos los aprendices ya existen en la convocatoria' });
    }
    
    // Combinar aprendices existentes (solo datos relevantes) con nuevos para recalcular ranking
    const todosAprendices = [
      ...aprendicesExistentes.map(a => ({
        _id: a._id,
        nombre: a.nombre,
        tipoDocumento: a.tipoDocumento,
        documento: a.documento,
        ciudad: a.ciudad,
        direccion: a.direccion,
        telefono: a.telefono,
        correo: a.correo,
        fechaInicioLectiva: a.fechaInicioLectiva,
        fechaFinLectiva: a.fechaFinLectiva,
        fechaInicioProductiva: a.fechaInicioProductiva,
        fechaFinProductiva: a.fechaFinProductiva,
        esExistente: true,
      })),
      ...aprendicesNuevos.map(a => ({ ...a, esExistente: false })),
    ];
    
    // Recalcular ranking para todos
    const aprendicesConRanking = await calcularRanking(todosAprendices);
    
    // Actualizar ranking de aprendices existentes
    for (const aprendiz of aprendicesConRanking.filter(a => a.esExistente)) {
      await Aprendiz.findByIdAndUpdate(aprendiz._id, { ranking: aprendiz.ranking });
    }
    
    // Crear nuevos aprendices
    const aprendicesCreados = [];
    for (const aprendizData of aprendicesConRanking.filter(a => !a.esExistente)) {
      const aprendicesRecomendados = await obtenerAprendicesRecomendados(aprendizData.fechaInicioProductiva);
      
      const nuevoAprendiz = new Aprendiz({
        nombre: aprendizData.nombre,
        tipoDocumento: aprendizData.tipoDocumento || 'CC',
        documento: aprendizData.documento,
        ciudad: aprendizData.ciudad,
        direccion: aprendizData.direccion,
        telefono: aprendizData.telefono,
        correo: aprendizData.correo,
        programaFormacion: convocatoria.programa,
        fechaInicioLectiva: aprendizData.fechaInicioLectiva,
        fechaFinLectiva: aprendizData.fechaFinLectiva,
        fechaInicioProductiva: aprendizData.fechaInicioProductiva,
        fechaFinProductiva: aprendizData.fechaFinProductiva,
        fechaInicioContrato: null,
        fechaFinContrato: null,
        convocatoriaId: convocatoria._id,
        estadoConvocatoria: 'no seleccionado',
        ranking: aprendizData.ranking,
        aprendicesRecomendados,
        etapaActual: 'seleccion1',
      });
      
      await nuevoAprendiz.save();
      aprendicesCreados.push(nuevoAprendiz);
    }
    
    // Actualizar total de aprendices en convocatoria
    convocatoria.totalAprendices = aprendicesExistentes.length + aprendicesCreados.length;
    await convocatoria.save();
    
    res.json({
      message: `Se agregaron ${aprendicesCreados.length} aprendices nuevos y se recalculó el ranking`,
      aprendicesAgregados: aprendicesCreados.length,
      aprendicesDuplicados: aprendicesData.length - aprendicesNuevos.length,
    });
  } catch (error) {
    res.status(500).json({ message: 'Error al cargar Excel adicional', error: error.message });
  }
};

// Cerrar convocatoria
const cerrarConvocatoria = async (req, res) => {
  try {
    const { id } = req.params;
    
    const convocatoria = await Convocatoria.findById(id);
    if (!convocatoria) {
      return res.status(404).json({ message: 'Convocatoria no encontrada' });
    }
    
    // Actualizar estado de la convocatoria a finalizado
    convocatoria.estado = 'finalizado';
    await convocatoria.save();
    
    // Actualizar aprendices seleccionados que están en seleccion1 a seleccion2
    const resultado = await Aprendiz.updateMany(
      {
        convocatoriaId: id,
        estadoConvocatoria: 'seleccionado',
        etapaActual: 'seleccion1',
      },
      {
        etapaActual: 'seleccion2',
      }
    );
    
    res.json({
      message: 'Convocatoria cerrada exitosamente',
      convocatoria,
      aprendicesActualizados: resultado.modifiedCount,
    });
  } catch (error) {
    res.status(500).json({ message: 'Error al cerrar convocatoria', error: error.message });
  }
};

// Reabrir convocatoria
const reabrirConvocatoria = async (req, res) => {
  try {
    const { id } = req.params;
    
    const convocatoria = await Convocatoria.findById(id);
    if (!convocatoria) {
      return res.status(404).json({ message: 'Convocatoria no encontrada' });
    }
    
    // Cambiar estado a en proceso
    convocatoria.estado = 'en proceso';
    await convocatoria.save();
    
    res.json({
      message: 'Convocatoria reabierta exitosamente',
      convocatoria,
    });
  } catch (error) {
    res.status(500).json({ message: 'Error al reabrir convocatoria', error: error.message });
  }
};

// Actualizar convocatoria
const actualizarConvocatoria = async (req, res) => {
  try {
    const convocatoria = await Convocatoria.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!convocatoria) {
      return res.status(404).json({ message: 'Convocatoria no encontrada' });
    }
    res.json({ message: 'Convocatoria actualizada', convocatoria });
  } catch (error) {
    res.status(500).json({ message: 'Error al actualizar convocatoria', error: error.message });
  }
};

// Archivar convocatoria
const archivarConvocatoria = async (req, res) => {
  try {
    const convocatoria = await Convocatoria.findByIdAndUpdate(
      req.params.id,
      { archivada: true, fechaArchivado: new Date() },
      { new: true }
    );
    if (!convocatoria) {
      return res.status(404).json({ message: 'Convocatoria no encontrada' });
    }
    res.json({ message: 'Convocatoria archivada exitosamente', convocatoria });
  } catch (error) {
    res.status(500).json({ message: 'Error al archivar convocatoria', error: error.message });
  }
};

module.exports = {
  obtenerConvocatorias,
  obtenerConvocatoriasArchivadas,
  obtenerConvocatoriaPorId,
  crearConvocatoria,
  crearConvocatoriaConAprendices,
  cargarExcelAdicional,
  cerrarConvocatoria,
  reabrirConvocatoria,
  actualizarConvocatoria,
  archivarConvocatoria,
};
