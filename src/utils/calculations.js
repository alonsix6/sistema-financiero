/**
 * Módulo de cálculos y lógica de negocio
 * Contiene todas las funciones de cálculo financiero
 */

const Calculations = {
  /**
   * Calcula la fecha de cobro de una compra con tarjeta
   * @param {string} fechaGasto - Fecha del gasto (YYYY-MM-DD)
   * @param {number} diaCierre - Día de cierre de la tarjeta
   * @param {number} diaPago - Día de pago de la tarjeta
   * @returns {Date} Fecha de cobro
   */
  calcularFechaCobro: (fechaGasto, diaCierre, diaPago) => {
    const fecha = new Date(fechaGasto + 'T12:00:00');
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);

    let fechaCierre = new Date(fecha.getFullYear(), fecha.getMonth(), diaCierre);
    if (fecha.getDate() > diaCierre) {
      fechaCierre.setMonth(fechaCierre.getMonth() + 1);
    }

    let fechaPago = new Date(fechaCierre.getFullYear(), fechaCierre.getMonth() + 1, diaPago);
    fechaPago.setHours(0, 0, 0, 0);

    if (fechaPago <= hoy) {
      fechaPago.setMonth(fechaPago.getMonth() + 1);
    }

    return fechaPago;
  },

  /**
   * Calcula el efectivo disponible actual
   * @param {Array} transacciones - Lista de transacciones
   * @returns {number} Efectivo disponible
   */
  calcularEfectivoDisponible: (transacciones) => {
    const ingresos = transacciones.filter(t => t.tipo === 'Ingreso').reduce((sum, t) => sum + t.monto, 0);
    const gastosEfectivo = transacciones.filter(t => t.tipo === 'Gasto' && t.metodoPago === 'Efectivo').reduce((sum, t) => sum + t.monto, 0);
    const pagosRealizados = transacciones.filter(t => t.tipo === 'PagoTarjeta').reduce((sum, t) => sum + t.monto, 0);
    return ingresos - gastosEfectivo - pagosRealizados;
  },

  /**
   * Obtiene resumen financiero de un período
   * @param {Array} transacciones - Lista de transacciones
   * @param {string} fechaInicio - Fecha inicio (YYYY-MM-DD)
   * @param {string} fechaFin - Fecha fin (YYYY-MM-DD)
   * @returns {Object} Resumen con ingresos, gastos, balance y tasa de ahorro
   */
  obtenerResumenPorPeriodo: (transacciones, fechaInicio, fechaFin) => {
    const inicio = new Date(fechaInicio + 'T00:00:00');
    const fin = new Date(fechaFin + 'T23:59:59');
    const transaccionesFiltradas = transacciones.filter(t => {
      const fecha = new Date(t.fecha + 'T12:00:00');
      return fecha >= inicio && fecha <= fin;
    });
    const ingresos = transaccionesFiltradas.filter(t => t.tipo === 'Ingreso').reduce((sum, t) => sum + t.monto, 0);
    const gastos = transaccionesFiltradas.filter(t => t.tipo === 'Gasto').reduce((sum, t) => sum + t.monto, 0);
    return {
      ingresos,
      gastos,
      balance: ingresos - gastos,
      tasaAhorro: ingresos > 0 ? ((ingresos - gastos) / ingresos * 100).toFixed(1) : 0
    };
  },

  /**
   * Obtiene cashflow total histórico
   * @param {Array} transacciones - Lista de transacciones
   * @returns {Object} Cashflow total
   */
  obtenerCashflowTotal: (transacciones) => {
    const ingresos = transacciones.filter(t => t.tipo === 'Ingreso').reduce((sum, t) => sum + t.monto, 0);
    const gastos = transacciones.filter(t => t.tipo === 'Gasto').reduce((sum, t) => sum + t.monto, 0);
    return { ingresosTotal: ingresos, gastosTotal: gastos, cashflowNeto: ingresos - gastos };
  },

  /**
   * Obtiene gastos agrupados por categoría
   * @param {Array} transacciones - Lista de transacciones
   * @param {string} fechaInicio - Fecha inicio (YYYY-MM-DD)
   * @param {string} fechaFin - Fecha fin (YYYY-MM-DD)
   * @returns {Object} Gastos por categoría
   */
  obtenerGastosPorCategoria: (transacciones, fechaInicio, fechaFin) => {
    const inicio = new Date(fechaInicio + 'T00:00:00');
    const fin = new Date(fechaFin + 'T23:59:59');
    const gastosFiltrados = transacciones.filter(t => {
      const fecha = new Date(t.fecha + 'T12:00:00');
      return t.tipo === 'Gasto' && fecha >= inicio && fecha <= fin;
    });
    const porCategoria = {};
    gastosFiltrados.forEach(gasto => {
      if (!porCategoria[gasto.categoria]) porCategoria[gasto.categoria] = 0;
      porCategoria[gasto.categoria] += gasto.monto;
    });
    return porCategoria;
  },

  /**
   * Obtiene próximos pagos de tarjetas
   * @param {Array} tarjetas - Lista de tarjetas
   * @returns {Array} Lista de próximos pagos
   */
  obtenerProximosPagos: (tarjetas) => {
    const pagos = [];
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);

    tarjetas.forEach(tarjeta => {
      if (tarjeta.saldoActual > 0) {
        let cierreDelMes = new Date(hoy.getFullYear(), hoy.getMonth(), tarjeta.fechaCierre);
        let proximoPago = new Date(cierreDelMes.getFullYear(), cierreDelMes.getMonth() + 1, tarjeta.fechaPago);
        proximoPago.setHours(0, 0, 0, 0);
        const diasRestantes = Math.ceil((proximoPago - hoy) / (1000 * 60 * 60 * 24));
        pagos.push({
          tarjeta: tarjeta.nombre,
          tarjetaId: tarjeta.id,
          fecha: proximoPago,
          diasRestantes,
          saldo: tarjeta.saldoActual,
          urgencia: diasRestantes <= 3 ? 'alta' : diasRestantes <= 7 ? 'media' : 'baja'
        });
      }
    });
    return pagos.sort((a, b) => a.fecha - b.fecha);
  },

  /**
   * Calcula proyección financiera a futuro
   * @param {Array} tarjetas - Lista de tarjetas
   * @param {Array} transacciones - Lista de transacciones
   * @param {Array} recurrencias - Lista de recurrencias
   * @param {number} meses - Número de meses a proyectar
   * @param {Object} simulacion - Simulación opcional
   * @returns {Object} Proyección con eventos y saldo inicial
   */
  calcularProyeccion: (tarjetas, transacciones, recurrencias, meses = 6, simulacion = null) => {
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    const efectivoDisponible = Calculations.calcularEfectivoDisponible(transacciones);
    let saldoActual = efectivoDisponible;
    const eventos = [];

    // Agregar pagos de tarjetas programados
    tarjetas.forEach(tarjeta => {
      if (tarjeta.saldoActual > 0) {
        let cierreDelMes = new Date(hoy.getFullYear(), hoy.getMonth(), tarjeta.fechaCierre);
        let fechaPago = new Date(cierreDelMes.getFullYear(), cierreDelMes.getMonth() + 1, tarjeta.fechaPago);
        fechaPago.setHours(0, 0, 0, 0);
        for (let i = 0; i < meses; i++) {
          const fechaEvento = new Date(fechaPago);
          fechaEvento.setMonth(fechaEvento.getMonth() + i);
          if (fechaEvento >= hoy) {
            eventos.push({
              fecha: fechaEvento,
              tipo: 'pago_tarjeta',
              descripcion: `Pago ${tarjeta.nombre}`,
              monto: i === 0 ? -tarjeta.saldoActual : 0,
              categoria: 'Pago Tarjeta',
              tarjeta: tarjeta.nombre,
              tarjetaId: tarjeta.id
            });
          }
        }
      }
    });

    // Agregar cuotas pendientes a la proyección
    transacciones.forEach(t => {
      if (t.esCuotas && t.cuotasInfo.cuotasRestantes > 0) {
        const tarjeta = tarjetas.find(tj => tj.id === parseInt(t.metodoPago));
        t.cuotasInfo.fechasCobro.forEach(cuota => {
          if (cuota.estado === 'pendiente') {
            const fechaCuota = new Date(cuota.fecha + 'T12:00:00');
            const fechaLimite = new Date(hoy);
            fechaLimite.setMonth(fechaLimite.getMonth() + meses);
            if (fechaCuota >= hoy && fechaCuota <= fechaLimite) {
              eventos.push({
                fecha: fechaCuota,
                tipo: 'cuota',
                descripcion: `${t.descripcion} - Cuota ${cuota.cuota}/${t.cuotasInfo.numeroCuotas}`,
                monto: -t.cuotasInfo.montoPorCuota,
                categoria: t.categoria,
                tarjeta: tarjeta?.nombre || 'Tarjeta',
                esCuota: true,
                transaccionPadreId: t.id
              });
            }
          }
        });
      }
    });

    // Agregar recurrencias
    recurrencias.filter(r => r.activo).forEach(r => {
      for (let i = 0; i < meses; i++) {
        const fechaBase = new Date(hoy.getFullYear(), hoy.getMonth() + i, r.dia);
        fechaBase.setHours(0, 0, 0, 0);
        if (fechaBase >= hoy) {
          const yaRegistrado = transacciones.some(t => {
            const ft = new Date(t.fecha + 'T12:00:00');
            return t.recurrenciaId === r.id && ft.getMonth() === fechaBase.getMonth() && ft.getFullYear() === fechaBase.getFullYear();
          });
          if (!yaRegistrado) {
            const monto = r.tipo === 'ingreso' ? r.monto : (r.tarjetaId && r.tarjetaId !== 'Efectivo' ? 0 : -r.monto);
            if (monto !== 0) {
              eventos.push({
                fecha: fechaBase,
                tipo: r.tipo === 'ingreso' ? 'ingreso_recurrente' : 'gasto_recurrente',
                descripcion: r.descripcion,
                monto: monto,
                categoria: r.categoria || 'Ingreso',
                recurrente: true
              });
            }
          }
        }
      }
    });

    // Agregar simulación si existe
    if (simulacion) {
      let montoSim = 0;
      let fechaImpacto = new Date(simulacion.fecha + 'T12:00:00');
      let agregarEvento = true;

      if (simulacion.tipo === 'Ingreso') {
        montoSim = simulacion.monto;
      } else {
        if (simulacion.metodoPago === 'Efectivo') {
          montoSim = -simulacion.monto;
        } else {
          const tarjetaSimulada = tarjetas.find(t => t.id === parseInt(simulacion.metodoPago));
          if (tarjetaSimulada) {
            fechaImpacto = Calculations.calcularFechaCobro(simulacion.fecha, tarjetaSimulada.fechaCierre, tarjetaSimulada.fechaPago);
            montoSim = -simulacion.monto;

            const eventoExistente = eventos.find(e => e.tarjetaId === tarjetaSimulada.id && Math.abs(e.fecha.getTime() - fechaImpacto.getTime()) < 86400000);
            if (eventoExistente) {
              eventoExistente.monto += montoSim;
              eventoExistente.descripcion = `${eventoExistente.descripcion.replace(' + 🔮', '')} + 🔮 ${simulacion.descripcion}`;
              eventoExistente.esSimulacion = true;
              agregarEvento = false;
            }
          } else {
            montoSim = 0;
            agregarEvento = false;
          }
        }
      }

      if (montoSim !== 0 && agregarEvento) {
        eventos.push({
          fecha: fechaImpacto,
          tipo: 'simulacion',
          descripcion: `🔮 ${simulacion.descripcion}`,
          monto: montoSim,
          categoria: 'Simulación',
          esSimulacion: true
        });
      }
    }

    // Ordenar eventos y calcular saldos
    eventos.sort((a, b) => a.fecha - b.fecha);
    eventos.forEach(e => {
      saldoActual += e.monto;
      e.saldoProyectado = saldoActual;
      if (saldoActual < 0) {
        e.color = 'rojo';
        e.estado = 'Déficit';
      } else if (e.monto < 0 && saldoActual < Math.abs(e.monto) * 0.5) {
        e.color = 'amarillo';
        e.estado = 'Ajustado';
      } else {
        e.color = 'verde';
        e.estado = 'Seguro';
      }
    });

    return { eventos, saldoInicial: efectivoDisponible };
  },

  /**
   * Procesa recurrencias pendientes
   * @param {Array} recurrencias - Lista de recurrencias
   * @param {Array} transacciones - Lista de transacciones
   * @returns {Array} Nuevas transacciones a agregar
   */
  procesarRecurrenciasPendientes: (recurrencias, transacciones) => {
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    const nuevasTransacciones = [];
    recurrencias.filter(r => r.activo).forEach(r => {
      const yaRegistrado = transacciones.some(t => {
        const ft = new Date(t.fecha + 'T12:00:00');
        return t.recurrenciaId === r.id && ft.getMonth() === hoy.getMonth() && ft.getFullYear() === hoy.getFullYear();
      });
      if (hoy.getDate() >= r.dia && !yaRegistrado) {
        const fechaRegistro = new Date(hoy.getFullYear(), hoy.getMonth(), r.dia);
        nuevasTransacciones.push({
          id: Date.now() + Math.random(),
          tipo: r.tipo === 'ingreso' ? 'Ingreso' : 'Gasto',
          monto: r.monto,
          descripcion: `${r.descripcion} (Auto)`,
          categoria: r.categoria || (r.tipo === 'ingreso' ? 'Salario' : 'Otros'),
          metodoPago: r.tarjetaId || 'Efectivo',
          fecha: fechaRegistro.toISOString().split('T')[0],
          esRecurrente: true,
          recurrenciaId: r.id
        });
      }
    });
    return nuevasTransacciones;
  },

  /**
   * Genera fechas de cobro para compras en cuotas
   * @param {string} fechaCompra - Fecha de compra (YYYY-MM-DD)
   * @param {number} numeroCuotas - Número de cuotas
   * @param {Object} tarjeta - Objeto tarjeta
   * @returns {Array} Array de fechas de cobro
   */
  generarFechasCuotas: (fechaCompra, numeroCuotas, tarjeta) => {
    const fechas = [];
    const fechaBase = new Date(fechaCompra + 'T12:00:00');

    for (let i = 1; i <= numeroCuotas; i++) {
      const mesCuota = new Date(fechaBase);
      mesCuota.setMonth(mesCuota.getMonth() + i);

      const fechaCobro = Calculations.calcularFechaCobro(
        mesCuota.toISOString().split('T')[0],
        tarjeta.fechaCierre,
        tarjeta.fechaPago
      );

      fechas.push({
        cuota: i,
        fecha: fechaCobro.toISOString().split('T')[0],
        estado: 'pendiente'
      });
    }

    return fechas;
  },

  /**
   * Crea transacción con información de cuotas
   * @param {Object} transaccionBase - Transacción base
   * @param {number} numeroCuotas - Número de cuotas
   * @param {Object} tarjeta - Objeto tarjeta
   * @returns {Object} Transacción con información de cuotas
   */
  crearTransaccionConCuotas: (transaccionBase, numeroCuotas, tarjeta) => {
    const montoPorCuota = Math.round((transaccionBase.monto / numeroCuotas) * 100) / 100;
    const fechasCobro = Calculations.generarFechasCuotas(transaccionBase.fecha, numeroCuotas, tarjeta);

    return {
      ...transaccionBase,
      esCuotas: true,
      cuotasInfo: {
        numeroCuotas: numeroCuotas,
        montoPorCuota: montoPorCuota,
        cuotasPagadas: 0,
        cuotasRestantes: numeroCuotas,
        fechasCobro: fechasCobro
      }
    };
  },

  /**
   * Paga cuotas automáticamente al pagar tarjeta
   * @param {Array} transacciones - Lista de transacciones
   * @param {number} tarjetaId - ID de la tarjeta
   * @param {number} montoPagado - Monto pagado
   * @returns {Array} Transacciones actualizadas
   */
  pagarCuotasAutomaticamente: (transacciones, tarjetaId, montoPagado) => {
    const comprasConCuotas = transacciones.filter(t =>
      t.esCuotas &&
      parseInt(t.metodoPago) === parseInt(tarjetaId) &&
      t.cuotasInfo.cuotasRestantes > 0
    );

    if (comprasConCuotas.length === 0) return transacciones;

    let montoRestante = montoPagado;
    const transaccionesActualizadas = [...transacciones];

    // Ordenar por fecha de compra (más antigua primero)
    comprasConCuotas.sort((a, b) => new Date(a.fecha) - new Date(b.fecha));

    comprasConCuotas.forEach(compra => {
      if (montoRestante <= 0) return;

      const montoCuota = compra.cuotasInfo.montoPorCuota;
      const cuotasPosibles = Math.floor(montoRestante / montoCuota);
      const cuotasAPagar = Math.min(cuotasPosibles, compra.cuotasInfo.cuotasRestantes);

      if (cuotasAPagar > 0) {
        const index = transaccionesActualizadas.findIndex(t => t.id === compra.id);
        if (index !== -1) {
          // Marcar cuotas como pagadas
          const cuotasPagadasAnteriores = transaccionesActualizadas[index].cuotasInfo.cuotasPagadas;
          for (let i = 0; i < cuotasAPagar; i++) {
            const indexCuota = cuotasPagadasAnteriores + i;
            if (transaccionesActualizadas[index].cuotasInfo.fechasCobro[indexCuota]) {
              transaccionesActualizadas[index].cuotasInfo.fechasCobro[indexCuota].estado = 'pagada';
            }
          }

          transaccionesActualizadas[index].cuotasInfo.cuotasPagadas += cuotasAPagar;
          transaccionesActualizadas[index].cuotasInfo.cuotasRestantes -= cuotasAPagar;

          montoRestante -= (cuotasAPagar * montoCuota);
        }
      }
    });

    return transaccionesActualizadas;
  },

  /**
   * Calcula el dinero disponible para ahorrar
   * Considera: Efectivo disponible - Deudas de tarjetas pendientes
   * @param {Array} transacciones - Lista de transacciones
   * @param {Array} tarjetas - Lista de tarjetas
   * @param {Array} metas - Lista de metas (para restar dinero ya asignado)
   * @returns {number} Dinero disponible para ahorrar
   */
  calcularDisponibleParaAhorrar: (transacciones, tarjetas, metas = []) => {
    const efectivoDisponible = Calculations.calcularEfectivoDisponible(transacciones);
    const deudasTarjetas = tarjetas.reduce((sum, t) => sum + t.saldoActual, 0);
    const dineroEnMetas = metas.reduce((sum, m) => sum + (m.montoAhorrado || 0), 0);

    // Efectivo disponible - deudas de tarjetas - dinero ya asignado en metas
    return efectivoDisponible - deudasTarjetas - dineroEnMetas;
  },

  /**
   * Calcula el cashflow promedio mensual
   * @param {Array} transacciones - Lista de transacciones
   * @param {number} meses - Número de meses a considerar (por defecto 3)
   * @returns {Object} Cashflow promedio con ingresos, gastos y neto
   */
  calcularCashflowPromedio: (transacciones, meses = 3) => {
    const hoy = new Date();
    const fechaInicio = new Date(hoy.getFullYear(), hoy.getMonth() - meses, hoy.getDate());

    const transaccionesFiltradas = transacciones.filter(t => {
      const fecha = new Date(t.fecha + 'T12:00:00');
      return fecha >= fechaInicio;
    });

    const ingresosMensuales = transaccionesFiltradas
      .filter(t => t.tipo === 'Ingreso')
      .reduce((sum, t) => sum + t.monto, 0) / meses;

    const gastosMensuales = transaccionesFiltradas
      .filter(t => t.tipo === 'Gasto')
      .reduce((sum, t) => sum + t.monto, 0) / meses;

    return {
      ingresosMensuales,
      gastosMensuales,
      cashflowNeto: ingresosMensuales - gastosMensuales
    };
  },

  /**
   * Calcula cuánto tiempo tomará alcanzar una meta
   * @param {number} montoObjetivo - Monto objetivo de la meta
   * @param {number} montoActual - Monto ya ahorrado
   * @param {number} cashflowMensual - Cashflow mensual promedio
   * @param {number} porcentajeAhorro - % del cashflow a destinar (0-100)
   * @returns {Object} Información del tiempo estimado
   */
  calcularTiempoParaMeta: (montoObjetivo, montoActual, cashflowMensual, porcentajeAhorro = 100) => {
    const montoPendiente = montoObjetivo - montoActual;
    if (montoPendiente <= 0) {
      return {
        alcanzada: true,
        meses: 0,
        aporteMensual: 0,
        fechaEstimada: new Date()
      };
    }

    if (cashflowMensual <= 0) {
      return {
        alcanzada: false,
        meses: Infinity,
        aporteMensual: 0,
        fechaEstimada: null,
        mensaje: 'No hay cashflow positivo para ahorrar'
      };
    }

    const aporteMensual = (cashflowMensual * porcentajeAhorro) / 100;
    const meses = Math.ceil(montoPendiente / aporteMensual);

    const fechaEstimada = new Date();
    fechaEstimada.setMonth(fechaEstimada.getMonth() + meses);

    return {
      alcanzada: false,
      meses,
      aporteMensual,
      fechaEstimada,
      anios: Math.floor(meses / 12),
      mesesRestantes: meses % 12
    };
  },

  /**
   * Calcula el progreso de una meta
   * @param {Object} meta - Objeto de meta
   * @returns {Object} Información del progreso
   */
  calcularProgresoMeta: (meta) => {
    const porcentaje = meta.montoObjetivo > 0
      ? Math.min((meta.montoAhorrado / meta.montoObjetivo) * 100, 100)
      : 0;

    const montoPendiente = Math.max(meta.montoObjetivo - meta.montoAhorrado, 0);
    const alcanzada = meta.montoAhorrado >= meta.montoObjetivo;

    // Calcular días desde inicio
    let diasDesdeInicio = 0;
    let diasParaObjetivo = null;

    if (meta.fechaInicio) {
      const inicio = new Date(meta.fechaInicio + 'T00:00:00');
      const hoy = new Date();
      hoy.setHours(0, 0, 0, 0);
      diasDesdeInicio = Math.floor((hoy - inicio) / (1000 * 60 * 60 * 24));
    }

    if (meta.fechaObjetivo) {
      const objetivo = new Date(meta.fechaObjetivo + 'T00:00:00');
      const hoy = new Date();
      hoy.setHours(0, 0, 0, 0);
      diasParaObjetivo = Math.floor((objetivo - hoy) / (1000 * 60 * 60 * 24));
    }

    return {
      porcentaje: porcentaje.toFixed(1),
      montoPendiente,
      alcanzada,
      diasDesdeInicio,
      diasParaObjetivo,
      atrasada: diasParaObjetivo !== null && diasParaObjetivo < 0 && !alcanzada,
      enRiesgo: diasParaObjetivo !== null && diasParaObjetivo > 0 && diasParaObjetivo < 30 && porcentaje < 80
    };
  }
};

export default Calculations;
