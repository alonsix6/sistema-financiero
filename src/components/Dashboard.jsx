/**
 * Dashboard principal del sistema financiero
 * Contiene todas las vistas y funcionalidades principales
 */

import React, { useState, useEffect, useMemo } from 'react';
import { CATEGORIAS, TIPOS_INGRESO, BANCOS } from '../utils/constants.js';
import Calculations from '../utils/calculations.js';
import Modal from './Modal.jsx';
import GraficoCategorias from './GraficoCategorias.jsx';
import FormularioTarjeta from './forms/FormularioTarjeta.jsx';
import FormularioTransaccion from './forms/FormularioTransaccion.jsx';
import FormularioRecurrencia from './forms/FormularioRecurrencia.jsx';
import FormularioPagoTarjeta from './forms/FormularioPagoTarjeta.jsx';
import FormularioPagoAdelantado from './forms/FormularioPagoAdelantado.jsx';
import SimuladorMovimiento from './forms/SimuladorMovimiento.jsx';

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

  // Estados de Formularios
  const [tipoTransaccion, setTipoTransaccion] = useState('Gasto');
  const [tarjetaEditar, setTarjetaEditar] = useState(null);
  const [tarjetaPagar, setTarjetaPagar] = useState(null);
  const [transaccionEditar, setTransaccionEditar] = useState(null);
  const [transaccionPagarAdelantado, setTransaccionPagarAdelantado] = useState(null);
  const [recurrenciaEditar, setRecurrenciaEditar] = useState(null);
  const [simulacionActual, setSimulacionActual] = useState(null);
  const [proyeccionSimulada, setProyeccionSimulada] = useState(null);

  // Filtros de fecha
  const hoy = new Date();
  const primerDiaMes = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
  const [fechaInicio, setFechaInicio] = useState(primerDiaMes.toISOString().split('T')[0]);
  const [fechaFin, setFechaFin] = useState(hoy.toISOString().split('T')[0]);

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
    const transaccionPago = {
      id: Date.now(),
      tipo: 'PagoTarjeta',
      monto: monto,
      descripcion: `Pago ${tarjetaPagar.nombre}`,
      categoria: 'Pago Tarjeta',
      metodoPago: 'Efectivo',
      fecha: new Date().toISOString().split('T')[0],
      tarjetaId: tarjetaPagar.id
    };
    const tarjetasActualizadas = userData.tarjetas.map(t => {
      if (t.id === tarjetaPagar.id) {
        return { ...t, saldoActual: Math.max(0, t.saldoActual - monto) };
      }
      return t;
    });
    const nuevasTransacciones = [...userData.transacciones, transaccionPago];
    onUpdateData({ ...userData, transacciones: nuevasTransacciones, tarjetas: tarjetasActualizadas });
    setModalPagoTarjeta(false);
    setTarjetaPagar(null);
    alert(`✅ Pago de S/ ${monto.toFixed(2)} registrado correctamente`);
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
    if (!confirm('¿Eliminar esta transacción?')) return;
    const transaccion = userData.transacciones.find(t => t.id === id);
    let nuevasTarjetas = userData.tarjetas;
    if (transaccion && transaccion.tipo === 'Gasto' && transaccion.metodoPago !== 'Efectivo') {
      nuevasTarjetas = nuevasTarjetas.map(t => {
        if (t.id === parseInt(transaccion.metodoPago)) {
          return { ...t, saldoActual: Math.max(0, t.saldoActual - transaccion.monto) };
        }
        return t;
      });
    }
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

  // Handler de Pago Adelantado de Cuotas
  const handlePagarCuotasAdelantadas = (cuotasAPagar, montoTotal) => {
    if (!transaccionPagarAdelantado) return;

    // Crear transacción de pago adelantado
    const transaccionPago = {
      id: Date.now(),
      tipo: 'PagoTarjeta',
      monto: montoTotal,
      descripcion: `Pago adelantado ${transaccionPagarAdelantado.descripcion} (${cuotasAPagar} cuotas)`,
      categoria: 'Pago Cuotas Adelantadas',
      metodoPago: 'Efectivo',
      fecha: new Date().toISOString().split('T')[0],
      tarjetaId: parseInt(transaccionPagarAdelantado.metodoPago),
      esPagoAdelantado: true,
      transaccionOriginalId: transaccionPagarAdelantado.id
    };

    // Actualizar la transacción con cuotas
    const transaccionesActualizadas = userData.transacciones.map(t => {
      if (t.id === transaccionPagarAdelantado.id) {
        const cuotasPagadasAntes = t.cuotasInfo.cuotasPagadas;
        // Marcar cuotas como pagadas
        const nuevasFechasCobro = t.cuotasInfo.fechasCobro.map((cuota, idx) => {
          if (idx >= cuotasPagadasAntes && idx < cuotasPagadasAntes + cuotasAPagar) {
            return { ...cuota, estado: 'pagada' };
          }
          return cuota;
        });

        return {
          ...t,
          cuotasInfo: {
            ...t.cuotasInfo,
            cuotasPagadas: t.cuotasInfo.cuotasPagadas + cuotasAPagar,
            cuotasRestantes: t.cuotasInfo.cuotasRestantes - cuotasAPagar,
            fechasCobro: nuevasFechasCobro
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

    alert(`✅ Pago adelantado registrado correctamente\n\n💳 ${cuotasAPagar} cuota(s) pagadas\n💰 S/ ${montoTotal.toFixed(2)} liberados de tu tarjeta`);
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
              {darkMode ? '☀️' : '🌙'}
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
        <div className="max-w-7xl mx-auto px-4 flex gap-1 overflow-x-auto">
          {['inicio', 'tarjetas', 'transacciones', 'proyección', 'recurrencias'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-4 font-medium capitalize whitespace-nowrap ${
                activeTab === tab
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : textSecondaryClass
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Vista Inicio */}
        {activeTab === 'inicio' && (
          <div className="space-y-8">
            {/* Filtro de Período */}
            <div className={`${cardClass} rounded-2xl shadow-lg p-6`}>
              <h3 className={`text-lg font-bold mb-4 ${textClass}`}>📅 Filtrar Período</h3>
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
              <h2 className={`text-lg font-bold mb-4 ${textClass}`}>💼 Resumen del Período Seleccionado</h2>
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
              <h2 className={`text-lg font-bold mb-4 ${textClass}`}>💵 Efectivo Disponible</h2>
              <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl shadow-lg p-8 text-white">
                <p className="text-sm opacity-80 mb-2">Dinero que puedes mover ahora</p>
                <p className="text-5xl font-bold mb-3">S/ {efectivoDisponible.toFixed(2)}</p>
                <p className="text-xs opacity-80">
                  ✅ Este es tu saldo real en efectivo (ingresos - gastos en efectivo - pagos de tarjetas)
                </p>
              </div>
            </div>

            {/* Cashflow Total */}
            <div>
              <h2 className={`text-lg font-bold mb-4 ${textClass}`}>🦋 Cashflow Total (Todo el Histórico)</h2>
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
                    {cashflowTotal.cashflowNeto >= 0 ? '✓ Superávit' : '⚠️ Déficit'}
                  </p>
                </div>
              </div>
            </div>

            {/* Próximos Pagos */}
            {proximosPagos.length > 0 && (
              <div className={`${cardClass} rounded-2xl shadow-lg p-6`}>
                <h2 className={`text-xl font-bold mb-4 ${textClass}`}>📅 Próximos Pagos de Tarjetas</h2>
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
                          💳 Pagar
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
                  📊 Gastos por Categoría (Período Seleccionado)
                </h2>
                <GraficoCategorias gastosPorCategoria={gastosPorCategoria} />
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
                <span className="text-4xl block mb-2">💰</span>
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
                <span className="text-4xl block mb-2">💵</span>
                <p className={`font-semibold ${textClass}`}>Registrar Ingreso</p>
              </button>
            </div>
          </div>
        )}

        {/* Vista Tarjetas */}
        {activeTab === 'tarjetas' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className={`text-2xl font-bold ${textClass}`}>💳 Mis Tarjetas</h2>
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
                <span className="text-6xl block mb-4">💳</span>
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
                          <span>📅 Cierre: día {tarjeta.fechaCierre}</span>
                          <span>💳 Pago: día {tarjeta.fechaPago}</span>
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
              <h2 className={`text-2xl font-bold ${textClass}`}>📊 Movimientos</h2>
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
                <span className="text-6xl block mb-4">📊</span>
                <h3 className={`text-xl font-bold mb-2 ${textClass}`}>No hay transacciones</h3>
                <p className={textSecondaryClass}>Comienza registrando tus movimientos</p>
              </div>
            ) : (
              <div className={`${cardClass} rounded-2xl shadow-lg overflow-hidden`}>
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
                      {[...userData.transacciones].sort((a, b) => new Date(b.fecha) - new Date(a.fecha)).slice(0, 100).map((t) => {
                        const categoria = CATEGORIAS.find(c => c.valor === t.categoria) || TIPOS_INGRESO.find(c => c.valor === t.categoria);
                        const fechaLocal = new Date(t.fecha + 'T12:00:00');
                        return (
                          <tr key={t.id} className={darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'}>
                            <td className={`px-6 py-4 whitespace-nowrap text-sm ${textSecondaryClass}`}>
                              {fechaLocal.toLocaleDateString('es-PE')}
                              {t.esRecurrente && <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">♻️</span>}
                              {t.tipo === 'PagoTarjeta' && !t.esPagoAdelantado && <span className="ml-2 text-xs bg-green-100 text-green-800 px-2 py-1 rounded">💳</span>}
                              {t.esCuotas && <span className="ml-2 text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded font-semibold">💳 {t.cuotasInfo.cuotasPagadas}/{t.cuotasInfo.numeroCuotas} cuotas</span>}
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
                                    💳 Pagar {t.cuotasInfo.cuotasRestantes} cuota(s) adelantada(s)
                                  </button>
                                )}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                              <span className="inline-flex items-center gap-2">
                                <span>{categoria?.icono || '💳'}</span>
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
                                🗑️
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Vista Proyección */}
        {activeTab === 'proyección' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className={`text-2xl font-bold ${textClass}`}>🔮 Proyección Financiera (6 meses)</h2>
              <button
                onClick={() => {
                  setModalSimulador(true);
                  setSimulacionActual(null);
                  setProyeccionSimulada(null);
                }}
                className="px-6 py-3 bg-purple-500 text-white rounded-xl hover:bg-purple-600"
              >
                🔮 Simular Movimiento
              </button>
            </div>

            <div className={`${cardClass} rounded-2xl shadow-lg p-6`}>
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
                <p className="text-sm text-blue-800">
                  <strong>💡 Nota importante:</strong> Esta proyección usa tu <strong>efectivo disponible</strong> como base (S/ {proyeccion.saldoInicial.toFixed(2)}). Solo considera movimientos en efectivo: ingresos recurrentes y pagos de tarjetas programados.
                </p>
              </div>

              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className={`text-lg font-bold ${textClass}`}>💰 Efectivo Actual</h3>
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
                          {e.esCuota && <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded font-semibold">💳 Cuota</span>}
                        </div>
                        <p className="text-sm text-gray-600 mt-1">
                          📅 {e.fecha.toLocaleDateString('es-PE', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}
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
                  <p className="font-bold text-red-800 mb-2">⚠️ Alertas de Déficit</p>
                  <p className="text-sm text-red-700">
                    Tienes {proyeccion.eventos.filter(e => e.color === 'rojo').length} pagos en riesgo. Considera priorizar pagos, ajustar gastos o buscar ingresos adicionales.
                  </p>
                </div>
              )}
            </div>
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
                  💡 <strong>Nota:</strong> Las recurrencias se registran automáticamente cuando llega la fecha configurada. No necesitas agregarlas manualmente para evitar duplicados.
                </p>
              </div>

              {(!userData.recurrencias || userData.recurrencias.length === 0) ? (
                <div className="text-center py-12">
                  <span className="text-6xl block mb-4">📅</span>
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
                              <span className="text-2xl">{esIngreso ? '💰' : '💸'}</span>
                              <h3 className={`text-lg font-bold ${textClass}`}>{rec.descripcion}</h3>
                            </div>
                            <p className={`text-sm ${textSecondaryClass}`}>
                              Cada día <span className="font-bold">{rec.dia}</span> del mes
                            </p>
                          </div>
                          <div className={`px-3 py-1 rounded-full text-xs font-bold ${
                            rec.activo ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'
                          }`}>
                            {rec.activo ? '✓ Activo' : 'Inactivo'}
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
                                <span className={`text-sm ${textClass}`}>{tarjeta ? `💳 ${tarjeta.nombre}` : '💵 Efectivo'}</span>
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

      {/* Modales */}
      <Modal isOpen={modalTarjeta} onClose={() => { setModalTarjeta(false); setTarjetaEditar(null); }} title={tarjetaEditar ? 'Editar Tarjeta' : 'Nueva Tarjeta'}>
        <FormularioTarjeta tarjeta={tarjetaEditar} onSave={handleSaveTarjeta} onDelete={handleDeleteTarjeta} onClose={() => { setModalTarjeta(false); setTarjetaEditar(null); }} />
      </Modal>

      <Modal isOpen={modalTransaccion} onClose={() => { setModalTransaccion(false); setTransaccionEditar(null); }} title={transaccionEditar ? `Editar ${tipoTransaccion}` : `Registrar ${tipoTransaccion}`}>
        <FormularioTransaccion tipo={tipoTransaccion} tarjetas={userData.tarjetas} transaccionEditar={transaccionEditar} onSave={handleSaveTransaccion} onClose={() => { setModalTransaccion(false); setTransaccionEditar(null); }} />
      </Modal>

      <Modal isOpen={modalRecurrencia} onClose={() => { setModalRecurrencia(false); setRecurrenciaEditar(null); }} title={recurrenciaEditar ? 'Editar Recurrencia' : 'Nueva Recurrencia'}>
        <FormularioRecurrencia recurrencia={recurrenciaEditar} tarjetas={userData.tarjetas} onSave={handleSaveRecurrencia} onDelete={handleDeleteRecurrencia} onClose={() => { setModalRecurrencia(false); setRecurrenciaEditar(null); }} />
      </Modal>

      <Modal isOpen={modalSimulador} onClose={() => { setModalSimulador(false); setSimulacionActual(null); setProyeccionSimulada(null); }} title="🔮 Simulador de Movimientos" size="lg">
        <SimuladorMovimiento proyeccion={proyeccionSimulada} tarjetas={userData.tarjetas} onSimular={handleSimular} onCerrar={() => { setModalSimulador(false); setSimulacionActual(null); setProyeccionSimulada(null); }} />
      </Modal>

      <Modal isOpen={modalPagoTarjeta} onClose={() => { setModalPagoTarjeta(false); setTarjetaPagar(null); }} title={`💳 Pagar ${tarjetaPagar?.nombre || 'Tarjeta'}`}>
        {tarjetaPagar && <FormularioPagoTarjeta tarjeta={tarjetaPagar} efectivoDisponible={efectivoDisponible} onPagar={handlePagarTarjeta} onClose={() => { setModalPagoTarjeta(false); setTarjetaPagar(null); }} />}
      </Modal>

      <Modal isOpen={modalPagoAdelantado} onClose={() => { setModalPagoAdelantado(false); setTransaccionPagarAdelantado(null); }} title="💳 Pago Adelantado de Cuotas">
        {transaccionPagarAdelantado && <FormularioPagoAdelantado transaccion={transaccionPagarAdelantado} efectivoDisponible={efectivoDisponible} onPagar={handlePagarCuotasAdelantadas} onClose={() => { setModalPagoAdelantado(false); setTransaccionPagarAdelantado(null); }} />}
      </Modal>

      {/* Botones Flotantes Móviles */}
      <div className="fixed bottom-6 right-6 flex flex-col gap-3 lg:hidden z-30">
        <button
          onClick={() => {
            setTipoTransaccion('Gasto');
            setTransaccionEditar(null);
            setModalTransaccion(true);
          }}
          className="w-14 h-14 bg-red-500 text-white rounded-full shadow-xl"
        >
          ➖
        </button>
        <button
          onClick={() => {
            setTipoTransaccion('Ingreso');
            setTransaccionEditar(null);
            setModalTransaccion(true);
          }}
          className="w-14 h-14 bg-green-500 text-white rounded-full shadow-xl"
        >
          ➕
        </button>
      </div>
    </div>
  );
};

export default Dashboard;
