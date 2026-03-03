require('dotenv').config();
const mongoose = require('mongoose');
const CuotaAprendiz = require('../src/models/CuotaAprendiz');

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Conexión exitosa con la Base de Datos');
  } catch (error) {
    console.error(`❌ Error de conexión a MongoDB: ${error.message}`);
    process.exit(1);
  }
};

const seedCuotasAprendiz = async () => {
  try {
    console.log('🔄 Iniciando seed de cuotas de aprendices...');

    // Limpiar colección (opcional)
    // await CuotaAprendiz.deleteMany({});
    // console.log('🗑️  Cuotas anteriores eliminadas');

    // Importar la función para calcular cantidad
    const { calcularCantidadAprendicesPorPeriodo } = require('../src/controllers/seguimientoController');

    // Datos de ejemplo - diferentes períodos
    const cuotasEjemplo = [
      {
        fechaInicial: new Date('2026-02-15'),
        fechaFinal: new Date('2026-03-15'),
        cuota: 10
      },
      {
        fechaInicial: new Date('2026-03-15'),
        fechaFinal: new Date('2026-04-15'),
        cuota: 8
      },
      {
        fechaInicial: new Date('2026-04-15'),
        fechaFinal: new Date('2026-05-15'),
        cuota: 12
      }
    ];

    // Calcular cantidad automáticamente para cada período
    const cuotasConCantidad = await Promise.all(
      cuotasEjemplo.map(async (cuota) => {
        const cantidadCalculada = await calcularCantidadAprendicesPorPeriodo(
          cuota.fechaInicial,
          cuota.fechaFinal
        );
        
        return {
          ...cuota,
          cantidadAprendices: cantidadCalculada,
          estado: cantidadCalculada >= cuota.cuota ? 'cumple' : 'no cumple'
        };
      })
    );

    // Insertar cuotas
    const cuotasCreadas = await CuotaAprendiz.insertMany(cuotasConCantidad);
    console.log(`✅ ${cuotasCreadas.length} cuotas de aprendices creadas exitosamente`);

    // Mostrar cuotas creadas
    console.log('\n📋 Cuotas creadas:');
    cuotasCreadas.forEach((cuota, index) => {
      console.log(`\n${index + 1}. Período: ${cuota.fechaInicial.toLocaleDateString()} - ${cuota.fechaFinal.toLocaleDateString()}`);
      console.log(`   Cuota requerida: ${cuota.cuota}`);
      console.log(`   Aprendices calculados: ${cuota.cantidadAprendices}`);
      console.log(`   Estado: ${cuota.estado}`);
    });

  } catch (error) {
    console.error('❌ Error en el seed:', error.message);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Conexión a MongoDB cerrada');
  }
};

// Ejecutar seed
connectDB().then(seedCuotasAprendiz);
