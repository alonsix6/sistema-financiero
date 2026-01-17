/**
 * Dashboard principal del sistema financiero
 * Contiene todas las vistas y funcionalidades principales
 */

import React, { useState, useEffect, useMemo, lazy, Suspense } from 'react';
import {
  CreditCard, Wallet, TrendingUp, TrendingDown, Target, RefreshCw,
  Plus, Minus, Trash2, ChevronLeft, ChevronRight, Calendar, Clock, AlertTriangle,
  CheckCircle, DollarSign, PieChart, BarChart3, ArrowUpRight, ArrowDownRight,
  FileText, Settings, Moon, Sun, Home, Receipt, Repeat, LineChart, Briefcase,
  AlertCircle, Info, Landmark, ShoppingCart, Car, Utensils, Gamepad2, Shirt,
  Pill, GraduationCap, Gift, Lightbulb, Smartphone, Building2, Banknote, Coins,
  CircleDollarSign, HandCoins, Percent, Sparkles, Activity, LogOut
} from 'lucide-react';
import * as Icons from 'lucide-react';
import { CATEGORIAS, TIPOS_INGRESO, BANCOS, CATEGORIAS_METAS } from '../utils/constants.js';
import Calculations from '../utils/calculations.js';
import Modal from './Modal.jsx';

// Lazy loading de componentes pesados
const GraficoCategorias = lazy(() => import('./GraficoCategorias.jsx'));
const FormularioTarjeta = lazy(() => import('./forms/FormularioTarjeta.jsx'));
const FormularioTransaccion = lazy(() => import('./forms/FormularioTransaccion.jsx'));
const FormularioRecurrencia = lazy(() => import('./forms/FormularioRecurrencia.jsx'));
const FormularioPagoTarjeta = lazy(() => import('./forms/FormularioPagoTarjeta.jsx'));
const FormularioPagoAdelantado = lazy(() => import('./forms/FormularioPagoAdelantado.jsx'));
const SimuladorMovimiento = lazy(() => import('./forms/SimuladorMovimiento.jsx'));
const FormularioMeta = lazy(() => import('./forms/FormularioMeta.jsx'));
const FormularioAporteMeta = lazy(() => import('./forms/FormularioAporteMeta.jsx'));
const StockInvestments = lazy(() => import('./StockInvestments.jsx'));
const SeccionCuotas = lazy(() => import('./SeccionCuotas.jsx'));

// Componente de loading
const LoadingSpinner = () => (
  <div className="flex items-center justify-center py-8">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
  </div>
);

const Dashboard = ({ userData, onUpdateData }) => {
  // Estados UI
  const [darkMode, setDarkMode] = useState(false);
  const [activeTab, setActiveTab] = useState('inicio');

  // Estados Modales
  const [modalTarjeta, setModalTarjeta] = useState(false);
  const [modalTransaccion, setModalTransaccion] = useState(false);
  const [modalRecurrencia, setModalRecurrencia] = useState(false);
  const [modalSimulador, setModalSimulador] = useState(false);
  const [modalPagoTarjeta, setModalPagoTarjeta] = useState(false);
  const [modalPagoAdelantado, setModalPagoAdelantado] = useState(false);
  const [modalMeta, setModalMeta] = useState(false);
  const [modalAporteMeta, setModalAporteMeta] = useState(false);
  const [modalHistorialCuotas, setModalHistorialCuotas] = useState(false);

  // Estados de Formularios
  const [tipoTransaccion, setTipoTransaccion] = useState('Gasto');
  const [tarjetaEditar, setTarjetaEditar] = useState(null);
  const [tarjetaPagar, setTarjetaPagar] = useState(null);
  const [transaccionEditar, setTransaccionEditar] = useState(null);
  const [transaccionPagarAdelantado, setTransaccionPagarAdelantado] = useState(null);
  const [recurrenciaEditar, setRecurrenciaEditar] = useState(null);
  const [simulacionActual, setSimulacionActual] = useState(null);
  const [proyeccionSimulada, setProyeccionSimulada] = useState(null);
  const [metaEditar, setMetaEditar] = useState(null);
  const [metaAportar, setMetaAportar] = useState(null);
  const [transaccionHistorial, setTransaccionHistorial] = useState(null);

  // Filtros de fecha
  const hoy = new Date();
  const primerDiaMes = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
  const [fechaInicio, setFechaInicio] = useState(primerDiaMes.toISOString().split('T')[0]);
  const [fechaFin, setFechaFin] = useState(hoy.toISOString().split('T')[0]);

  // Paginación de transacciones
  const [paginaActual, setPaginaActual] = useState(1);
  const transaccionesPorPagina = 50;
  const MAX_TRANSACCIONES = 10000; // Límite máximo para performance

  // Procesar recurrencias pendientes al cargar
  useEffect(() => {
    const nuevasTransacciones = Calculations.procesarRecurrenciasPendientes(
      userData.recurrencias || [],
      userData.transacciones
    );
    if (nuevasTransacciones.length > 0) {
      const transaccionesActualizadas = [...userData.transacciones, ...nuevasTransacciones];
      let tarjetasActualizadas = userData.tarjetas;
      nuevasTransacciones.forEach(t => {
        if (t.tipo === 'Gasto' && t.metodoPago !== 'Efectivo') {
          tarjetasActualizadas = tarjetasActualizadas.map(tarjeta => {
            if (tarjeta.id === parseInt(t.metodoPago)) {
              return { ...tarjeta, saldoActual: tarjeta.saldoActual + t.monto };
            }
            return tarjeta;
          });
        }
      });
      onUpdateData({ ...userData, transacciones: transaccionesActualizadas, tarjetas: tarjetasActualizadas });
    }
  }, []);

  // Marcar cuotas vencidas y notificar cuotas próximas al cargar
  useEffect(() => {
    // Marcar cuotas vencidas
    const transaccionesConVencidas = Calculations.marcarCuotasVencidas(userData.transacciones);
    const hayDiferencias = JSON.stringify(transaccionesConVencidas) !== JSON.stringify(userData.transacciones);

    if (hayDiferencias) {
      onUpdateData({ ...userData, transacciones: transaccionesConVencidas });
    }

    // Notificar cuotas próximas (dentro de 7 días)
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);

    const enUnaSemana = new Date(hoy);
    enUnaSemana.setDate(enUnaSemana.getDate() + 7);

    const cuotasProximas = userData.transacciones
      .filter(t => t.esCuotas && t.cuotasInfo.cuotasRestantes > 0)
      .flatMap(t => {
        const tarjeta = userData.tarjetas.find(tj => tj.id === parseInt(t.metodoPago));

        return t.cuotasInfo.fechasCobro
          .filter(c => c.estado === 'pendiente' || c.estado === 'parcial')
          .map(c => ({
            fecha: new Date(c.fecha + 'T12:00:00'),
            descripcion: t.descripcion,
            monto: c.estado === 'parcial' ? (c.montoPendiente || c.monto) : (c.monto || t.cuotasInfo.montoPorCuota),
            tarjeta: tarjeta?.nombre || 'Tarjeta',
            cuota: c.cuota,
            total: t.cuotasInfo.numeroCuotas
          }))
          .filter(c => c.fecha >= hoy && c.fecha <= enUnaSemana);
      })
      .sort((a, b) => a.fecha - b.fecha);

    if (cuotasProximas.length > 0) {
      // Mostrar notificación (solo una vez por sesión)
      const yaNotificado = sessionStorage.getItem('cuotas_notificadas');

      if (!yaNotificado) {
        const mensaje = `Tienes ${cuotasProximas.length} cuota(s) próxima(s) en los próximos 7 días:\n\n` +
          cuotasProximas.slice(0, 3).map(c =>
            `• ${c.descripcion} - S/ ${c.monto.toFixed(2)} (${c.fecha.toLocaleDateString('es-PE')})`
          ).join('\n') +
          (cuotasProximas.length > 3 ? `\n\n... y ${cuotasProximas.length - 3} más` : '');

        // Usar timeout para no bloquear carga inicial
        setTimeout(() => {
          if (confirm(mensaje + '\n\n¿Ver sección de cuotas?')) {
            setActiveTab('cuotas');
          }
          sessionStorage.setItem('cuotas_notificadas', 'true');
        }, 1500);
      }
    }
  }, [userData.transacciones]);

  // Cálculos memoizados
  const resumen = useMemo(() =>
    Calculations.obtenerResumenPorPeriodo(userData.transacciones, fechaInicio, fechaFin),
    [userData.transacciones, fechaInicio, fechaFin]
  );
  const cashflowTotal = useMemo(() =>
    Calculations.obtenerCashflowTotal(userData.transacciones),
    [userData.transacciones]
  );
  const efectivoDisponible = useMemo(() =>
    Calculations.calcularEfectivoDisponible(userData.transacciones),
    [userData.transacciones]
  );
  const proximosPagos = useMemo(() =>
    Calculations.obtenerProximosPagos(userData.tarjetas),
    [userData.tarjetas]
  );
  const gastosPorCategoria = useMemo(() =>
    Calculations.obtenerGastosPorCategoria(userData.transacciones, fechaInicio, fechaFin),
    [userData.transacciones, fechaInicio, fechaFin]
  );
  const proyeccion = useMemo(() =>
    Calculations.calcularProyeccion(userData.tarjetas, userData.transacciones, userData.recurrencias || [], 6),
    [userData.tarjetas, userData.transacciones, userData.recurrencias]
  );
  const disponibleParaAhorrar = useMemo(() =>
    Calculations.calcularDisponibleParaAhorrar(userData.transacciones, userData.tarjetas, userData.metas || []),
    [userData.transacciones, userData.tarjetas, userData.metas]
  );
  const cashflowPromedio = useMemo(() =>
    Calculations.calcularCashflowPromedio(userData.transacciones, 3),
    [userData.transacciones]
  );

  // Handlers de Tarjetas
  const handleSaveTarjeta = (tarjeta) => {
    let nuevasTarjetas;
    if (tarjetaEditar) {
      nuevasTarjetas = userData.tarjetas.map(t => t.id === tarjeta.id ? tarjeta : t);
    } else {
      nuevasTarjetas = [...userData.tarjetas, tarjeta];
    }
    onUpdateData({ ...userData, tarjetas: nuevasTarjetas });
    setModalTarjeta(false);
    setTarjetaEditar(null);
  };

  const handleDeleteTarjeta = (id) => {
    const nuevasTarjetas = userData.tarjetas.filter(t => t.id !== id);
    onUpdateData({ ...userData, tarjetas: nuevasTarjetas });
    setModalTarjeta(false);
    setTarjetaEditar(null);
  };

  const handlePagarTarjeta = (monto) => {
    if (!tarjetaPagar) return;

    // Identificar compras con cuotas pendientes en esta tarjeta
    const comprasConCuotas = userData.transacciones.filter(t =>
      t.esCuotas &&
      parseInt(t.metodoPago) === tarjetaPagar.id &&
      t.cuotasInfo.cuotasRestantes > 0
    );

    const totalCuotasPendientes = comprasConCuotas.reduce((sum, c) =>
      sum + (c.cuotasInfo.cuotasRestantes * c.cuotasInfo.montoPorCuota), 0
    );

    let transaccionPago = {
      id: Date.now(),
      tipo: 'PagoTarjeta',
      monto: monto,
      descripcion: `Pago ${tarjetaPagar.nombre}`,
      categoria: 'Pago Tarjeta',
      metodoPago: 'Efectivo',
      fecha: new Date().toISOString().split('T')[0],
      tarjetaId: tarjetaPagar.id
    };

    let nuevasTransacciones = [...userData.transacciones, transaccionPago];

    // Si hay cuotas pendientes y el monto puede cubrir alguna, preguntar
    if (comprasConCuotas.length > 0 && monto > 0 && totalCuotasPendientes > 0) {
      const mensaje = `Tienes S/ ${totalCuotasPendientes.toFixed(2)} en ${comprasConCuotas.length} compra(s) en cuotas pendientes.\n\n¿Deseas usar parte del pago (S/ ${monto.toFixed(2)}) para pagar cuotas automáticamente?\n\nSe pagarán cuotas completas empezando por las más antiguas.`;

      if (confirm(mensaje)) {
        // Guardar estado anterior para comparar
        const transaccionesAntes = [...nuevasTransacciones];

        // Pagar cuotas automáticamente
        nuevasTransacciones = Calculations.pagarCuotasAutomaticamente(
          nuevasTransacciones,
          tarjetaPagar.id,
          monto
        );

        // Calcular cuántas cuotas se pagaron
        let cuotasPagadasTotal = 0;
        const comprasAfectadas = [];

        comprasConCuotas.forEach(compra => {
          const transaccionActualizada = nuevasTransacciones.find(t => t.id === compra.id);
          if (transaccionActualizada) {
            const cuotasPagadasNuevas = transaccionActualizada.cuotasInfo.cuotasPagadas - compra.cuotasInfo.cuotasPagadas;
            if (cuotasPagadasNuevas > 0) {
              cuotasPagadasTotal += cuotasPagadasNuevas;
              comprasAfectadas.push({
                descripcion: compra.descripcion,
                cuotas: cuotasPagadasNuevas,
                monto: cuotasPagadasNuevas * compra.cuotasInfo.montoPorCuota
              });
            }
          }
        });

        // Actualizar descripción de transacción de pago con info de cuotas
        if (cuotasPagadasTotal > 0) {
          const detalleCompras = comprasAfectadas.map(c =>
            `${c.descripcion} (${c.cuotas} cuota${c.cuotas > 1 ? 's' : ''})`
          ).join(', ');

          nuevasTransacciones = nuevasTransacciones.map(t => {
            if (t.id === transaccionPago.id) {
              return {
                ...t,
                descripcion: `${t.descripcion} - Incluye pago de ${cuotasPagadasTotal} cuota(s): ${detalleCompras}`,
                esPagoAutomatico: true,
                cuotasAfectadas: comprasAfectadas
              };
            }
            return t;
          });
        }
      }
    }

    const tarjetasActualizadas = userData.tarjetas.map(t => {
      if (t.id === tarjetaPagar.id) {
        return { ...t, saldoActual: Math.max(0, t.saldoActual - monto) };
      }
      return t;
    });

    onUpdateData({ ...userData, transacciones: nuevasTransacciones, tarjetas: tarjetasActualizadas });
    setModalPagoTarjeta(false);
    setTarjetaPagar(null);
    alert(`Pago de S/ ${monto.toFixed(2)} registrado correctamente`);
  };

  // Handlers de Transacciones
  const handleSaveTransaccion = (transaccion) => {
    let nuevasTransacciones;
    let nuevasTarjetas = userData.tarjetas;
    if (transaccionEditar) {
      const transaccionAntigua = userData.transacciones.find(t => t.id === transaccion.id);
      if (transaccionAntigua && transaccionAntigua.tipo === 'Gasto' && transaccionAntigua.metodoPago !== 'Efectivo') {
        nuevasTarjetas = nuevasTarjetas.map(t => {
          if (t.id === parseInt(transaccionAntigua.metodoPago)) {
            return { ...t, saldoActual: t.saldoActual - transaccionAntigua.monto };
          }
          return t;
        });
      }
      nuevasTransacciones = userData.transacciones.map(t => t.id === transaccion.id ? transaccion : t);
    } else {
      nuevasTransacciones = [...userData.transacciones, transaccion];
    }
    if (transaccion.tipo === 'Gasto' && transaccion.metodoPago !== 'Efectivo') {
      nuevasTarjetas = nuevasTarjetas.map(t => {
        if (t.id === parseInt(transaccion.metodoPago)) {
          return { ...t, saldoActual: t.saldoActual + transaccion.monto };
        }
        return t;
      });
    }
    onUpdateData({ ...userData, transacciones: nuevasTransacciones, tarjetas: nuevasTarjetas });
    setModalTransaccion(false);
    setTransaccionEditar(null);
  };

  const handleDeleteTransaccion = (id) => {
    const transaccion = userData.transacciones.find(t => t.id === id);

    // Mensaje personalizado para compras en cuotas
    let mensaje = '¿Eliminar esta transacción?';

    if (transaccion && transaccion.esCuotas) {
      const cuotasPagadas = transaccion.cuotasInfo.cuotasPagadas;
      const montoPagado = cuotasPagadas * transaccion.cuotasInfo.montoPorCuota;
      const cuotasRestantes = transaccion.cuotasInfo.cuotasRestantes;
      const montoRestante = cuotasRestantes * transaccion.cuotasInfo.montoPorCuota;

      mensaje = `ELIMINAR COMPRA EN CUOTAS\n\n` +
                `Compra: ${transaccion.descripcion}\n` +
                `Monto original: S/ ${transaccion.monto.toFixed(2)}\n\n` +
                `Estado actual:\n` +
                `• Cuotas pagadas: ${cuotasPagadas}/${transaccion.cuotasInfo.numeroCuotas} (S/ ${montoPagado.toFixed(2)})\n` +
                `• Cuotas pendientes: ${cuotasRestantes} (S/ ${montoRestante.toFixed(2)})\n\n`;

      if (cuotasPagadas > 0) {
        mensaje += `IMPORTANTE: Ya pagaste ${cuotasPagadas} cuota(s) (S/ ${montoPagado.toFixed(2)}).\n` +
                   `Al eliminar, esta información se perderá.\n\n`;
      }

      mensaje += `Al eliminar, se liberarán S/ ${montoRestante.toFixed(2)} de crédito de tu tarjeta.\n\n` +
                 `¿Estás seguro de eliminar esta compra?`;
    }

    if (!confirm(mensaje)) return;

    let nuevasTarjetas = userData.tarjetas;

    // Liberar crédito de tarjeta si es gasto con tarjeta
    if (transaccion && transaccion.tipo === 'Gasto' && transaccion.metodoPago !== 'Efectivo') {
      nuevasTarjetas = nuevasTarjetas.map(t => {
        if (t.id === parseInt(transaccion.metodoPago)) {
          // Si es compra en cuotas, solo liberar el monto restante
          const montoALiberar = transaccion.esCuotas
            ? (transaccion.cuotasInfo.cuotasRestantes * transaccion.cuotasInfo.montoPorCuota)
            : transaccion.monto;
          return { ...t, saldoActual: Math.max(0, t.saldoActual - montoALiberar) };
        }
        return t;
      });
    }

    // Restaurar crédito si es pago de tarjeta
    if (transaccion && transaccion.tipo === 'PagoTarjeta') {
      nuevasTarjetas = nuevasTarjetas.map(t => {
        if (t.id === transaccion.tarjetaId) {
          return { ...t, saldoActual: t.saldoActual + transaccion.monto };
        }
        return t;
      });
    }

    const nuevasTransacciones = userData.transacciones.filter(t => t.id !== id);
    onUpdateData({ ...userData, transacciones: nuevasTransacciones, tarjetas: nuevasTarjetas });
  };

  // Handlers de Recurrencias
  const handleSaveRecurrencia = (recurrencia) => {
    let nuevasRecurrencias;
    if (recurrenciaEditar) {
      nuevasRecurrencias = userData.recurrencias.map(r => r.id === recurrencia.id ? recurrencia : r);
    } else {
      nuevasRecurrencias = [...(userData.recurrencias || []), recurrencia];
    }
    onUpdateData({ ...userData, recurrencias: nuevasRecurrencias });
    setModalRecurrencia(false);
    setRecurrenciaEditar(null);
  };

  const handleDeleteRecurrencia = (id) => {
    const nuevasRecurrencias = userData.recurrencias.filter(r => r.id !== id);
    onUpdateData({ ...userData, recurrencias: nuevasRecurrencias });
    setModalRecurrencia(false);
    setRecurrenciaEditar(null);
  };

  // Handler de Simulación
  const handleSimular = (simulacion) => {
    setSimulacionActual(simulacion);
    const proyeccionConSimulacion = Calculations.calcularProyeccion(
      userData.tarjetas,
      userData.transacciones,
      userData.recurrencias || [],
      6,
      simulacion
    );
    setProyeccionSimulada(proyeccionConSimulacion);
  };

  // Handler de Favoritos de Inversiones
  const handleUpdateFavorites = (newFavorites) => {
    onUpdateData({ ...userData, stockFavorites: newFavorites });
  };

  // Handler de Inversiones en Bolsa
  const handleUpdateInvestments = (newInvestments) => {
    onUpdateData({ ...userData, stockInvestments: newInvestments });
  };

  // Handler para deducir inversión del efectivo disponible (ahora en USD)
  const handleDeductFromCash = (montoUSD, symbol, name) => {
    // Crear transacción de inversión en USD
    const transaccionInversion = {
      id: Date.now(),
      tipo: 'Gasto',
      monto: montoUSD,
      descripcion: `Inversión en ${symbol} (${name})`,
      categoria: 'Inversiones',
      metodoPago: 'Efectivo',
      fecha: new Date().toISOString().split('T')[0],
      esInversion: true,
      symbolInversion: symbol
    };

    const nuevasTransacciones = [...userData.transacciones, transaccionInversion];
    onUpdateData({ ...userData, transacciones: nuevasTransacciones });
  };

  // Handler de Pago Adelantado de Cuotas
  const handlePagarCuotasAdelantadas = (cuotasAPagar, montoTotal, montoParcial = 0) => {
    if (!transaccionPagarAdelantado) return;

    // Descripción del pago
    const descripcionPago = montoParcial > 0
      ? `Pago adelantado ${transaccionPagarAdelantado.descripcion} (${cuotasAPagar} cuotas + S/ ${montoParcial.toFixed(2)} parcial)`
      : `Pago adelantado ${transaccionPagarAdelantado.descripcion} (${cuotasAPagar} cuotas)`;

    // Crear transacción de pago adelantado
    const transaccionPago = {
      id: Date.now(),
      tipo: 'PagoTarjeta',
      monto: montoTotal,
      descripcion: descripcionPago,
      categoria: 'Pago Cuotas Adelantadas',
      metodoPago: 'Efectivo',
      fecha: new Date().toISOString().split('T')[0],
      tarjetaId: parseInt(transaccionPagarAdelantado.metodoPago),
      tipoPago: 'adelantado',
      esPagoAdelantado: true,
      transaccionOriginalId: transaccionPagarAdelantado.id,
      cuotasPagadas: cuotasAPagar,
      montoParcial: montoParcial
    };

    // Actualizar la transacción con cuotas
    const transaccionesActualizadas = userData.transacciones.map(t => {
      if (t.id === transaccionPagarAdelantado.id) {
        const cuotasPagadasAntes = t.cuotasInfo.cuotasPagadas;

        // Marcar cuotas como pagadas
        const nuevasFechasCobro = t.cuotasInfo.fechasCobro.map((cuota, idx) => {
          // Cuotas completas
          if (idx >= cuotasPagadasAntes && idx < cuotasPagadasAntes + cuotasAPagar) {
            return { ...cuota, estado: 'pagada' };
          }

          // Si hay pago parcial, marcar la siguiente cuota como parcial
          if (montoParcial > 0 && idx === cuotasPagadasAntes + cuotasAPagar) {
            return {
              ...cuota,
              estado: 'parcial',
              pagoParcial: montoParcial,
              montoPendiente: Math.round((cuota.monto - montoParcial) * 100) / 100
            };
          }

          return cuota;
        });

        // Calcular cuotas restantes
        const cuotasConParcial = montoParcial > 0 ? 1 : 0;
        const nuevasCuotasRestantes = t.cuotasInfo.cuotasRestantes - cuotasAPagar - cuotasConParcial;

        return {
          ...t,
          cuotasInfo: {
            ...t.cuotasInfo,
            cuotasPagadas: t.cuotasInfo.cuotasPagadas + cuotasAPagar + cuotasConParcial,
            cuotasRestantes: nuevasCuotasRestantes,
            fechasCobro: nuevasFechasCobro,
            ultimaActualizacion: new Date().toISOString(),
            pagosAdelantados: [
              ...(t.cuotasInfo.pagosAdelantados || []),
              {
                fecha: new Date().toISOString().split('T')[0],
                cuotasPagadas: cuotasAPagar,
                montoTotal: montoTotal,
                montoParcial: montoParcial,
                transaccionPagoId: transaccionPago.id
              }
            ]
          }
        };
      }
      return t;
    });

    // Actualizar saldo de tarjeta (liberar crédito)
    const tarjetasActualizadas = userData.tarjetas.map(t => {
      if (t.id === parseInt(transaccionPagarAdelantado.metodoPago)) {
        return { ...t, saldoActual: Math.max(0, t.saldoActual - montoTotal) };
      }
      return t;
    });

    // Agregar transacción de pago
    const nuevasTransacciones = [...transaccionesActualizadas, transaccionPago];

    onUpdateData({
      ...userData,
      transacciones: nuevasTransacciones,
      tarjetas: tarjetasActualizadas
    });

    setModalPagoAdelantado(false);
    setTransaccionPagarAdelantado(null);

    const mensajeExito = montoParcial > 0
      ? `Pago registrado correctamente\n\nTarjeta: ${cuotasAPagar} cuota(s) completa(s) pagadas\nMonto: S/ ${montoParcial.toFixed(2)} abonados a la siguiente cuota\n\nFalta S/ ${(transaccionPagarAdelantado.cuotasInfo.montoPorCuota - montoParcial).toFixed(2)} en la próxima cuota`
      : `Pago adelantado registrado correctamente\n\nTarjeta: ${cuotasAPagar} cuota(s) pagadas\nMonto: S/ ${montoTotal.toFixed(2)} liberados de tu tarjeta`;

    alert(mensajeExito);
  };

  // Handlers de Metas
  const handleSaveMeta = (meta) => {
    let nuevasMetas;
    if (metaEditar) {
      nuevasMetas = (userData.metas || []).map(m => m.id === meta.id ? meta : m);
    } else {
      nuevasMetas = [...(userData.metas || []), meta];
    }
    onUpdateData({ ...userData, metas: nuevasMetas });
    setModalMeta(false);
    setMetaEditar(null);
  };

  const handleDeleteMeta = (id) => {
    const meta = (userData.metas || []).find(m => m.id === id);
    if (meta && meta.montoAhorrado > 0) {
      alert(`Esta meta tiene S/ ${meta.montoAhorrado.toFixed(2)} ahorrados. Al eliminarla, este dinero volverá a tu efectivo disponible.`);
    }
    const nuevasMetas = (userData.metas || []).filter(m => m.id !== id);
    onUpdateData({ ...userData, metas: nuevasMetas });
    setModalMeta(false);
    setMetaEditar(null);
  };

  const handleAportarMeta = (monto) => {
    if (!metaAportar) return;

    const metasActualizadas = (userData.metas || []).map(m => {
      if (m.id === metaAportar.id) {
        return { ...m, montoAhorrado: Math.max(0, m.montoAhorrado + monto) };
      }
      return m;
    });

    onUpdateData({ ...userData, metas: metasActualizadas });
    setModalAporteMeta(false);
    setMetaAportar(null);

    const tipoOperacion = monto > 0 ? 'Aporte' : 'Retiro';
    const metaActualizada = metasActualizadas.find(m => m.id === metaAportar.id);
    const progreso = Calculations.calcularProgresoMeta(metaActualizada);

    if (progreso.alcanzada && monto > 0) {
      alert(`¡Felicidades! Has completado tu meta "${metaAportar.nombre}"\n\nMonto: Ahorrado: S/ ${metaActualizada.montoAhorrado.toFixed(2)}`);
    } else {
      alert(`${tipoOperacion} registrado correctamente\n\nMonto: Nuevo saldo en "${metaAportar.nombre}": S/ ${metaActualizada.montoAhorrado.toFixed(2)}\nProgreso: ${progreso.porcentaje}%`);
    }
  };

  // Clases de estilo condicionales
  const bgClass = darkMode ? 'bg-gray-900' : 'bg-gray-50';
  const cardClass = darkMode ? 'bg-gray-800' : 'bg-white';
  const textClass = darkMode ? 'text-white' : 'text-gray-800';
  const textSecondaryClass = darkMode ? 'text-gray-400' : 'text-gray-600';

  return (
    <div className={`min-h-screen ${bgClass} transition-colors duration-200`}>
      {/* Header */}
      <header className={`${cardClass} border-b sticky top-0 z-40 transition-colors`}>
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="bg-blue-500 w-12 h-12 rounded-xl flex items-center justify-center">
              <span className="text-white text-2xl font-bold">₪</span>
            </div>
            <div>
              <h1 className={`text-xl font-bold ${textClass}`}>Mis Finanzas</h1>
              <p className={`text-xs ${textSecondaryClass}`}>v3.1 Pago Tarjetas</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setDarkMode(!darkMode)}
              className={`p-2.5 rounded-xl transition-all ${
                darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'
              }`}
            >
              {darkMode ? <Sun size={20} className="text-yellow-400" /> : <Moon size={20} className="text-gray-600" />}
            </button>
            <button
              onClick={() => confirm('¿Cerrar sesión?') && window.location.reload()}
              className="px-4 py-2 text-red-600 hover:bg-red-50 rounded-xl"
            >
              Salir
            </button>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <div className={`${cardClass} border-b sticky top-16 z-30 transition-colors`}>
        <div className="max-w-7xl mx-auto px-2 sm:px-4 nav-tabs flex gap-1 overflow-x-auto scrollbar-hide">
          {[
            { id: 'inicio', label: 'Inicio', icon: Home },
            { id: 'tarjetas', label: 'Tarjetas', icon: CreditCard },
            { id: 'transacciones', label: 'Movimientos', icon: Receipt },
            { id: 'cuotas', label: 'Cuotas', icon: Calendar },
            { id: 'inversiones', label: 'Inversiones', icon: TrendingUp },
            { id: 'metas', label: 'Metas', icon: Target },
            { id: 'proyección', label: 'Proyección', icon: LineChart },
            { id: 'recurrencias', label: 'Recurrencias', icon: Repeat }
          ].map(tab => {
            const IconComponent = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-3 sm:px-6 py-3 sm:py-4 font-medium whitespace-nowrap flex items-center gap-2 transition-colors ${
                  activeTab === tab.id
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : textSecondaryClass
                }`}
              >
                <IconComponent size={18} />
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Vista Inicio */}
        {activeTab === 'inicio' && (
          <div className="space-y-8">
            {/* Filtro de Período */}
            <div className={`${cardClass} rounded-2xl shadow-lg p-6`}>
              <h3 className={`text-lg font-bold mb-4 ${textClass}`}>Filtrar Período</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className={`block text-sm font-medium mb-2 ${textSecondaryClass}`}>Fecha Inicio</label>
                  <input
                    type="date"
                    value={fechaInicio}
                    onChange={(e) => setFechaInicio(e.target.value)}
                    className="w-full px-4 py-2 border rounded-xl"
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-2 ${textSecondaryClass}`}>Fecha Fin</label>
                  <input
                    type="date"
                    value={fechaFin}
                    onChange={(e) => setFechaFin(e.target.value)}
                    max={new Date().toISOString().split('T')[0]}
                    className="w-full px-4 py-2 border rounded-xl"
                  />
                </div>
                <div className="flex items-end">
                  <button
                    onClick={() => {
                      const hoy = new Date();
                      const primerDia = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
                      setFechaInicio(primerDia.toISOString().split('T')[0]);
                      setFechaFin(hoy.toISOString().split('T')[0]);
                    }}
                    className="w-full px-4 py-2 bg-blue-500 text-white rounded-xl hover:bg-blue-600"
                  >
                    Este Mes
                  </button>
                </div>
              </div>
            </div>

            {/* Resumen del Período */}
            <div>
              <h2 className={`text-lg font-bold mb-4 ${textClass}`}>Resumen del Período Seleccionado</h2>
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-6">
                <div className={`${cardClass} rounded-2xl shadow-lg p-6 card-hover`}>
                  <p className={`text-sm mb-2 ${textSecondaryClass}`}>Ingresos</p>
                  <p className="text-3xl font-bold text-green-600">S/ {resumen.ingresos.toFixed(2)}</p>
                </div>
                <div className={`${cardClass} rounded-2xl shadow-lg p-6 card-hover`}>
                  <p className={`text-sm mb-2 ${textSecondaryClass}`}>Gastos</p>
                  <p className="text-3xl font-bold text-red-600">S/ {resumen.gastos.toFixed(2)}</p>
                </div>
                <div className={`${cardClass} rounded-2xl shadow-lg p-6 card-hover`}>
                  <p className={`text-sm mb-2 ${textSecondaryClass}`}>Balance</p>
                  <p className={`text-3xl font-bold ${resumen.balance >= 0 ? 'text-blue-600' : 'text-orange-600'}`}>
                    S/ {resumen.balance.toFixed(2)}
                  </p>
                </div>
                <div className={`${cardClass} rounded-2xl shadow-lg p-6 card-hover`}>
                  <p className={`text-sm mb-2 ${textSecondaryClass}`}>Ahorro</p>
                  <p className="text-3xl font-bold text-blue-600">{resumen.tasaAhorro}%</p>
                </div>
              </div>
            </div>

            {/* Efectivo Disponible */}
            <div>
              <h2 className={`text-lg font-bold mb-4 ${textClass}`}>Efectivo Disponible</h2>
              <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl shadow-lg p-8 text-white">
                <p className="text-sm opacity-80 mb-2">Dinero que puedes mover ahora</p>
                <p className="text-5xl font-bold mb-3">S/ {efectivoDisponible.toFixed(2)}</p>
                <p className="text-xs opacity-80">
                  Este es tu saldo real en efectivo (ingresos - gastos en efectivo - pagos de tarjetas)
                </p>
              </div>
            </div>

            {/* Cashflow Total */}
            <div>
              <h2 className={`text-lg font-bold mb-4 ${textClass}`}>Cashflow Total (Todo el Histórico)</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl shadow-lg p-6 text-white">
                  <p className="text-sm opacity-80 mb-1">Total Ingresos</p>
                  <p className="text-3xl font-bold">S/ {cashflowTotal.ingresosTotal.toFixed(2)}</p>
                </div>
                <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl shadow-lg p-6 text-white">
                  <p className="text-sm opacity-80 mb-1">Total Gastos</p>
                  <p className="text-3xl font-bold">S/ {cashflowTotal.gastosTotal.toFixed(2)}</p>
                </div>
                <div className={`bg-gradient-to-br ${
                  cashflowTotal.cashflowNeto >= 0 ? 'from-teal-500 to-teal-600' : 'from-orange-500 to-orange-600'
                } rounded-2xl shadow-lg p-6 text-white`}>
                  <p className="text-sm opacity-80 mb-1">Cashflow Neto</p>
                  <p className="text-3xl font-bold">S/ {cashflowTotal.cashflowNeto.toFixed(2)}</p>
                  <p className="text-xs opacity-80 mt-2">
                    {cashflowTotal.cashflowNeto >= 0 ? 'Superávit' : 'Déficit'}
                  </p>
                </div>
              </div>
            </div>

            {/* Próximos Pagos */}
            {proximosPagos.length > 0 && (
              <div className={`${cardClass} rounded-2xl shadow-lg p-6`}>
                <h2 className={`text-xl font-bold mb-4 ${textClass}`}>Próximos Pagos de Tarjetas</h2>
                <div className="space-y-3">
                  {proximosPagos.map((pago, idx) => (
                    <div
                      key={idx}
                      className={`flex justify-between items-center p-4 rounded-xl ${
                        pago.urgencia === 'alta' ? 'bg-red-50 border border-red-200' :
                        pago.urgencia === 'media' ? 'bg-yellow-50 border border-yellow-200' :
                        'bg-green-50 border border-green-200'
                      }`}
                    >
                      <div>
                        <p className="font-semibold text-gray-800">{pago.tarjeta}</p>
                        <p className="text-sm text-gray-600">
                          {pago.diasRestantes === 0 ? '¡HOY!' :
                           pago.diasRestantes === 1 ? 'Mañana' :
                           `En ${pago.diasRestantes} días`} - {pago.fecha.toLocaleDateString('es-PE')}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-gray-800">S/ {pago.saldo.toFixed(2)}</p>
                        <button
                          onClick={() => {
                            const tarjeta = userData.tarjetas.find(t => t.id === pago.tarjetaId);
                            setTarjetaPagar(tarjeta);
                            setModalPagoTarjeta(true);
                          }}
                          className="text-sm text-blue-600 hover:text-blue-800 font-medium mt-1"
                        >
                          Tarjeta: Pagar
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Gráfico de Categorías */}
            {Object.keys(gastosPorCategoria).length > 0 && (
              <div className={`${cardClass} rounded-2xl shadow-lg p-6`}>
                <h2 className={`text-xl font-bold mb-6 ${textClass}`}>
                  Gastos por Categoría (Período Seleccionado)
                </h2>
                <Suspense fallback={<LoadingSpinner />}>
                  <GraficoCategorias gastosPorCategoria={gastosPorCategoria} />
                </Suspense>
              </div>
            )}

            {/* Botones de Acción Rápida */}
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => {
                  setTipoTransaccion('Gasto');
                  setTransaccionEditar(null);
                  setModalTransaccion(true);
                }}
                className={`${cardClass} rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all text-center`}
              >
                <Wallet size={40} className="mx-auto mb-2 text-blue-500" />
                <p className={`font-semibold ${textClass}`}>Registrar Gasto</p>
              </button>
              <button
                onClick={() => {
                  setTipoTransaccion('Ingreso');
                  setTransaccionEditar(null);
                  setModalTransaccion(true);
                }}
                className={`${cardClass} rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all text-center`}
              >
                <Banknote size={40} className="mx-auto mb-2 text-green-500" />
                <p className={`font-semibold ${textClass}`}>Registrar Ingreso</p>
              </button>
            </div>
          </div>
        )}

        {/* Vista Tarjetas */}
        {activeTab === 'tarjetas' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className={`text-2xl font-bold ${textClass}`}>Tarjeta: Mis Tarjetas</h2>
              <button
                onClick={() => {
                  setTarjetaEditar(null);
                  setModalTarjeta(true);
                }}
                className="px-6 py-3 bg-blue-500 text-white rounded-xl hover:bg-blue-600"
              >
                Nueva Tarjeta
              </button>
            </div>

            {userData.tarjetas.length === 0 ? (
              <div className={`${cardClass} rounded-2xl shadow-lg p-12 text-center`}>
                <CreditCard size={64} className="mx-auto mb-4 text-gray-400" />
                <h3 className={`text-xl font-bold mb-2 ${textClass}`}>No tienes tarjetas</h3>
                <p className={`mb-6 ${textSecondaryClass}`}>Agrega tu primera tarjeta</p>
                <button
                  onClick={() => setModalTarjeta(true)}
                  className="px-8 py-3 bg-blue-500 text-white rounded-xl hover:bg-blue-600"
                >
                  Agregar Tarjeta
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {userData.tarjetas.map(tarjeta => {
                  const utilizacion = ((tarjeta.saldoActual / tarjeta.limite) * 100).toFixed(1);
                  const disponible = tarjeta.limite - tarjeta.saldoActual;
                  const bancoConfig = BANCOS.find(b => b.nombre === tarjeta.banco) || BANCOS[0];

                  // Calcular compras en cuotas de esta tarjeta
                  const comprasEnCuotas = userData.transacciones.filter(t =>
                    t.esCuotas &&
                    parseInt(t.metodoPago) === tarjeta.id &&
                    t.cuotasInfo.cuotasRestantes > 0
                  );
                  const totalEnCuotas = comprasEnCuotas.reduce((sum, c) =>
                    sum + (c.cuotasInfo.cuotasRestantes * c.cuotasInfo.montoPorCuota), 0
                  );

                  return (
                    <div key={tarjeta.id} className={`bg-gradient-to-br ${bancoConfig.color} rounded-2xl shadow-xl p-6 text-white`}>
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <p className="text-sm opacity-80">{tarjeta.banco}</p>
                          <h3 className="text-xl font-bold">{tarjeta.nombre}</h3>
                        </div>
                        <div className="px-3 py-1 bg-white/20 rounded-full text-xs font-bold">{utilizacion}%</div>
                      </div>
                      <p className="text-lg font-mono mb-6">•••• •••• •••• {tarjeta.ultimos4 || '••••'}</p>
                      <div className="space-y-3 mb-4">
                        <div>
                          <div className="flex justify-between text-sm mb-2">
                            <span>Usado: S/ {tarjeta.saldoActual.toFixed(2)}</span>
                            <span>Disponible: S/ {disponible.toFixed(2)}</span>
                          </div>
                          {comprasEnCuotas.length > 0 && (
                            <div className="text-xs opacity-90 mb-2">
                              └─ En cuotas: S/ {totalEnCuotas.toFixed(2)} ({comprasEnCuotas.reduce((sum, c) => sum + c.cuotasInfo.cuotasRestantes, 0)} cuotas)
                            </div>
                          )}
                          <div className="w-full bg-white/20 rounded-full h-2.5">
                            <div className="bg-white h-2.5 rounded-full transition-all" style={{ width: `${Math.min(utilizacion, 100)}%` }}></div>
                          </div>
                          <div className="text-xs mt-1 opacity-80">Límite: S/ {tarjeta.limite.toFixed(2)}</div>
                        </div>

                        {comprasEnCuotas.length > 0 && (
                          <div className="pt-2 border-t border-white/20">
                            <p className="text-xs font-semibold mb-2 opacity-90">📦 Compras en cuotas:</p>
                            {comprasEnCuotas.slice(0, 2).map(compra => (
                              <div key={compra.id} className="text-xs opacity-80 mb-1">
                                • {compra.descripcion}: {compra.cuotasInfo.cuotasRestantes}/{compra.cuotasInfo.numeroCuotas} restantes
                              </div>
                            ))}
                            {comprasEnCuotas.length > 2 && (
                              <div className="text-xs opacity-70">+ {comprasEnCuotas.length - 2} más...</div>
                            )}
                          </div>
                        )}

                        <div className="flex justify-between text-sm pt-2 border-t border-white/20">
                          <span>Cierre: día {tarjeta.fechaCierre}</span>
                          <span>Tarjeta: Pago: día {tarjeta.fechaPago}</span>
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-2">
                        <button
                          onClick={() => {
                            setTipoTransaccion('Gasto');
                            setTransaccionEditar(null);
                            setModalTransaccion(true);
                          }}
                          className="bg-white/20 hover:bg-white/30 py-2.5 rounded-lg text-sm font-semibold"
                        >
                          Gasto
                        </button>
                        <button
                          onClick={() => {
                            setTarjetaPagar(tarjeta);
                            setModalPagoTarjeta(true);
                          }}
                          disabled={tarjeta.saldoActual === 0}
                          className="bg-green-500/80 hover:bg-green-500 py-2.5 rounded-lg text-sm font-semibold disabled:bg-white/10 disabled:cursor-not-allowed"
                        >
                          Pagar
                        </button>
                        <button
                          onClick={() => {
                            setTarjetaEditar(tarjeta);
                            setModalTarjeta(true);
                          }}
                          className="bg-white/20 hover:bg-white/30 py-2.5 rounded-lg text-sm font-semibold"
                        >
                          Editar
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Vista Transacciones */}
        {activeTab === 'transacciones' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className={`text-2xl font-bold ${textClass}`}>Movimientos</h2>
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setTipoTransaccion('Gasto');
                    setTransaccionEditar(null);
                    setModalTransaccion(true);
                  }}
                  className="px-6 py-3 bg-red-500 text-white rounded-xl hover:bg-red-600"
                >
                  Nuevo Gasto
                </button>
                <button
                  onClick={() => {
                    setTipoTransaccion('Ingreso');
                    setTransaccionEditar(null);
                    setModalTransaccion(true);
                  }}
                  className="px-6 py-3 bg-green-500 text-white rounded-xl hover:bg-green-600"
                >
                  Nuevo Ingreso
                </button>
              </div>
            </div>

            {userData.transacciones.length === 0 ? (
              <div className={`${cardClass} rounded-2xl shadow-lg p-12 text-center`}>
                <BarChart3 size={64} className="mx-auto mb-4 text-gray-400" />
                <h3 className={`text-xl font-bold mb-2 ${textClass}`}>No hay transacciones</h3>
                <p className={textSecondaryClass}>Comienza registrando tus movimientos</p>
              </div>
            ) : (
              <>
                {/* Advertencia si hay demasiadas transacciones */}
                {userData.transacciones.length > MAX_TRANSACCIONES && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-4">
                    <p className="text-sm text-yellow-800">
                      <AlertTriangle size={14} className="inline" />  <strong>Alerta de Performance:</strong> Tienes {userData.transacciones.length.toLocaleString()} transacciones.
                      Se recomienda exportar y archivar transacciones antiguas para mantener el rendimiento óptimo.
                    </p>
                  </div>
                )}

                <div className={`${cardClass} rounded-2xl shadow-lg overflow-hidden`}>
                  {/* Información de paginación */}
                  <div className={`px-6 py-3 border-b ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'}`}>
                    <div className="flex justify-between items-center">
                      <p className={`text-sm ${textSecondaryClass}`}>
                        Mostrando {Math.min((paginaActual - 1) * transaccionesPorPagina + 1, userData.transacciones.length)} - {Math.min(paginaActual * transaccionesPorPagina, userData.transacciones.length)} de {userData.transacciones.length.toLocaleString()} transacciones
                      </p>
                      <p className={`text-xs ${textSecondaryClass}`}>
                        {transaccionesPorPagina} por página
                      </p>
                    </div>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className={darkMode ? 'bg-gray-700' : 'bg-gray-50'}>
                        <tr>
                          <th className={`px-6 py-4 text-left text-xs font-semibold uppercase ${textSecondaryClass}`}>Fecha</th>
                          <th className={`px-6 py-4 text-left text-xs font-semibold uppercase ${textSecondaryClass}`}>Descripción</th>
                          <th className={`px-6 py-4 text-left text-xs font-semibold uppercase ${textSecondaryClass}`}>Categoría</th>
                          <th className={`px-6 py-4 text-right text-xs font-semibold uppercase ${textSecondaryClass}`}>Monto</th>
                          <th className={`px-6 py-4 text-center text-xs font-semibold uppercase ${textSecondaryClass}`}>Acciones</th>
                        </tr>
                      </thead>
                      <tbody className={`divide-y ${darkMode ? 'divide-gray-700' : 'divide-gray-200'}`}>
                        {(() => {
                          const transaccionesOrdenadas = [...userData.transacciones].sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
                          const indiceInicio = (paginaActual - 1) * transaccionesPorPagina;
                          const indiceFin = indiceInicio + transaccionesPorPagina;
                          const transaccionesPagina = transaccionesOrdenadas.slice(indiceInicio, indiceFin);

                          return transaccionesPagina.map((t) => {
                        const categoria = CATEGORIAS.find(c => c.valor === t.categoria) || TIPOS_INGRESO.find(c => c.valor === t.categoria);
                        const fechaLocal = new Date(t.fecha + 'T12:00:00');
                        return (
                          <tr key={t.id} className={darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'}>
                            <td className={`px-6 py-4 whitespace-nowrap text-sm ${textSecondaryClass}`}>
                              {fechaLocal.toLocaleDateString('es-PE')}
                              {t.esRecurrente && <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">♻️</span>}
                              {t.tipo === 'PagoTarjeta' && !t.esPagoAdelantado && <span className="ml-2 text-xs bg-green-100 text-green-800 px-2 py-1 rounded flex items-center gap-1"><CreditCard size={12} /></span>}
                              {t.esCuotas && (
                                <span className={`ml-2 text-xs px-2 py-1 rounded font-semibold ${
                                  t.cuotasInfo.fechasCobro && t.cuotasInfo.fechasCobro.some(c => c.estado === 'parcial')
                                    ? 'bg-amber-100 text-amber-800'
                                    : 'bg-purple-100 text-purple-800'
                                }`}>
                                  Tarjeta: {t.cuotasInfo.cuotasPagadas}/{t.cuotasInfo.numeroCuotas} cuotas
                                  {t.cuotasInfo.fechasCobro && t.cuotasInfo.fechasCobro.some(c => c.estado === 'parcial') && (
                                    <span className="ml-1" title="Tiene cuota pagada parcialmente"><AlertTriangle size={12} className="inline" /></span>
                                  )}
                                </span>
                              )}
                            </td>
                            <td className={`px-6 py-4 text-sm ${textClass}`}>
                              <div>
                                <p className="font-medium">{t.descripcion}</p>
                                {t.esCuotas && t.cuotasInfo.cuotasRestantes > 0 && (
                                  <button
                                    onClick={() => {
                                      setTransaccionPagarAdelantado(t);
                                      setModalPagoAdelantado(true);
                                    }}
                                    className="mt-1 text-xs text-purple-600 hover:text-purple-800 font-semibold"
                                  >
                                    Tarjeta: Pagar {t.cuotasInfo.cuotasRestantes} cuota(s) adelantada(s)
                                  </button>
                                )}
                                {t.esCuotas && t.cuotasInfo.pagosAdelantados && t.cuotasInfo.pagosAdelantados.length > 0 && (
                                  <button
                                    onClick={() => {
                                      setTransaccionHistorial(t);
                                      setModalHistorialCuotas(true);
                                    }}
                                    className="mt-1 ml-2 text-xs text-gray-600 hover:text-gray-800 font-semibold"
                                  >
                                    Ver historial
                                  </button>
                                )}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                              <span className="inline-flex items-center gap-2">
                                <span>{Icons[categoria?.iconName] ? React.createElement(Icons[categoria.iconName], { size: 16 }) : <CreditCard size={16} />}</span>
                                <span className={textSecondaryClass}>{t.categoria}</span>
                              </span>
                            </td>
                            <td className={`px-6 py-4 whitespace-nowrap text-right text-sm ${textClass}`}>
                              <div>
                                <p className={`font-bold ${t.tipo === 'Ingreso' ? 'text-green-600' : 'text-red-600'}`}>
                                  {t.tipo === 'Ingreso' ? '+' : '-'} S/ {t.monto.toFixed(2)}
                                </p>
                                {t.esCuotas && (
                                  <p className="text-xs text-gray-500 mt-1">
                                    S/ {t.cuotasInfo.montoPorCuota.toFixed(2)} x {t.cuotasInfo.numeroCuotas}
                                  </p>
                                )}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-center">
                              {t.tipo !== 'PagoTarjeta' && !t.esCuotas && (
                                <button
                                  onClick={() => {
                                    setTipoTransaccion(t.tipo);
                                    setTransaccionEditar(t);
                                    setModalTransaccion(true);
                                  }}
                                  className="text-blue-600 hover:text-blue-800 mr-3"
                                  title="Editar"
                                >
                                  ✏️
                                </button>
                              )}
                              <button
                                onClick={() => handleDeleteTransaccion(t.id)}
                                className="text-red-600 hover:text-red-800"
                                title="Eliminar"
                              >
                                <Trash2 size={16} />
                              </button>
                            </td>
                          </tr>
                        );
                          });
                        })()}
                      </tbody>
                    </table>
                  </div>

                  {/* Controles de paginación */}
                  <div className={`px-6 py-4 border-t ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'}`}>
                    <div className="flex items-center justify-between">
                      <button
                        onClick={() => setPaginaActual(Math.max(1, paginaActual - 1))}
                        disabled={paginaActual === 1}
                        className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                          paginaActual === 1
                            ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                            : 'bg-blue-500 text-white hover:bg-blue-600'
                        }`}
                      >
                        ← Anterior
                      </button>

                      <div className="flex items-center gap-2">
                        {(() => {
                          const totalPaginas = Math.ceil(userData.transacciones.length / transaccionesPorPagina);
                          const paginasVisibles = [];
                          const rango = 2;

                          // Siempre mostrar primera página
                          if (paginaActual > rango + 1) {
                            paginasVisibles.push(
                              <button
                                key={1}
                                onClick={() => setPaginaActual(1)}
                                className="px-3 py-1 rounded-lg hover:bg-blue-100 text-sm"
                              >
                                1
                              </button>
                            );
                            if (paginaActual > rango + 2) {
                              paginasVisibles.push(<span key="dots1" className="px-2">...</span>);
                            }
                          }

                          // Páginas alrededor de la actual
                          for (let i = Math.max(1, paginaActual - rango); i <= Math.min(totalPaginas, paginaActual + rango); i++) {
                            paginasVisibles.push(
                              <button
                                key={i}
                                onClick={() => setPaginaActual(i)}
                                className={`px-3 py-1 rounded-lg text-sm ${
                                  i === paginaActual
                                    ? 'bg-blue-500 text-white font-bold'
                                    : 'hover:bg-blue-100'
                                }`}
                              >
                                {i}
                              </button>
                            );
                          }

                          // Siempre mostrar última página
                          if (paginaActual < totalPaginas - rango) {
                            if (paginaActual < totalPaginas - rango - 1) {
                              paginasVisibles.push(<span key="dots2" className="px-2">...</span>);
                            }
                            paginasVisibles.push(
                              <button
                                key={totalPaginas}
                                onClick={() => setPaginaActual(totalPaginas)}
                                className="px-3 py-1 rounded-lg hover:bg-blue-100 text-sm"
                              >
                                {totalPaginas}
                              </button>
                            );
                          }

                          return paginasVisibles;
                        })()}
                      </div>

                      <button
                        onClick={() => setPaginaActual(Math.min(Math.ceil(userData.transacciones.length / transaccionesPorPagina), paginaActual + 1))}
                        disabled={paginaActual >= Math.ceil(userData.transacciones.length / transaccionesPorPagina)}
                        className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                          paginaActual >= Math.ceil(userData.transacciones.length / transaccionesPorPagina)
                            ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                            : 'bg-blue-500 text-white hover:bg-blue-600'
                        }`}
                      >
                        Siguiente →
                      </button>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {/* Vista Cuotas */}
        {activeTab === 'cuotas' && (
          <Suspense fallback={<LoadingSpinner />}>
            <SeccionCuotas
              transacciones={userData.transacciones}
              tarjetas={userData.tarjetas}
              efectivoDisponible={efectivoDisponible}
              onPagarCuotas={(transaccion) => {
                setTransaccionPagarAdelantado(transaccion);
                setModalPagoAdelantado(true);
              }}
            />
          </Suspense>
        )}

        {/* Vista Inversiones */}
        {activeTab === 'inversiones' && (
          <Suspense fallback={<LoadingSpinner />}>
            <StockInvestments
              darkMode={darkMode}
              favorites={userData.stockFavorites || []}
              investments={userData.stockInvestments || []}
              onUpdateFavorites={handleUpdateFavorites}
              onUpdateInvestments={handleUpdateInvestments}
              onDeductFromCash={handleDeductFromCash}
            />
          </Suspense>
        )}

        {/* Vista Proyección */}
        {activeTab === 'proyección' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className={`text-2xl font-bold ${textClass}`}>Proyección Financiera (6 meses)</h2>
              <button
                onClick={() => {
                  setModalSimulador(true);
                  setSimulacionActual(null);
                  setProyeccionSimulada(null);
                }}
                className="px-6 py-3 bg-purple-500 text-white rounded-xl hover:bg-purple-600"
              >
                Simular Movimiento
              </button>
            </div>

            <div className={`${cardClass} rounded-2xl shadow-lg p-6`}>
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
                <p className="text-sm text-blue-800">
                  <Info size={14} className="inline" /> <strong>Nota importante:</strong> Esta proyección usa tu <strong>efectivo disponible</strong> como base (S/ {proyeccion.saldoInicial.toFixed(2)}). Solo considera movimientos en efectivo: ingresos recurrentes y pagos de tarjetas programados.
                </p>
              </div>

              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className={`text-lg font-bold ${textClass}`}>Monto: Efectivo Actual</h3>
                  <p className={`text-4xl font-bold ${proyeccion.saldoInicial >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    S/ {proyeccion.saldoInicial.toFixed(2)}
                  </p>
                </div>
                <div className="text-right">
                  <p className={`text-sm ${textSecondaryClass}`}>Proyección a 6 meses</p>
                  <p className="text-sm font-medium text-gray-600">{proyeccion.eventos.length} eventos programados</p>
                </div>
              </div>

              <div className="space-y-3 max-h-[600px] overflow-y-auto">
                {proyeccion.eventos.map((e, idx) => (
                  <div
                    key={idx}
                    className={`p-4 rounded-xl border-2 transition-all ${
                      e.color === 'verde' ? 'bg-green-50 border-green-200' :
                      e.color === 'amarillo' ? 'bg-yellow-50 border-yellow-200' :
                      'bg-red-50 border-red-200'
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <p className="font-semibold text-gray-800">{e.descripcion}</p>
                          {e.recurrente && <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">♻️ Auto</span>}
                          {e.esCuota && <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded font-semibold">Tarjeta: Cuota</span>}
                        </div>
                        <p className="text-sm text-gray-600 mt-1">
                          <Calendar size={14} className="inline" />  {e.fecha.toLocaleDateString('es-PE', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">{e.categoria}{e.tarjeta && ` • ${e.tarjeta}`}</p>
                      </div>
                      <div className="text-right ml-4">
                        <p className={`text-xl font-bold ${e.monto > 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {e.monto > 0 ? '+' : ''} S/ {e.monto.toFixed(2)}
                        </p>
                        <p className="text-sm text-gray-600 mt-1">Saldo: S/ {e.saldoProyectado.toFixed(2)}</p>
                        <div className={`mt-2 inline-block px-3 py-1 rounded-full text-xs font-bold ${
                          e.color === 'verde' ? 'bg-green-100 text-green-800' :
                          e.color === 'amarillo' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {e.estado}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {proyeccion.eventos.some(e => e.color === 'rojo') && (
                <div className="mt-6 bg-red-50 border border-red-200 rounded-xl p-4">
                  <p className="font-bold text-red-800 mb-2">Alertas de Déficit</p>
                  <p className="text-sm text-red-700">
                    Tienes {proyeccion.eventos.filter(e => e.color === 'rojo').length} pagos en riesgo. Considera priorizar pagos, ajustar gastos o buscar ingresos adicionales.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Vista Metas */}
        {activeTab === 'metas' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className={`text-2xl font-bold ${textClass}`}>Metas de Ahorro</h2>
              <button
                onClick={() => {
                  setMetaEditar(null);
                  setModalMeta(true);
                }}
                className="px-6 py-3 bg-blue-500 text-white rounded-xl hover:bg-blue-600"
              >
                Nueva Meta
              </button>
            </div>

            {/* Panel de Información de Ahorro */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl shadow-lg p-6 text-white">
                <p className="text-sm opacity-80 mb-1">Monto: Disponible para Ahorrar</p>
                <p className="text-3xl font-bold mb-2">S/ {disponibleParaAhorrar.toFixed(2)}</p>
                <p className="text-xs opacity-80">
                  Efectivo - Deudas - Dinero en metas
                </p>
              </div>
              <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl shadow-lg p-6 text-white">
                <p className="text-sm opacity-80 mb-1">Cashflow Promedio (3 meses)</p>
                <p className="text-3xl font-bold mb-2">S/ {cashflowPromedio.cashflowNeto.toFixed(2)}</p>
                <p className="text-xs opacity-80">
                  {cashflowPromedio.cashflowNeto > 0 ? 'Capacidad de ahorro mensual' : 'Necesitas aumentar ingresos'}
                </p>
              </div>
              <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl shadow-lg p-6 text-white">
                <p className="text-sm opacity-80 mb-1">Total en Metas</p>
                <p className="text-3xl font-bold mb-2">
                  S/ {(userData.metas || []).reduce((sum, m) => sum + (m.montoAhorrado || 0), 0).toFixed(2)}
                </p>
                <p className="text-xs opacity-80">
                  Dinero asignado a {(userData.metas || []).length} meta(s)
                </p>
              </div>
            </div>

            {/* Explicación */}
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
              <p className="text-sm text-blue-800">
                <Info size={14} className="inline" />  <strong>¿Cómo funciona?</strong> El "Disponible para Ahorrar" considera tu efectivo actual menos las deudas de tarjetas y el dinero ya asignado en otras metas. Esto te muestra cuánto dinero real puedes destinar a nuevas metas sin comprometer tus obligaciones.
              </p>
            </div>

            {/* Lista de Metas */}
            {(!userData.metas || userData.metas.length === 0) ? (
              <div className={`${cardClass} rounded-2xl shadow-lg p-12 text-center`}>
                <Target size={64} className="mx-auto mb-4 text-gray-400" />
                <h3 className={`text-xl font-bold mb-2 ${textClass}`}>No tienes metas de ahorro</h3>
                <p className={`mb-6 ${textSecondaryClass}`}>
                  Crea tu primera meta y comienza a ahorrar de forma inteligente
                </p>
                <button
                  onClick={() => setModalMeta(true)}
                  className="px-8 py-3 bg-blue-500 text-white rounded-xl hover:bg-blue-600"
                >
                  Crear Primera Meta
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {(userData.metas || [])
                  .filter(m => m.activa)
                  .map(meta => {
                    const categoria = CATEGORIAS_METAS.find(c => c.valor === meta.categoria) || CATEGORIAS_METAS[0];
                    const progreso = Calculations.calcularProgresoMeta(meta);
                    const tiempoEstimado = Calculations.calcularTiempoParaMeta(
                      meta.montoObjetivo,
                      meta.montoAhorrado,
                      cashflowPromedio.cashflowNeto,
                      100
                    );

                    return (
                      <div
                        key={meta.id}
                        className={`bg-gradient-to-br ${categoria.color} rounded-2xl shadow-xl p-6 text-white relative overflow-hidden`}
                      >
                        {/* Indicador de Meta Alcanzada */}
                        {progreso.alcanzada && (
                          <div className="absolute top-4 right-4 bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold">
                            <CheckCircle size={14} className="inline" />  Completada
                          </div>
                        )}

                        {/* Indicador de Atraso */}
                        {progreso.atrasada && (
                          <div className="absolute top-4 right-4 bg-red-500/90 px-3 py-1 rounded-full text-xs font-bold">
                            <AlertTriangle size={14} className="inline" />  Atrasada
                          </div>
                        )}

                        {/* Encabezado */}
                        <div className="flex items-center gap-3 mb-4">
                          {(() => {
                            const IconComponent = Icons[categoria?.iconName] || Target;
                            return <IconComponent size={40} className="text-white/90" />;
                          })()}
                          <div className="flex-1">
                            <h3 className="text-xl font-bold">{meta.nombre}</h3>
                            <p className="text-sm opacity-80">{meta.categoria}</p>
                          </div>
                        </div>

                        {/* Información de Montos */}
                        <div className="space-y-3 mb-4">
                          <div className="flex justify-between text-sm">
                            <span className="opacity-80">Ahorrado:</span>
                            <span className="font-bold">S/ {meta.montoAhorrado.toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="opacity-80">Objetivo:</span>
                            <span className="font-bold">S/ {meta.montoObjetivo.toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="opacity-80">Falta:</span>
                            <span className="font-semibold">S/ {progreso.montoPendiente.toFixed(2)}</span>
                          </div>

                          {/* Barra de Progreso */}
                          <div className="pt-2">
                            <div className="flex justify-between text-xs mb-2">
                              <span className="opacity-80">Progreso</span>
                              <span className="font-bold">{progreso.porcentaje}%</span>
                            </div>
                            <div className="w-full bg-white/20 rounded-full h-3">
                              <div
                                className="bg-white h-3 rounded-full transition-all"
                                style={{ width: `${Math.min(progreso.porcentaje, 100)}%` }}
                              ></div>
                            </div>
                          </div>
                        </div>

                        {/* Información de Tiempo */}
                        <div className="pt-3 border-t border-white/20 mb-4">
                          {meta.fechaObjetivo && (
                            <div className="flex justify-between text-sm mb-2">
                              <span className="opacity-80">Fecha objetivo:</span>
                              <span className="font-semibold">
                                {new Date(meta.fechaObjetivo + 'T00:00:00').toLocaleDateString('es-PE', {
                                  day: 'numeric',
                                  month: 'short',
                                  year: 'numeric'
                                })}
                              </span>
                            </div>
                          )}
                          {meta.fechaObjetivo && progreso.diasParaObjetivo !== null && (
                            <div className="flex justify-between text-sm">
                              <span className="opacity-80">
                                {progreso.diasParaObjetivo >= 0 ? 'Días restantes:' : 'Días atrasada:'}
                              </span>
                              <span className={`font-semibold ${progreso.diasParaObjetivo < 0 ? 'text-red-200' : ''}`}>
                                {Math.abs(progreso.diasParaObjetivo)} días
                              </span>
                            </div>
                          )}
                          {!progreso.alcanzada && tiempoEstimado && !tiempoEstimado.alcanzada && tiempoEstimado.meses !== Infinity && (
                            <div className="mt-2 p-2 bg-white/10 rounded-lg">
                              <p className="text-xs opacity-90">
                                <Calendar size={14} className="inline" />  Con tu cashflow actual: <strong>{tiempoEstimado.meses} mes(es)</strong>
                                {tiempoEstimado.anios > 0 && ` (${tiempoEstimado.anios} año(s), ${tiempoEstimado.mesesRestantes} mes(es))`}
                              </p>
                            </div>
                          )}
                        </div>

                        {/* Botones de Acción */}
                        <div className="grid grid-cols-3 gap-2">
                          <button
                            onClick={() => {
                              setMetaAportar(meta);
                              setModalAporteMeta(true);
                            }}
                            className="bg-white/20 hover:bg-white/30 py-2.5 rounded-lg text-sm font-semibold"
                          >
                            Monto: Aportar
                          </button>
                          <button
                            onClick={() => {
                              setMetaAportar(meta);
                              setModalAporteMeta(true);
                            }}
                            className="bg-white/20 hover:bg-white/30 py-2.5 rounded-lg text-sm font-semibold"
                            disabled={meta.montoAhorrado === 0}
                          >
                            <ArrowDownRight size={16} className="inline" /> Retirar
                          </button>
                          <button
                            onClick={() => {
                              setMetaEditar(meta);
                              setModalMeta(true);
                            }}
                            className="bg-white/20 hover:bg-white/30 py-2.5 rounded-lg text-sm font-semibold"
                          >
                            ✏️ Editar
                          </button>
                        </div>
                      </div>
                    );
                  })}
              </div>
            )}

            {/* Metas Inactivas */}
            {(userData.metas || []).filter(m => !m.activa).length > 0 && (
              <div className={`${cardClass} rounded-2xl shadow-lg p-6`}>
                <h3 className={`text-lg font-bold mb-4 ${textClass}`}>📦 Metas Inactivas</h3>
                <div className="space-y-3">
                  {(userData.metas || [])
                    .filter(m => !m.activa)
                    .map(meta => (
                      <div
                        key={meta.id}
                        className="flex justify-between items-center p-4 bg-gray-50 rounded-xl"
                      >
                        <div>
                          <p className="font-semibold text-gray-800">{meta.nombre}</p>
                          <p className="text-sm text-gray-600">
                            S/ {meta.montoAhorrado.toFixed(2)} / S/ {meta.montoObjetivo.toFixed(2)}
                          </p>
                        </div>
                        <button
                          onClick={() => {
                            setMetaEditar(meta);
                            setModalMeta(true);
                          }}
                          className="text-blue-600 hover:text-blue-800 font-medium"
                        >
                          Editar
                        </button>
                      </div>
                    ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Vista Recurrencias */}
        {activeTab === 'recurrencias' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className={`text-2xl font-bold ${textClass}`}>⚙️ Pagos e Ingresos Recurrentes</h2>
              <button
                onClick={() => {
                  setRecurrenciaEditar(null);
                  setModalRecurrencia(true);
                }}
                className="px-6 py-3 bg-blue-500 text-white rounded-xl hover:bg-blue-600"
              >
                Nueva Recurrencia
              </button>
            </div>

            <div className={`${cardClass} rounded-2xl shadow-lg p-6`}>
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
                <p className="text-sm text-blue-800">
                  <Info size={14} className="inline" />  <strong>Nota:</strong> Las recurrencias se registran automáticamente cuando llega la fecha configurada. No necesitas agregarlas manualmente para evitar duplicados.
                </p>
              </div>

              {(!userData.recurrencias || userData.recurrencias.length === 0) ? (
                <div className="text-center py-12">
                  <Calendar size={64} className="mx-auto mb-4 text-gray-400" />
                  <h3 className={`text-xl font-bold mb-2 ${textClass}`}>Sin recurrencias configuradas</h3>
                  <p className={`mb-6 ${textSecondaryClass}`}>Agrega salarios, suscripciones y otros pagos automáticos</p>
                  <button
                    onClick={() => setModalRecurrencia(true)}
                    className="px-8 py-3 bg-blue-500 text-white rounded-xl hover:bg-blue-600"
                  >
                    Crear Primera Recurrencia
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {userData.recurrencias.map(rec => {
                    const esIngreso = rec.tipo === 'ingreso';
                    const tarjeta = rec.tarjetaId && rec.tarjetaId !== 'Efectivo' ? userData.tarjetas.find(t => t.id === parseInt(rec.tarjetaId)) : null;
                    return (
                      <div
                        key={rec.id}
                        className={`${cardClass} rounded-xl border-2 p-6 ${
                          rec.activo ? 'border-blue-200' : 'border-gray-200 opacity-60'
                        }`}
                      >
                        <div className="flex justify-between items-start mb-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              {esIngreso ? <TrendingUp size={24} className="text-green-500" /> : <TrendingDown size={24} className="text-red-500" />}
                              <h3 className={`text-lg font-bold ${textClass}`}>{rec.descripcion}</h3>
                            </div>
                            <p className={`text-sm ${textSecondaryClass}`}>
                              Cada día <span className="font-bold">{rec.dia}</span> del mes
                            </p>
                          </div>
                          <div className={`px-3 py-1 rounded-full text-xs font-bold ${
                            rec.activo ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'
                          }`}>
                            {rec.activo ? 'Activo' : 'Inactivo'}
                          </div>
                        </div>
                        <div className="space-y-2 mb-4">
                          <div className="flex justify-between">
                            <span className={`text-sm ${textSecondaryClass}`}>Monto:</span>
                            <span className={`font-bold ${esIngreso ? 'text-green-600' : 'text-red-600'}`}>
                              {esIngreso ? '+' : '-'} S/ {rec.monto.toFixed(2)}
                            </span>
                          </div>
                          {!esIngreso && (
                            <>
                              <div className="flex justify-between">
                                <span className={`text-sm ${textSecondaryClass}`}>Categoría:</span>
                                <span className={`text-sm ${textClass}`}>{rec.categoria}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className={`text-sm ${textSecondaryClass}`}>Método:</span>
                                <span className={`text-sm ${textClass}`}>{tarjeta ? `Tarjeta: ${tarjeta.nombre}` : '<Banknote size={14} className="inline" />  Efectivo'}</span>
                              </div>
                            </>
                          )}
                        </div>
                        <button
                          onClick={() => {
                            setRecurrenciaEditar(rec);
                            setModalRecurrencia(true);
                          }}
                          className="w-full py-2.5 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-lg font-medium transition-colors"
                        >
                          ✏️ Editar
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      {/* Modales con Lazy Loading */}
      <Modal isOpen={modalTarjeta} onClose={() => { setModalTarjeta(false); setTarjetaEditar(null); }} title={tarjetaEditar ? 'Editar Tarjeta' : 'Nueva Tarjeta'}>
        <Suspense fallback={<LoadingSpinner />}>
          <FormularioTarjeta tarjeta={tarjetaEditar} transacciones={userData.transacciones} onSave={handleSaveTarjeta} onDelete={handleDeleteTarjeta} onClose={() => { setModalTarjeta(false); setTarjetaEditar(null); }} />
        </Suspense>
      </Modal>

      <Modal isOpen={modalTransaccion} onClose={() => { setModalTransaccion(false); setTransaccionEditar(null); }} title={transaccionEditar ? `Editar ${tipoTransaccion}` : `Registrar ${tipoTransaccion}`}>
        <Suspense fallback={<LoadingSpinner />}>
          <FormularioTransaccion tipo={tipoTransaccion} tarjetas={userData.tarjetas} transaccionEditar={transaccionEditar} onSave={handleSaveTransaccion} onClose={() => { setModalTransaccion(false); setTransaccionEditar(null); }} />
        </Suspense>
      </Modal>

      <Modal isOpen={modalRecurrencia} onClose={() => { setModalRecurrencia(false); setRecurrenciaEditar(null); }} title={recurrenciaEditar ? 'Editar Recurrencia' : 'Nueva Recurrencia'}>
        <Suspense fallback={<LoadingSpinner />}>
          <FormularioRecurrencia recurrencia={recurrenciaEditar} tarjetas={userData.tarjetas} onSave={handleSaveRecurrencia} onDelete={handleDeleteRecurrencia} onClose={() => { setModalRecurrencia(false); setRecurrenciaEditar(null); }} />
        </Suspense>
      </Modal>

      <Modal isOpen={modalSimulador} onClose={() => { setModalSimulador(false); setSimulacionActual(null); setProyeccionSimulada(null); }} title="Simulador de Movimientos" size="lg">
        <Suspense fallback={<LoadingSpinner />}>
          <SimuladorMovimiento proyeccion={proyeccionSimulada} tarjetas={userData.tarjetas} onSimular={handleSimular} onCerrar={() => { setModalSimulador(false); setSimulacionActual(null); setProyeccionSimulada(null); }} />
        </Suspense>
      </Modal>

      <Modal isOpen={modalPagoTarjeta} onClose={() => { setModalPagoTarjeta(false); setTarjetaPagar(null); }} title={`Tarjeta: Pagar ${tarjetaPagar?.nombre || 'Tarjeta'}`}>
        <Suspense fallback={<LoadingSpinner />}>
          {tarjetaPagar && <FormularioPagoTarjeta tarjeta={tarjetaPagar} efectivoDisponible={efectivoDisponible} onPagar={handlePagarTarjeta} onClose={() => { setModalPagoTarjeta(false); setTarjetaPagar(null); }} />}
        </Suspense>
      </Modal>

      <Modal isOpen={modalPagoAdelantado} onClose={() => { setModalPagoAdelantado(false); setTransaccionPagarAdelantado(null); }} title="Tarjeta: Pago Adelantado de Cuotas">
        <Suspense fallback={<LoadingSpinner />}>
          {transaccionPagarAdelantado && <FormularioPagoAdelantado transaccion={transaccionPagarAdelantado} efectivoDisponible={efectivoDisponible} onPagar={handlePagarCuotasAdelantadas} onClose={() => { setModalPagoAdelantado(false); setTransaccionPagarAdelantado(null); }} />}
        </Suspense>
      </Modal>

      <Modal isOpen={modalMeta} onClose={() => { setModalMeta(false); setMetaEditar(null); }} title={metaEditar ? 'Editar Meta' : 'Nueva Meta de Ahorro'}>
        <Suspense fallback={<LoadingSpinner />}>
          <FormularioMeta meta={metaEditar} onSave={handleSaveMeta} onDelete={handleDeleteMeta} onClose={() => { setModalMeta(false); setMetaEditar(null); }} />
        </Suspense>
      </Modal>

      <Modal isOpen={modalAporteMeta} onClose={() => { setModalAporteMeta(false); setMetaAportar(null); }} title={`Monto: ${metaAportar?.nombre || 'Meta de Ahorro'}`}>
        <Suspense fallback={<LoadingSpinner />}>
          {metaAportar && <FormularioAporteMeta meta={metaAportar} disponibleParaAhorrar={disponibleParaAhorrar} onAportar={handleAportarMeta} onClose={() => { setModalAporteMeta(false); setMetaAportar(null); }} />}
        </Suspense>
      </Modal>

      {/* Modal Historial de Pagos Adelantados */}
      <Modal isOpen={modalHistorialCuotas} onClose={() => { setModalHistorialCuotas(false); setTransaccionHistorial(null); }} title="Historial de Pagos Adelantados">
        {transaccionHistorial && (
          <div className="space-y-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="font-bold text-lg text-gray-800">{transaccionHistorial.descripcion}</p>
              <p className="text-sm text-gray-600 mt-1">
                {transaccionHistorial.cuotasInfo.cuotasPagadas}/{transaccionHistorial.cuotasInfo.numeroCuotas} cuotas pagadas
              </p>
            </div>

            {transaccionHistorial.cuotasInfo.pagosAdelantados && transaccionHistorial.cuotasInfo.pagosAdelantados.length > 0 ? (
              <div className="space-y-3">
                {transaccionHistorial.cuotasInfo.pagosAdelantados.map((pago, idx) => (
                  <div key={idx} className="bg-green-50 p-4 rounded-lg border-l-4 border-green-500">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <p className="font-semibold text-gray-800">
                          {new Date(pago.fecha).toLocaleDateString('es-PE', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric'
                          })}
                        </p>
                        <p className="text-sm text-gray-600 mt-1">
                          {pago.cuotasPagadas} cuota(s) completa(s) pagada(s)
                          {pago.montoParcial > 0 && (
                            <span className="text-amber-600 font-semibold"> + pago parcial</span>
                          )}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-green-700 text-lg">
                          S/ {pago.montoTotal.toFixed(2)}
                        </p>
                        {pago.montoParcial > 0 && (
                          <p className="text-xs text-amber-600 mt-1">
                            (incluye S/ {pago.montoParcial.toFixed(2)} parcial)
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <p>No hay pagos adelantados registrados</p>
              </div>
            )}

            <button
              onClick={() => {
                setModalHistorialCuotas(false);
                setTransaccionHistorial(null);
              }}
              className="w-full mt-4 bg-gray-600 text-white py-3 rounded-xl hover:bg-gray-700 font-semibold transition-colors"
            >
              Cerrar
            </button>
          </div>
        )}
      </Modal>

      {/* Botones Flotantes Móviles */}
      <div className="fixed bottom-6 right-6 flex flex-col gap-3 lg:hidden z-30 safe-area-inset-bottom">
        <button
          onClick={() => {
            setTipoTransaccion('Gasto');
            setTransaccionEditar(null);
            setModalTransaccion(true);
          }}
          className="w-14 h-14 bg-gradient-to-br from-red-500 to-red-600 text-white rounded-full shadow-xl flex items-center justify-center active:scale-95 transition-transform"
          aria-label="Registrar gasto"
        >
          <Minus size={24} />
        </button>
        <button
          onClick={() => {
            setTipoTransaccion('Ingreso');
            setTransaccionEditar(null);
            setModalTransaccion(true);
          }}
          className="w-14 h-14 bg-gradient-to-br from-green-500 to-green-600 text-white rounded-full shadow-xl flex items-center justify-center active:scale-95 transition-transform"
          aria-label="Registrar ingreso"
        >
          <Plus size={24} />
        </button>
      </div>
    </div>
  );
};

export default Dashboard;
