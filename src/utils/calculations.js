/**
 * Módulo de cálculos y lógica de negocio
 * Contiene todas las funciones de cálculo financiero
 */

const Calculations = {
  /**
   * Ajusta un día a un mes válido (maneja edge cases como día 31 en febrero)
   * @param {number} year - Año
   * @param {number} month - Mes (0-11)
   * @param {number} day - Día deseado
   * @returns {Date} Fecha ajustada
   */
  ajustarDiaAlMes: (year, month, day) => {
    // Crear fecha con el día deseado
    const fecha = new Date(year, month, day);

    // Si el mes cambió, significa que el día no existe en ese mes
    // Retornar el último día del mes deseado
    if (fecha.getMonth() !== month) {
      return new Date(year, month + 1, 0); // Día 0 del mes siguiente = último día del mes actual
    }

    return fecha;
  },

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

    // Calcular fecha de cierre (ajustada al mes)
    let yearCierre = fecha.getFullYear();
    let mesCierre = fecha.getMonth();

    if (fecha.getDate() > diaCierre) {
      mesCierre++;
      if (mesCierre > 11) {
        mesCierre = 0;
        yearCierre++;
      }
    }

    const fechaCierre = Calculations.ajustarDiaAlMes(yearCierre, mesCierre, diaCierre);

    // Calcular fecha de pago (un mes después del cierre, ajustada)
    let yearPago = fechaCierre.getFullYear();
    let mesPago = fechaCierre.getMonth() + 1;

    if (mesPago > 11) {
      mesPago = 0;
      yearPago++;
    }

    let fechaPago = Calculations.ajustarDiaAlMes(yearPago, mesPago, diaPago);
    fechaPago.setHours(0, 0, 0, 0);

    // Si la fecha de pago ya pasó, mover al siguiente mes
    if (fechaPago <= hoy) {
      mesPago++;
      if (mesPago > 11) {
        mesPago = 0;
        yearPago++;
      }
      fechaPago = Calculations.ajustarDiaAlMes(yearPago, mesPago, diaPago);
      fechaPago.setHours(0, 0, 0, 0);
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
              eventoExistente.descripcion = `${eventoExistente.descripcion.replace(' + Sim:', '')} + Sim: ${simulacion.descripcion}`;
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
          descripcion: `Simulación: ${simulacion.descripcion}`,
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
   * Calcula cuota mensual con intereses usando fórmula de amortización francesa
   * Formula: C = P × (r × (1+r)^n) / ((1+r)^n - 1)
   * Donde:
   * - C = Cuota mensual
   * - P = Principal (monto)
   * - r = Tasa mensual (TEA convertida a mensual)
   * - n = Número de cuotas
   * @param {number} monto - Monto principal
   * @param {number} tea - Tasa Efectiva Anual (%)
   * @param {number} numeroCuotas - Número de cuotas
   * @returns {Object} Información de cuotas con intereses
   */
  calcularCuotaConIntereses: (monto, tea, numeroCuotas) => {
    if (!tea || tea <= 0) {
      // Sin intereses, retornar cálculo simple
      const montoPorCuota = Math.round((monto / numeroCuotas) * 100) / 100;
      const totalCalculado = montoPorCuota * numeroCuotas;
      const diferencia = Math.round((monto - totalCalculado) * 100) / 100;

      const cronograma = [];
      for (let i = 1; i <= numeroCuotas; i++) {
        cronograma.push({
          cuota: i,
          cuotaMonto: i === numeroCuotas ? montoPorCuota + diferencia : montoPorCuota,
          capital: i === numeroCuotas ? montoPorCuota + diferencia : montoPorCuota,
          interes: 0,
          saldoRestante: monto - (montoPorCuota * i)
        });
      }

      return {
        montoPorCuota: montoPorCuota,
        montoTotal: monto,
        interesTotal: 0,
        cronograma: cronograma
      };
    }

    // Convertir TEA a tasa mensual
    const tasaMensual = Math.pow(1 + tea / 100, 1 / 12) - 1;

    // Calcular cuota con fórmula de amortización francesa
    const cuotaMensual = monto * (tasaMensual * Math.pow(1 + tasaMensual, numeroCuotas)) /
                         (Math.pow(1 + tasaMensual, numeroCuotas) - 1);

    const cuotaRedondeada = Math.round(cuotaMensual * 100) / 100;

    // Generar cronograma de pagos
    let saldoRestante = monto;
    const cronograma = [];

    for (let i = 1; i <= numeroCuotas; i++) {
      const interesCuota = Math.round(saldoRestante * tasaMensual * 100) / 100;
      const capitalCuota = Math.round((cuotaRedondeada - interesCuota) * 100) / 100;

      // Ajuste en última cuota por redondeos
      if (i === numeroCuotas) {
        const capitalReal = saldoRestante;
        const cuotaReal = Math.round((capitalReal + interesCuota) * 100) / 100;

        cronograma.push({
          cuota: i,
          cuotaMonto: cuotaReal,
          capital: capitalReal,
          interes: interesCuota,
          saldoRestante: 0
        });
      } else {
        cronograma.push({
          cuota: i,
          cuotaMonto: cuotaRedondeada,
          capital: capitalCuota,
          interes: interesCuota,
          saldoRestante: Math.round((saldoRestante - capitalCuota) * 100) / 100
        });

        saldoRestante -= capitalCuota;
      }
    }

    const montoTotal = cronograma.reduce((sum, c) => sum + c.cuotaMonto, 0);
    const interesTotal = montoTotal - monto;

    return {
      montoPorCuota: cuotaRedondeada,
      montoTotal: Math.round(montoTotal * 100) / 100,
      interesTotal: Math.round(interesTotal * 100) / 100,
      cronograma: cronograma
    };
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
        estado: 'pendiente',
        monto: 0 // Se asignará después
      });
    }

    return fechas;
  },

  /**
   * Crea transacción con información de cuotas
   * @param {Object} transaccionBase - Transacción base
   * @param {number} numeroCuotas - Número de cuotas
   * @param {Object} tarjeta - Objeto tarjeta
   * @param {boolean} tieneIntereses - Si las cuotas tienen intereses (default: false)
   * @param {number} tea - Tasa Efectiva Anual si tiene intereses (default: 0)
   * @returns {Object} Transacción con información de cuotas
   */
  crearTransaccionConCuotas: (transaccionBase, numeroCuotas, tarjeta, tieneIntereses = false, tea = 0) => {
    let cuotasData;

    if (tieneIntereses && tea > 0) {
      // Calcular con intereses usando TEA
      cuotasData = Calculations.calcularCuotaConIntereses(
        transaccionBase.monto,
        tea,
        numeroCuotas
      );
    } else {
      // Sin intereses (comportamiento actual mejorado)
      const montoPorCuota = Math.round((transaccionBase.monto / numeroCuotas) * 100) / 100;
      const totalCalculado = montoPorCuota * numeroCuotas;
      const diferencia = Math.round((transaccionBase.monto - totalCalculado) * 100) / 100;

      cuotasData = {
        montoPorCuota: montoPorCuota,
        montoTotal: transaccionBase.monto,
        interesTotal: 0,
        cronograma: Array.from({ length: numeroCuotas }, (_, i) => ({
          cuota: i + 1,
          cuotaMonto: i === numeroCuotas - 1 ? montoPorCuota + diferencia : montoPorCuota,
          capital: i === numeroCuotas - 1 ? montoPorCuota + diferencia : montoPorCuota,
          interes: 0,
          saldoRestante: 0
        }))
      };
    }

    const fechasCobro = Calculations.generarFechasCuotas(transaccionBase.fecha, numeroCuotas, tarjeta);

    // Combinar fechas con cronograma de montos
    const fechasConDetalle = fechasCobro.map((fecha, idx) => ({
      ...fecha,
      monto: cuotasData.cronograma[idx].cuotaMonto,
      interesCuota: cuotasData.cronograma[idx].interes,
      capitalCuota: cuotasData.cronograma[idx].capital
    }));

    return {
      ...transaccionBase,
      esCuotas: true,
      cuotasInfo: {
        numeroCuotas: numeroCuotas,
        montoPorCuota: cuotasData.montoPorCuota,
        tieneIntereses: tieneIntereses,
        tea: tieneIntereses ? tea : undefined,
        montoTotalConIntereses: cuotasData.montoTotal,
        interesTotal: cuotasData.interesTotal,
        cuotasPagadas: 0,
        cuotasRestantes: numeroCuotas,
        fechasCobro: fechasConDetalle,
        fechaCreacion: new Date().toISOString(),
        ultimaActualizacion: new Date().toISOString()
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
   * Marca cuotas vencidas (cuotas pendientes con fecha pasada)
   * @param {Array} transacciones - Lista de transacciones
   * @returns {Array} Transacciones con cuotas vencidas marcadas
   */
  marcarCuotasVencidas: (transacciones) => {
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);

    return transacciones.map(t => {
      if (!t.esCuotas) return t;

      const fechasActualizadas = t.cuotasInfo.fechasCobro.map(cuota => {
        if (cuota.estado === 'pendiente' || cuota.estado === 'parcial') {
          const fechaCuota = new Date(cuota.fecha + 'T12:00:00');
          fechaCuota.setHours(0, 0, 0, 0);

          if (fechaCuota < hoy) {
            return { ...cuota, estado: cuota.estado === 'parcial' ? 'parcial_vencida' : 'vencida' };
          }
        }
        return cuota;
      });

      return {
        ...t,
        cuotasInfo: {
          ...t.cuotasInfo,
          fechasCobro: fechasActualizadas
        }
      };
    });
  },

  /**
   * Calcula las cuotas que vencen en el ciclo actual de facturación
   * Incluye cuotas vencidas (no pagadas de meses anteriores) y cuotas del mes actual
   * @param {Array} transacciones - Lista de transacciones
   * @param {number} tarjetaId - ID de la tarjeta
   * @param {Object} tarjeta - Objeto tarjeta con fechaCierre y fechaPago
   * @returns {Object} Información de cuotas del mes
   */
  calcularCuotasDelMes: (transacciones, tarjetaId, tarjeta) => {
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);

    // Calcular el rango del ciclo de facturación actual
    // El ciclo va desde fechaCierre del mes anterior hasta fechaCierre del mes actual
    let yearCierre = hoy.getFullYear();
    let mesCierre = hoy.getMonth();

    // Si hoy es después del día de cierre, el ciclo es del cierre de este mes al siguiente
    if (hoy.getDate() > tarjeta.fechaCierre) {
      mesCierre++;
      if (mesCierre > 11) {
        mesCierre = 0;
        yearCierre++;
      }
    }

    const fechaCierreActual = Calculations.ajustarDiaAlMes(yearCierre, mesCierre, tarjeta.fechaCierre);

    // Fecha de pago es aproximadamente un mes después del cierre
    let yearPago = fechaCierreActual.getFullYear();
    let mesPago = fechaCierreActual.getMonth() + 1;
    if (mesPago > 11) {
      mesPago = 0;
      yearPago++;
    }
    const fechaPagoActual = Calculations.ajustarDiaAlMes(yearPago, mesPago, tarjeta.fechaPago);

    // Buscar cuotas pendientes y vencidas para esta tarjeta
    const comprasConCuotas = transacciones.filter(t =>
      t.esCuotas &&
      parseInt(t.metodoPago) === parseInt(tarjetaId) &&
      t.cuotasInfo.cuotasRestantes > 0
    );

    let cuotasDelMes = [];
    let totalCuotasDelMes = 0;
    let cuotasVencidas = [];
    let totalCuotasVencidas = 0;

    comprasConCuotas.forEach(compra => {
      compra.cuotasInfo.fechasCobro.forEach((cuota, idx) => {
        if (cuota.estado === 'pagada') return;

        const fechaCuota = new Date(cuota.fecha + 'T12:00:00');
        fechaCuota.setHours(0, 0, 0, 0);

        // Cuota vencida (fecha pasada y no pagada)
        if (cuota.estado === 'vencida' || cuota.estado === 'parcial_vencida' || fechaCuota < hoy) {
          const montoPendiente = cuota.montoPendiente || cuota.monto;
          cuotasVencidas.push({
            transaccionId: compra.id,
            descripcion: compra.descripcion,
            numeroCuota: cuota.cuota,
            totalCuotas: compra.cuotasInfo.numeroCuotas,
            monto: montoPendiente,
            fecha: cuota.fecha,
            tieneIntereses: compra.cuotasInfo.tieneIntereses
          });
          totalCuotasVencidas += montoPendiente;
        }
        // Cuota del mes actual (vence antes o en la fecha de pago actual)
        else if (fechaCuota <= fechaPagoActual) {
          const montoPendiente = cuota.montoPendiente || cuota.monto;
          cuotasDelMes.push({
            transaccionId: compra.id,
            descripcion: compra.descripcion,
            numeroCuota: cuota.cuota,
            totalCuotas: compra.cuotasInfo.numeroCuotas,
            monto: montoPendiente,
            fecha: cuota.fecha,
            tieneIntereses: compra.cuotasInfo.tieneIntereses
          });
          totalCuotasDelMes += montoPendiente;
        }
      });
    });

    return {
      cuotasDelMes,
      totalCuotasDelMes: Math.round(totalCuotasDelMes * 100) / 100,
      cuotasVencidas,
      totalCuotasVencidas: Math.round(totalCuotasVencidas * 100) / 100,
      totalCuotasPendientes: Math.round((totalCuotasDelMes + totalCuotasVencidas) * 100) / 100,
      fechaCierre: fechaCierreActual.toISOString().split('T')[0],
      fechaPago: fechaPagoActual.toISOString().split('T')[0]
    };
  },

  /**
   * Calcula el estado de cuenta completo de una tarjeta
   * Separa: saldo rotativo (compras sin cuotas) + cuotas del mes
   * Incluye crédito bloqueado por compras en cuotas activas
   * @param {Array} transacciones - Lista de transacciones
   * @param {Object} tarjeta - Objeto tarjeta
   * @returns {Object} Estado de cuenta desglosado
   */
  calcularEstadoCuentaTarjeta: (transacciones, tarjeta) => {
    // El saldoActual de la tarjeta ahora solo representa compras SIN cuotas (rotativo)
    const saldoRotativo = tarjeta.saldoActual || 0;

    // Obtener cuotas del mes
    const cuotasInfo = Calculations.calcularCuotasDelMes(transacciones, tarjeta.id, tarjeta);

    // Calcular crédito bloqueado por cuotas pendientes
    // El crédito se bloquea por el monto TOTAL de cuotas restantes, no solo las del mes
    const comprasConCuotas = transacciones.filter(t =>
      t.esCuotas &&
      parseInt(t.metodoPago) === parseInt(tarjeta.id) &&
      t.cuotasInfo.cuotasRestantes > 0
    );

    // Crédito bloqueado = suma de (cuotas restantes * monto por cuota) para cada compra
    const creditoBloqueado = comprasConCuotas.reduce((sum, compra) => {
      // Calcular el monto pendiente real considerando pagos parciales
      const cuotasPendientes = compra.cuotasInfo.fechasCobro.filter(c =>
        c.estado !== 'pagada'
      );
      const montoBloqueado = cuotasPendientes.reduce((s, c) =>
        s + (c.montoPendiente || c.monto), 0
      );
      return sum + montoBloqueado;
    }, 0);

    // Crédito disponible = límite - rotativo - crédito bloqueado por cuotas
    const creditoDisponible = Math.max(0, tarjeta.limite - saldoRotativo - creditoBloqueado);

    // Pago total del mes = rotativo + cuotas del mes + cuotas vencidas
    const pagoTotalMes = saldoRotativo + cuotasInfo.totalCuotasPendientes;

    // Pago mínimo = cuotas del mes (obligatorias) + rotativo/36 (mínimo legal)
    // Las cuotas son obligatorias para no perder el beneficio de cuotas sin intereses
    const minimoRotativo = saldoRotativo > 0 ? Math.max(saldoRotativo / 36, 25) : 0;
    const pagoMinimo = Math.max(
      cuotasInfo.totalCuotasPendientes + minimoRotativo,
      25 // Mínimo absoluto
    );

    return {
      saldoRotativo: Math.round(saldoRotativo * 100) / 100,
      cuotasDelMes: cuotasInfo.cuotasDelMes,
      totalCuotasDelMes: cuotasInfo.totalCuotasDelMes,
      cuotasVencidas: cuotasInfo.cuotasVencidas,
      totalCuotasVencidas: cuotasInfo.totalCuotasVencidas,
      totalCuotasPendientes: cuotasInfo.totalCuotasPendientes,
      creditoBloqueado: Math.round(creditoBloqueado * 100) / 100,
      creditoDisponible: Math.round(creditoDisponible * 100) / 100,
      creditoUsado: Math.round((saldoRotativo + creditoBloqueado) * 100) / 100,
      pagoTotalMes: Math.round(pagoTotalMes * 100) / 100,
      pagoMinimo: Math.round(Math.min(pagoMinimo, pagoTotalMes) * 100) / 100,
      fechaCierre: cuotasInfo.fechaCierre,
      fechaPago: cuotasInfo.fechaPago,
      tieneCuotas: cuotasInfo.cuotasDelMes.length > 0 || cuotasInfo.cuotasVencidas.length > 0,
      comprasEnCuotas: comprasConCuotas.length
    };
  },

  /**
   * Procesa el pago de una tarjeta de crédito
   * Prioriza: 1) Cuotas vencidas, 2) Cuotas del mes, 3) Saldo rotativo
   * @param {Array} transacciones - Lista de transacciones
   * @param {Object} tarjeta - Objeto tarjeta
   * @param {number} montoPago - Monto a pagar
   * @returns {Object} Resultado del pago con transacciones actualizadas
   */
  procesarPagoTarjeta: (transacciones, tarjeta, montoPago) => {
    const estadoCuenta = Calculations.calcularEstadoCuentaTarjeta(transacciones, tarjeta);
    let montoRestante = montoPago;
    let transaccionesActualizadas = [...transacciones];

    const detallesPago = {
      cuotasPagadas: [],
      montoCuotasPagado: 0,
      montoRotativoPagado: 0,
      nuevoSaldoRotativo: estadoCuenta.saldoRotativo,
      cuotasAfectadas: 0
    };

    // 1. Primero pagar cuotas vencidas (orden: más antiguas primero)
    const todasLasCuotas = [...estadoCuenta.cuotasVencidas, ...estadoCuenta.cuotasDelMes];

    // Ordenar por fecha (más antigua primero)
    todasLasCuotas.sort((a, b) => new Date(a.fecha) - new Date(b.fecha));

    for (const cuotaInfo of todasLasCuotas) {
      if (montoRestante <= 0) break;

      const montoCuota = cuotaInfo.monto;

      if (montoRestante >= montoCuota) {
        // Pagar cuota completa
        montoRestante -= montoCuota;
        detallesPago.montoCuotasPagado += montoCuota;
        detallesPago.cuotasAfectadas++;

        detallesPago.cuotasPagadas.push({
          descripcion: cuotaInfo.descripcion,
          cuota: `${cuotaInfo.numeroCuota}/${cuotaInfo.totalCuotas}`,
          monto: montoCuota,
          completa: true
        });

        // Marcar cuota como pagada en la transacción
        const idxTransaccion = transaccionesActualizadas.findIndex(t => t.id === cuotaInfo.transaccionId);
        if (idxTransaccion !== -1) {
          const t = transaccionesActualizadas[idxTransaccion];
          const idxCuota = t.cuotasInfo.fechasCobro.findIndex(c => c.cuota === cuotaInfo.numeroCuota);
          if (idxCuota !== -1) {
            transaccionesActualizadas[idxTransaccion] = {
              ...t,
              cuotasInfo: {
                ...t.cuotasInfo,
                cuotasPagadas: t.cuotasInfo.cuotasPagadas + 1,
                cuotasRestantes: t.cuotasInfo.cuotasRestantes - 1,
                fechasCobro: t.cuotasInfo.fechasCobro.map((c, i) =>
                  i === idxCuota ? { ...c, estado: 'pagada', montoPendiente: 0 } : c
                ),
                ultimaActualizacion: new Date().toISOString()
              }
            };
          }
        }
      } else if (montoRestante > 0) {
        // Pago parcial de cuota
        const montoParcial = montoRestante;
        detallesPago.montoCuotasPagado += montoParcial;

        detallesPago.cuotasPagadas.push({
          descripcion: cuotaInfo.descripcion,
          cuota: `${cuotaInfo.numeroCuota}/${cuotaInfo.totalCuotas}`,
          monto: montoParcial,
          completa: false,
          pendiente: montoCuota - montoParcial
        });

        // Marcar cuota como parcial en la transacción
        const idxTransaccion = transaccionesActualizadas.findIndex(t => t.id === cuotaInfo.transaccionId);
        if (idxTransaccion !== -1) {
          const t = transaccionesActualizadas[idxTransaccion];
          const idxCuota = t.cuotasInfo.fechasCobro.findIndex(c => c.cuota === cuotaInfo.numeroCuota);
          if (idxCuota !== -1) {
            transaccionesActualizadas[idxTransaccion] = {
              ...t,
              cuotasInfo: {
                ...t.cuotasInfo,
                fechasCobro: t.cuotasInfo.fechasCobro.map((c, i) =>
                  i === idxCuota ? { ...c, estado: 'parcial', montoPendiente: montoCuota - montoParcial } : c
                ),
                ultimaActualizacion: new Date().toISOString()
              }
            };
          }
        }

        montoRestante = 0;
      }
    }

    // 2. Luego aplicar el resto al saldo rotativo
    if (montoRestante > 0 && estadoCuenta.saldoRotativo > 0) {
      const pagoRotativo = Math.min(montoRestante, estadoCuenta.saldoRotativo);
      detallesPago.montoRotativoPagado = pagoRotativo;
      detallesPago.nuevoSaldoRotativo = estadoCuenta.saldoRotativo - pagoRotativo;
      montoRestante -= pagoRotativo;
    }

    return {
      transaccionesActualizadas,
      detallesPago,
      nuevoSaldoTarjeta: Math.round(detallesPago.nuevoSaldoRotativo * 100) / 100,
      montoSobrante: Math.round(montoRestante * 100) / 100
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
