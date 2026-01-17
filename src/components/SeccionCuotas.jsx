/**
 * Sección consolidada de cuotas
 * Muestra resumen, detalles por tarjeta y timeline de próximas cuotas
 */

import React, { useMemo } from 'react';
import * as Icons from 'lucide-react';

const SeccionCuotas = ({ transacciones, tarjetas, efectivoDisponible, onPagarCuotas }) => {

  // Calcular resumen de cuotas
  const resumenCuotas = useMemo(() => {
    const comprasConCuotas = transacciones.filter(t => t.esCuotas && t.cuotasInfo.cuotasRestantes > 0);

    if (comprasConCuotas.length === 0) {
      return null;
    }

    // Totales
    const totalMontoOriginal = comprasConCuotas.reduce((sum, t) => sum + t.monto, 0);
    const totalSaldoPendiente = comprasConCuotas.reduce((sum, t) => {
      // Calcular saldo pendiente considerando cuotas parciales
      let saldo = 0;
      t.cuotasInfo.fechasCobro.forEach(cuota => {
        if (cuota.estado === 'pendiente') {
          saldo += cuota.monto || t.cuotasInfo.montoPorCuota;
        } else if (cuota.estado === 'parcial') {
          saldo += cuota.montoPendiente || 0;
        }
      });
      return sum + saldo;
    }, 0);
    const totalCuotasRestantes = comprasConCuotas.reduce((sum, t) => sum + t.cuotasInfo.cuotasRestantes, 0);

    // Próximas cuotas por mes
    const proximasCuotas = {};

    comprasConCuotas.forEach(t => {
      const tarjeta = tarjetas.find(tj => tj.id === parseInt(t.metodoPago));

      t.cuotasInfo.fechasCobro.forEach(cuota => {
        if (cuota.estado === 'pendiente' || cuota.estado === 'parcial') {
          const fecha = cuota.fecha;
          const mes = fecha.substring(0, 7); // YYYY-MM

          if (!proximasCuotas[mes]) {
            proximasCuotas[mes] = {
              fecha: fecha,
              transacciones: [],
              totalMes: 0
            };
          }

          const montoCuota = cuota.estado === 'parcial'
            ? (cuota.montoPendiente || cuota.monto)
            : (cuota.monto || t.cuotasInfo.montoPorCuota);

          proximasCuotas[mes].transacciones.push({
            id: t.id,
            descripcion: t.descripcion,
            numeroCuota: cuota.cuota,
            totalCuotas: t.cuotasInfo.numeroCuotas,
            monto: montoCuota,
            tarjeta: tarjeta?.nombre || 'Tarjeta',
            estado: cuota.estado,
            fechaCobro: cuota.fecha
          });

          proximasCuotas[mes].totalMes += montoCuota;
        }
      });
    });

    // Convertir a array y ordenar por fecha
    const proximasCuotasArray = Object.values(proximasCuotas)
      .sort((a, b) => new Date(a.fecha) - new Date(b.fecha))
      .slice(0, 6); // Solo próximos 6 meses

    // Por tarjeta
    const porTarjeta = tarjetas.map(tarjeta => {
      const comprasTarjeta = comprasConCuotas.filter(t => parseInt(t.metodoPago) === tarjeta.id);

      if (comprasTarjeta.length === 0) return null;

      const totalBloqueado = comprasTarjeta.reduce((sum, t) => {
        let saldo = 0;
        t.cuotasInfo.fechasCobro.forEach(cuota => {
          if (cuota.estado === 'pendiente') {
            saldo += cuota.monto || t.cuotasInfo.montoPorCuota;
          } else if (cuota.estado === 'parcial') {
            saldo += cuota.montoPendiente || 0;
          }
        });
        return sum + saldo;
      }, 0);
      const cuotasRestantes = comprasTarjeta.reduce((sum, t) => sum + t.cuotasInfo.cuotasRestantes, 0);

      // Encontrar próxima cuota
      let proximaCuota = null;
      comprasTarjeta.forEach(t => {
        t.cuotasInfo.fechasCobro.forEach(c => {
          if (c.estado === 'pendiente' || c.estado === 'parcial') {
            const monto = c.estado === 'parcial' ? (c.montoPendiente || c.monto) : (c.monto || t.cuotasInfo.montoPorCuota);
            if (!proximaCuota || new Date(c.fecha) < new Date(proximaCuota.fecha)) {
              proximaCuota = {
                fecha: c.fecha,
                monto: monto
              };
            }
          }
        });
      });

      return {
        tarjetaId: tarjeta.id,
        tarjetaNombre: tarjeta.nombre,
        comprasEnCuotas: comprasTarjeta.length,
        totalBloqueado,
        cuotasRestantes,
        proximaCuota
      };
    }).filter(Boolean);

    return {
      totalActivasEnCuotas: comprasConCuotas.length,
      totalMontoOriginal,
      totalSaldoPendiente,
      totalCuotasRestantes,
      proximasCuotas: proximasCuotasArray,
      porTarjeta
    };
  }, [transacciones, tarjetas]);

  // Función para exportar cronograma
  const exportarCronograma = () => {
    const comprasConCuotas = transacciones.filter(t => t.esCuotas && t.cuotasInfo.cuotasRestantes > 0);

    let csv = 'Fecha,Descripción,Tarjeta,Cuota,Monto,Estado\n';

    comprasConCuotas.forEach(t => {
      const tarjeta = tarjetas.find(tj => tj.id === parseInt(t.metodoPago));

      t.cuotasInfo.fechasCobro.forEach(c => {
        if (c.estado === 'pendiente' || c.estado === 'parcial') {
          const monto = c.estado === 'parcial' ? (c.montoPendiente || c.monto) : (c.monto || t.cuotasInfo.montoPorCuota);
          csv += `${c.fecha},${t.descripcion},${tarjeta?.nombre || 'Tarjeta'},${c.cuota}/${t.cuotasInfo.numeroCuotas},${monto.toFixed(2)},${c.estado}\n`;
        }
      });
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `cronograma_cuotas_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  if (!resumenCuotas) {
    return (
      <div className="bg-white p-8 rounded-lg shadow text-center">
        <div className="text-gray-300 mb-4"><Icons.CreditCard size={64} /></div>
        <p className="text-gray-500 text-lg">No tienes compras en cuotas activas</p>
        <p className="text-gray-400 text-sm mt-2">Las compras que hagas en cuotas aparecerán aquí</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Resumen General */}
      <div className="bg-gradient-to-r from-purple-500 to-purple-700 text-white p-6 rounded-lg shadow-xl">
        <div className="flex justify-between items-start mb-4">
          <h2 className="text-2xl font-bold">Resumen de Cuotas</h2>
          <button
            onClick={exportarCronograma}
            className="bg-white text-purple-700 px-4 py-2 rounded-lg hover:bg-purple-50 transition-colors font-semibold text-sm"
          >
            Exportar CSV
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white/10 p-4 rounded-lg backdrop-blur">
            <p className="text-purple-200 text-sm mb-1">Compras Activas</p>
            <p className="text-4xl font-bold">{resumenCuotas.totalActivasEnCuotas}</p>
          </div>
          <div className="bg-white/10 p-4 rounded-lg backdrop-blur">
            <p className="text-purple-200 text-sm mb-1">Saldo Pendiente</p>
            <p className="text-4xl font-bold">S/ {resumenCuotas.totalSaldoPendiente.toFixed(2)}</p>
          </div>
          <div className="bg-white/10 p-4 rounded-lg backdrop-blur">
            <p className="text-purple-200 text-sm mb-1">Cuotas Restantes</p>
            <p className="text-4xl font-bold">{resumenCuotas.totalCuotasRestantes}</p>
          </div>
        </div>
      </div>

      {/* Por Tarjeta */}
      <div>
        <h3 className="text-xl font-bold mb-4 text-gray-800">Por Tarjeta</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {resumenCuotas.porTarjeta.map(t => (
            <div key={t.tarjetaId} className="bg-white p-5 rounded-xl shadow-md border-l-4 border-purple-500 hover:shadow-lg transition-shadow">
              <h4 className="font-bold text-lg mb-3 text-gray-800">{t.tarjetaNombre}</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Compras en cuotas:</span>
                  <span className="font-semibold text-gray-900">{t.comprasEnCuotas}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Crédito bloqueado:</span>
                  <span className="font-semibold text-purple-700">S/ {t.totalBloqueado.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Cuotas restantes:</span>
                  <span className="font-semibold text-gray-900">{t.cuotasRestantes}</span>
                </div>
                {t.proximaCuota && (
                  <div className="mt-3 pt-3 border-t border-gray-200">
                    <p className="text-xs text-gray-500 mb-1">Próxima cuota:</p>
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-gray-600">{new Date(t.proximaCuota.fecha).toLocaleDateString('es-PE')}</span>
                      <span className="font-bold text-purple-700">S/ {t.proximaCuota.monto.toFixed(2)}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Próximas Cuotas (Timeline) */}
      <div>
        <h3 className="text-xl font-bold mb-4 text-gray-800">Proximas Cuotas (6 meses)</h3>
        <div className="space-y-4">
          {resumenCuotas.proximasCuotas.map((mes, idx) => (
            <div key={idx} className="bg-white p-5 rounded-xl shadow-md hover:shadow-lg transition-shadow">
              <div className="flex justify-between items-center mb-4">
                <h4 className="font-bold text-lg text-gray-800">
                  {new Date(mes.fecha).toLocaleDateString('es-PE', { year: 'numeric', month: 'long' })}
                </h4>
                <span className="text-2xl font-bold text-purple-700">
                  S/ {mes.totalMes.toFixed(2)}
                </span>
              </div>

              <div className="space-y-2">
                {mes.transacciones.map((t, tidx) => (
                  <div key={tidx} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900">{t.descripcion}</p>
                      <p className="text-xs text-gray-500">
                        {t.tarjeta} • Cuota {t.numeroCuota}/{t.totalCuotas}
                        {t.estado === 'parcial' && (
                          <span className="ml-2 text-amber-600 font-semibold">Parcial</span>
                        )}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-purple-700 text-lg">S/ {t.monto.toFixed(2)}</p>
                      <button
                        onClick={() => onPagarCuotas(transacciones.find(tr => tr.id === t.id))}
                        className="text-xs text-accent hover:text-accent/80 hover:underline font-medium mt-1"
                      >
                        Pagar ahora →
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SeccionCuotas;
